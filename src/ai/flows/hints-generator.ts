// Generador de hints/pistas con IA para ejercicios

import { ai } from '@/ai/genkit';
import type { DragDropExercise, FillInBlanksExercise } from '@/types/exercises';

export interface ExerciseHint {
    level: 1 | 2 | 3;
    text: string;
    pointsPenalty: number;
}

type Exercise = DragDropExercise | FillInBlanksExercise;

/**
 * Genera hints para un ejercicio usando IA
 */
export async function generateHintsForExercise(exercise: Exercise): Promise<ExerciseHint[]> {
    const prompt = createHintsPrompt(exercise);

    try {
        // Usar sistema de fallback de API keys
        const { generateWithFallback } = await import('@/ai/api-key-fallback');

        const result = await generateWithFallback({
            model: 'googleai/gemini-2.0-flash-001',
            prompt,
            config: {
                temperature: 0.7,
            },
        });

        const hints = parseHintsResponse(result.text);
        return hints;
    } catch (error) {
        console.error('Error generating hints:', error);
        return getDefaultHints();
    }
}

/**
 * Crea el prompt para generar hints
 */
function createHintsPrompt(exercise: Exercise): string {
    let exerciseDescription = '';

    if (exercise.type === 'drag-drop') {
        exerciseDescription = `
Tipo: Ordenar pasos
Título: ${exercise.title}
Descripción: ${exercise.description}
Pasos a ordenar: ${exercise.items.map(item => item.content).join(', ')}
`;
    } else {
        exerciseDescription = `
Tipo: Completar espacios
Título: ${exercise.title}
Descripción: ${exercise.description}
Template: ${exercise.template}
`;
    }

    return `Eres un tutor de matemáticas experto. Genera 3 pistas progresivas para ayudar al estudiante a resolver este ejercicio SIN dar la respuesta directa.

${exerciseDescription}

**IMPORTANTE**: Las pistas deben GUIAR al estudiante, NO resolver el ejercicio.

Genera 3 pistas con este formato JSON:

[
  {
    "level": 1,
    "text": "Pista general sobre el concepto matemático a aplicar",
    "pointsPenalty": 2
  },
  {
    "level": 2,
    "text": "Pista sobre el primer paso o estrategia a seguir",
    "pointsPenalty": 5
  },
  {
    "level": 3,
    "text": "Pista más específica con guía detallada pero sin resolver",
    "pointsPenalty": 8
  }
]

**Ejemplo para "Resolver: 3x + 5 = 14":**
[
  {
    "level": 1,
    "text": "Piensa en despejar la variable. ¿Qué operación inversa necesitas usar?",
    "pointsPenalty": 2
  },
  {
    "level": 2,
    "text": "Primero elimina el término independiente. ¿Qué número debes restar de ambos lados?",
    "pointsPenalty": 5
  },
  {
    "level": 3,
    "text": "Resta 5 de ambos lados para obtener 3x = 9, luego divide ambos lados entre el coeficiente de x",
    "pointsPenalty": 8
  }
]

Responde SOLO con el array JSON, sin texto adicional.`;
}

/**
 * Parsea la respuesta de la IA
 */
function parseHintsResponse(response: string): ExerciseHint[] {
    try {
        // Buscar JSON en la respuesta
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error('No JSON found in hints response');
            return getDefaultHints();
        }

        const hints = JSON.parse(jsonMatch[0]);

        // Validar estructura
        if (!Array.isArray(hints) || hints.length !== 3) {
            console.error('Invalid hints structure');
            return getDefaultHints();
        }

        return hints;
    } catch (error) {
        console.error('Error parsing hints:', error);
        return getDefaultHints();
    }
}

/**
 * Hints por defecto si falla la generación
 */
function getDefaultHints(): ExerciseHint[] {
    return [
        {
            level: 1,
            text: "Lee cuidadosamente el enunciado e identifica qué te están pidiendo resolver.",
            pointsPenalty: 2,
        },
        {
            level: 2,
            text: "Piensa en qué operaciones matemáticas necesitas aplicar para llegar a la solución.",
            pointsPenalty: 5,
        },
        {
            level: 3,
            text: "Revisa los pasos que has dado hasta ahora y verifica si están en el orden correcto.",
            pointsPenalty: 8,
        },
    ];
}
