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
});

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
});

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

        const prompt = createGenerationPrompt(subject.name, subject.topics, type, currentBatchSize, difficulty);

        try {
            const result = await ai.generate({
                model: 'googleai/gemini-2.0-flash-exp',
                prompt,
                config: {
                    temperature: 0.9, // Alta creatividad para ejercicios variados
                },
            });

            // Parsear respuesta JSON
            const responseText = result.text;
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);

            if (!jsonMatch) {
                console.error('No JSON found in response:', responseText);
                continue;
            }

            const parsedExercises = JSON.parse(jsonMatch[0]);

            // Validar y agregar ejercicios
            for (const ex of parsedExercises) {
                try {
                    const validated = ExerciseSchema.parse(ex);
                    exercises.push(validated as DragDropExercise | FillInBlanksExercise);
                } catch (error) {
                    console.error('Invalid exercise:', ex, error);
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
1. Los ejercicios deben ser educativos y desafiantes
2. Usar contextos reales cuando sea posible
3. Las respuestas deben ser verificables automáticamente
4. Variar los temas entre ejercicios
5. IDs únicos para cada ejercicio (usar timestamp + random)
6. Puntos: 10 para fácil, 15 para medio, 20 para difícil

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
