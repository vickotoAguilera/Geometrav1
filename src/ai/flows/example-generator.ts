'use server';

/**
 * Generador de ejemplos para ejercicios usando IA
 * Analiza un ejercicio y genera un ejemplo resuelto paso a paso
 */

import { generateWithFallback } from '@/ai/api-key-fallback';

interface Exercise {
    id: string;
    type: 'drag-drop' | 'fill-in-blanks';
    title: string;
    description?: string;
    template?: string;
    items?: any[];
    blanks?: any[];
}

interface ExampleOutput {
    example: string;
    steps: string[];
    explanation: string;
}

/**
 * Genera un ejemplo resuelto para un ejercicio
 */
export async function generateExampleForExercise(exercise: Exercise): Promise<ExampleOutput> {
    try {
        const systemPrompt = createSystemPrompt();
        const userPrompt = createUserPrompt(exercise);

        console.log(`🤖 [example-generator] Generando ejemplo para: ${exercise.title} con Groq/Gemini fallback...`);

        const result = await generateWithFallback({
            system: systemPrompt,
            prompt: userPrompt,
        });

        const aiResponse = result.text || '';
        const parsed = parseAIResponse(aiResponse);

        console.log(`✅ [example-generator] Ejemplo generado exitosamente`);

        return parsed;
    } catch (error) {
        console.error('❌ [example-generator] Error:', error);
        return {
            example: 'Ejemplo no disponible',
            steps: [],
            explanation: 'No se pudo generar el ejemplo'
        };
    }
}

/**
 * Genera ejemplos para múltiples ejercicios en batch
 */
export async function generateExamplesForExercises(exercises: Exercise[]): Promise<Map<string, ExampleOutput>> {
    const results = new Map<string, ExampleOutput>();

    console.log(`📚 [example-generator] Generando ejemplos para ${exercises.length} ejercicios...`);

    // Generar en paralelo (máximo 5 a la vez para no saturar la API)
    const batchSize = 5;
    for (let i = 0; i < exercises.length; i += batchSize) {
        const batch = exercises.slice(i, i + batchSize);
        const promises = batch.map(async (exercise) => {
            const example = await generateExampleForExercise(exercise);
            return { id: exercise.id, example };
        });

        const batchResults = await Promise.all(promises);
        batchResults.forEach(({ id, example }) => {
            results.set(id, example);
        });

        console.log(`✅ [example-generator] Procesados ${Math.min(i + batchSize, exercises.length)}/${exercises.length}`);
    }

    return results;
}

/**
 * Crea el prompt del sistema
 */
function createSystemPrompt(): string {
    return `Eres un profesor de matemáticas experto en crear ejemplos didácticos.

Tu tarea es generar un EJEMPLO RESUELTO para un ejercicio, que sirva de guía al estudiante.

CARACTERÍSTICAS DEL EJEMPLO:
1. **Similar pero diferente:** El ejemplo debe ser del mismo tipo que el ejercicio, pero con valores/contenido diferente
2. **Paso a paso:** Muestra cada paso de la solución claramente
3. **Explicativo:** Explica brevemente por qué se hace cada paso
4. **Conciso:** Máximo 4-5 pasos
5. **Motivador:** Usa un tono amigable y alentador

FORMATO DE RESPUESTA (JSON):
{
  "example": "Enunciado del ejemplo",
  "steps": [
    "Paso 1: ...",
    "Paso 2: ...",
    "Paso 3: ..."
  ],
  "explanation": "Explicación general de cómo resolver este tipo de ejercicio"
}

IMPORTANTE: 
- NO resuelvas el ejercicio original, crea uno NUEVO similar
- Sé específico con los números y operaciones
- Usa lenguaje simple y claro`;
}

/**
 * Crea el prompt del usuario
 */
function createUserPrompt(exercise: Exercise): string {
    let prompt = `Genera un ejemplo resuelto para este ejercicio:

**Título:** ${exercise.title}
**Tipo:** ${exercise.type === 'drag-drop' ? 'Ordenar pasos' : 'Completar espacios'}
`;

    if (exercise.description) {
        prompt += `**Descripción:** ${exercise.description}\n`;
    }

    if (exercise.type === 'fill-in-blanks' && exercise.template) {
        prompt += `**Template:** ${exercise.template}\n`;
    }

    if (exercise.type === 'drag-drop' && exercise.items) {
        prompt += `**Pasos a ordenar:**\n`;
        exercise.items.forEach((item, i) => {
            prompt += `${i + 1}. ${item.content}\n`;
        });
    }

    prompt += `\nGenera un ejemplo DIFERENTE pero del mismo tipo, con solución paso a paso.`;

    return prompt;
}

/**
 * Parsea la respuesta de la IA
 */
function parseAIResponse(text: string): ExampleOutput {
    try {
        // Intentar parsear JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                example: parsed.example || '',
                steps: parsed.steps || [],
                explanation: parsed.explanation || '',
            };
        }

        // Si no hay JSON, intentar extraer manualmente
        const lines = text.split('\n').filter(l => l.trim());
        return {
            example: lines[0] || 'Ejemplo no disponible',
            steps: lines.slice(1, -1) || [],
            explanation: lines[lines.length - 1] || '',
        };
    } catch (error) {
        console.warn('⚠️ Could not parse AI response:', text);
        return {
            example: 'Ejemplo no disponible',
            steps: [],
            explanation: 'Error al generar ejemplo'
        };
    }
}
