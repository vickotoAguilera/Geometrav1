// Generador de ejercicios usando IA (Gemini)

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { DragDropExercise, FillInBlanksExercise } from '@/types/exercises';
import { getSubjectById } from '@/data/curriculum';

// Schema para ejercicio drag-drop generado por IA
const DragDropExerciseSchema = z.object({
    id: z.string(),
    type: z.literal('drag-drop'),
    title: z.string(),
    description: z.string(),
    points: z.number(),
    difficulty: z.enum(['facil', 'medio', 'dificil']),
    items: z.array(z.object({
        id: z.string(),
        content: z.string(),
        correctPosition: z.number(),
    })),
}).passthrough(); // Permitir campos adicionales como hints

// Schema para ejercicio fill-in-blanks generado por IA
const FillInBlanksExerciseSchema = z.object({
    id: z.string(),
    type: z.literal('fill-in-blanks'),
    title: z.string(),
    description: z.string(),
    points: z.number(),
    difficulty: z.enum(['facil', 'medio', 'dificil']),
    template: z.string(),
    blanks: z.array(z.object({
        id: z.string(),
        correctAnswer: z.union([z.string(), z.array(z.string())]),
        tolerance: z.number().optional(),
    })),
}).passthrough(); // Permitir campos adicionales como hints

// Union schema
const ExerciseSchema = z.union([DragDropExerciseSchema, FillInBlanksExerciseSchema]);

interface GenerateExercisesInput {
    gradeId: string;
    subjectId: string;
    type: 'drag-drop' | 'fill-in-blanks' | 'mixed';
    count: number;
    difficulty?: 'facil' | 'medio' | 'dificil';
}

/**
 * Genera ejercicios usando IA
 */
export async function generateExercises(input: GenerateExercisesInput) {
    const { gradeId, subjectId, type, count, difficulty = 'medio' } = input;

    // Obtener información de la materia
    const subject = getSubjectById(gradeId, subjectId);
    if (!subject) {
        throw new Error(`Subject not found: ${gradeId}/${subjectId}`);
    }

    const exercises: (DragDropExercise | FillInBlanksExercise)[] = [];

    // Generar ejercicios uno por uno (o en batches de 3-5)
    const batchSize = 3;
    const batches = Math.ceil(count / batchSize);

    for (let i = 0; i < batches; i++) {
        const remaining = count - exercises.length;
        const currentBatchSize = Math.min(batchSize, remaining);

        // Usar topics si existen, sino usar la descripción de la materia
        const topics = (subject as any).topics || [subject.description || subject.name];
        const prompt = createGenerationPrompt(subject.name, topics, type, currentBatchSize, difficulty);

        try {
            // Usar sistema de fallback de API keys
            const { generateWithFallback } = await import('@/ai/api-key-fallback');

            let result = await generateWithFallback({
                model: 'googleai/gemini-2.0-flash-001',
                prompt,
                config: {
                    temperature: 0.9, // Alta creatividad para ejercicios variados
                },
            });

            // Parsear respuesta JSON con auto-corrección
            let responseText = result.text;
            let jsonMatch = responseText.match(/\[[\s\S]*\]/);

            if (!jsonMatch) {
                console.error('No JSON found in response:', responseText.substring(0, 200));
                continue;
            }

            let parsedExercises = null;
            let retryCount = 0;
            const MAX_RETRIES = 2;

            while (parsedExercises === null && retryCount <= MAX_RETRIES) {
                try {
                    // Intentar parsear
                    if (retryCount === 0) {
                        // Primer intento: parsear directamente
                        parsedExercises = JSON.parse(jsonMatch[0]);
                        console.log('✅ JSON parseado exitosamente');
                    } else {
                        // Intentos posteriores: limpiar primero
                        let cleanedJson = jsonMatch[0]
                            .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios /* */
                            .replace(/\/\/.*/g, '') // Remover comentarios //
                            .replace(/,(\s*[}\]])/g, '$1') // Remover trailing commas
                            .replace(/\n/g, ' ') // Remover saltos de línea
                            .replace(/\s+/g, ' '); // Normalizar espacios

                        parsedExercises = JSON.parse(cleanedJson);
                        console.log('✅ JSON limpiado y parseado exitosamente');
                    }
                } catch (parseError: any) {
                    retryCount++;

                    if (retryCount > MAX_RETRIES) {
                        // ÚLTIMO RECURSO: Pedir a la IA que corrija el JSON
                        console.error('❌ JSON parsing falló después de limpieza');
                        console.error('🤖 Pidiendo a la IA que corrija el JSON...');

                        const fixPrompt = `El siguiente JSON está malformado y necesita ser corregido. 
Devuelve SOLO el JSON corregido, sin explicaciones ni texto adicional.

JSON malformado:
${jsonMatch[0]}

Error: ${parseError.message}

Instrucciones:
1. Corrige el JSON para que sea válido
2. Asegúrate de que todas las comillas estén correctamente cerradas
3. Remueve trailing commas
4. Asegúrate de que la estructura sea un array válido
5. Devuelve SOLO el JSON corregido, nada más`;

                        try {
                            const fixResult = await generateWithFallback({
                                model: 'googleai/gemini-2.0-flash-001',
                                prompt: fixPrompt,
                                config: {
                                    temperature: 0.1, // Baja temperatura para corrección precisa
                                },
                            });

                            const fixedJsonMatch = fixResult.text.match(/\[[\s\S]*\]/);
                            if (fixedJsonMatch) {
                                parsedExercises = JSON.parse(fixedJsonMatch[0]);
                                console.log('✅ IA corrigió el JSON exitosamente');
                            } else {
                                throw new Error('IA no pudo generar JSON válido');
                            }
                        } catch (fixError) {
                            // ERROR FATAL: No se pudo corregir el JSON
                            console.error('');
                            console.error('═'.repeat(70));
                            console.error('❌ ERROR FATAL: No se pudo parsear ni corregir el JSON');
                            console.error('═'.repeat(70));
                            console.error('JSON problemático:', jsonMatch[0].substring(0, 500));
                            console.error('Error original:', parseError.message);
                            console.error('Error de corrección:', fixError);
                            console.error('');
                            console.error('🛑 DETENIENDO PROCESO - Requiere intervención manual');
                            console.error('═'.repeat(70));

                            throw new Error(`FATAL: JSON parsing failed after ${MAX_RETRIES + 1} attempts including AI correction`);
                        }
                    } else {
                        console.warn(`⚠️ Intento ${retryCount}/${MAX_RETRIES} de parsing falló, reintentando...`);
                    }
                }
            }

            if (parsedExercises) {
                // Validar y agregar ejercicios
                let validCount = 0;
                const batchStartCount = exercises.length;

                for (const ex of parsedExercises) {
                    try {
                        const validated = ExerciseSchema.parse(ex);
                        exercises.push(validated as DragDropExercise | FillInBlanksExercise);
                        validCount++;
                    } catch (error) {
                        console.error('Invalid exercise schema:', error);
                    }
                }

                console.log(`✅ ${validCount}/${parsedExercises.length} ejercicios válidos agregados`);

                // Verificar si recibimos suficientes ejercicios
                const expectedMin = Math.max(1, Math.floor(currentBatchSize * 0.66)); // Al menos 66% de lo pedido
                if (validCount < expectedMin && validCount < currentBatchSize) {
                    console.warn(`⚠️ Solo se generaron ${validCount}/${currentBatchSize} ejercicios esperados`);
                    console.warn(`🔄 Regenerando para completar el lote...`);

                    // Calcular cuántos faltan
                    const missing = currentBatchSize - validCount;

                    // Reintentar generar los faltantes (máximo 1 reintento)
                    try {
                        const retryResult = await generateWithFallback({
                            model: 'googleai/gemini-2.0-flash-001',
                            prompt: prompt.replace(`Genera exactamente ${currentBatchSize}`, `Genera exactamente ${missing}`),
                            config: {
                                temperature: 0.9,
                            },
                        });

                        const retryJsonMatch = retryResult.text.match(/\[[\s\S]*\]/);
                        if (retryJsonMatch) {
                            try {
                                const retryParsed = JSON.parse(retryJsonMatch[0]);
                                let retryCount = 0;
                                for (const ex of retryParsed) {
                                    try {
                                        const validated = ExerciseSchema.parse(ex);
                                        exercises.push(validated as DragDropExercise | FillInBlanksExercise);
                                        retryCount++;
                                    } catch (error) {
                                        console.error('Invalid retry exercise:', error);
                                    }
                                }
                                console.log(`✅ Regenerados ${retryCount} ejercicios adicionales`);
                            } catch (retryParseError) {
                                console.warn('⚠️ No se pudieron parsear ejercicios de reintento, continuando...');
                            }
                        }
                    } catch (retryError) {
                        console.warn('⚠️ Reintento falló, continuando con los ejercicios actuales');
                    }
                }
            }
        } catch (error) {
            console.error('Error generating exercises:', error);
        }
    }

    return exercises.slice(0, count); // Asegurar que no excedamos el count
}

/**
 * Crea el prompt para generar ejercicios
 */
function createGenerationPrompt(
    subjectName: string,
    topics: string[],
    type: 'drag-drop' | 'fill-in-blanks' | 'mixed',
    count: number,
    difficulty: 'facil' | 'medio' | 'dificil'
): string {
    const difficultyDescriptions = {
        facil: 'Nivel básico, conceptos fundamentales, pasos simples',
        medio: 'Nivel intermedio, requiere razonamiento, múltiples pasos',
        dificil: 'Nivel avanzado, conceptos complejos, requiere análisis profundo',
    };

    const typeInstructions = {
        'drag-drop': `
Tipo: DRAG-DROP (Ordenar pasos)
- Crear ejercicios donde el estudiante debe ordenar pasos de una solución
- Cada ejercicio debe tener 4-6 items para ordenar
- Los items deben estar mezclados (no en orden)
- Incluir explicaciones breves en cada paso
Formato:
{
  "id": "unique-id",
  "type": "drag-drop",
  "title": "Título del ejercicio",
  "description": "Descripción breve",
  "points": 10,
  "difficulty": "${difficulty}",
  "items": [
    { "id": "1", "content": "Paso 1 con explicación", "correctPosition": 0 },
    { "id": "2", "content": "Paso 2 con explicación", "correctPosition": 1 },
    ...
  ]
}`,
        'fill-in-blanks': `
Tipo: FILL-IN-BLANKS (Completar espacios)
- Crear ejercicios donde el estudiante completa espacios en blanco
- Usar [___] para marcar espacios en blanco en el template
- Cada ejercicio debe tener 4-8 espacios para completar
- Las respuestas pueden ser numéricas o textuales
Formato:
{
  "id": "unique-id",
  "type": "fill-in-blanks",
  "title": "Título del ejercicio",
  "description": "Descripción breve",
  "points": 15,
  "difficulty": "${difficulty}",
  "template": "Texto con [___] espacios [___] en blanco",
  "blanks": [
    { "id": "b1", "correctAnswer": "respuesta1" },
    { "id": "b2", "correctAnswer": "respuesta2", "tolerance": 0.01 },
    ...
  ]
}`,
        mixed: `
Tipo: MIXTO (50% drag-drop, 50% fill-in-blanks)
Alterna entre ambos tipos de ejercicios.`,
    };

    return `Eres un experto en educación matemática chilena. Genera ${count} ejercicios interactivos de **${subjectName}**.

**Temas a cubrir**: ${topics.join(', ')}

**Dificultad**: ${difficultyDescriptions[difficulty]}

${typeInstructions[type]}

**REQUISITOS IMPORTANTES**:
1. **CADA EJERCICIO DEBE INCLUIR UN EJEMPLO EXPLICATIVO** en la descripción
2. El ejemplo debe mostrar un caso similar resuelto paso a paso
3. La descripción debe tener el formato: "Ejemplo: [caso resuelto]. Ahora resuelve: [ejercicio]"
4. Los ejercicios deben ser educativos y desafiantes
5. Usar contextos reales cuando sea posible
6. Las respuestas deben ser verificables automáticamente
7. Variar los temas entre ejercicios
8. IDs únicos para cada ejercicio (usar timestamp + random)
9. Puntos: 10 para fácil, 15 para medio, 20 para difícil

**EJEMPLO DE DESCRIPCIÓN CON EXPLICACIÓN**:
"Ejemplo: Para resolver 2x + 3 = 7, primero restamos 3 de ambos lados: 2x = 4, luego dividimos entre 2: x = 2. 

Ahora resuelve la siguiente ecuación siguiendo los mismos pasos."

**FORMATO DE SALIDA**:
Responde SOLO con un array JSON válido de ejercicios, sin texto adicional.

Ejemplo:
[
  { ejercicio 1 },
  { ejercicio 2 },
  ...
]

Genera exactamente ${count} ejercicios ahora.`;
}

/**
 * Genera ejercicios mixtos combinando todas las materias de un curso
 */
export async function generateMixedExercises(gradeId: string, count: number = 50) {
    const { getSubjectsByGrade } = await import('@/data/curriculum');
    const subjects = getSubjectsByGrade(gradeId);

    if (subjects.length === 0) {
        throw new Error(`No subjects found for grade: ${gradeId}`);
    }

    // Calcular distribución proporcional de ejercicios por materia
    const exercisesPerSubject = Math.floor(count / subjects.length);
    const remainder = count % subjects.length;

    const allExercises: (DragDropExercise | FillInBlanksExercise)[] = [];

    // Distribución de dificultades: 30% fácil, 50% medio, 20% difícil
    const difficulties: ('facil' | 'medio' | 'dificil')[] = [
        ...Array(Math.floor(count * 0.3)).fill('facil'),
        ...Array(Math.floor(count * 0.5)).fill('medio'),
        ...Array(Math.floor(count * 0.2)).fill('dificil'),
    ];

    // Rellenar hasta count si hay diferencia por redondeo
    while (difficulties.length < count) {
        difficulties.push('medio');
    }

    // Mezclar dificultades
    shuffleArray(difficulties);

    let difficultyIndex = 0;

    // Generar ejercicios para cada materia
    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];
        // Dar ejercicios extra a las primeras materias si hay remainder
        const subjectCount = exercisesPerSubject + (i < remainder ? 1 : 0);

        if (subjectCount === 0) continue;

        // Alternar entre tipos de ejercicios (50% cada uno)
        const dragDropCount = Math.ceil(subjectCount / 2);
        const fillInBlanksCount = subjectCount - dragDropCount;

        try {
            // Generar ejercicios drag-drop
            if (dragDropCount > 0) {
                const dragDropExercises = await generateExercises({
                    gradeId,
                    subjectId: subject.id,
                    type: 'drag-drop',
                    count: dragDropCount,
                    difficulty: difficulties[difficultyIndex % difficulties.length],
                });

                // Agregar metadata de materia a cada ejercicio
                dragDropExercises.forEach(ex => {
                    (ex as any).subjectId = subject.id;
                    (ex as any).subjectName = subject.name;
                    (ex as any).subjectIcon = subject.icon;
                });

                allExercises.push(...dragDropExercises);
                difficultyIndex += dragDropCount;
            }

            // Generar ejercicios fill-in-blanks
            if (fillInBlanksCount > 0) {
                const fillInBlanksExercises = await generateExercises({
                    gradeId,
                    subjectId: subject.id,
                    type: 'fill-in-blanks',
                    count: fillInBlanksCount,
                    difficulty: difficulties[difficultyIndex % difficulties.length],
                });

                // Agregar metadata de materia a cada ejercicio
                fillInBlanksExercises.forEach(ex => {
                    (ex as any).subjectId = subject.id;
                    (ex as any).subjectName = subject.name;
                    (ex as any).subjectIcon = subject.icon;
                });

                allExercises.push(...fillInBlanksExercises);
                difficultyIndex += fillInBlanksCount;
            }
        } catch (error) {
            console.error(`Error generating exercises for ${subject.name}:`, error);
        }
    }

    // Mezclar todos los ejercicios aleatoriamente
    shuffleArray(allExercises);

    return allExercises.slice(0, count);
}

/**
 * Función auxiliar para mezclar un array (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
