// Generador de hints/pistas con IA para ejercicios

'use server';

import { generateWithFallback } from '@/ai/api-key-fallback';
import type { DragDropExercise, FillInBlanksExercise } from '@/types/exercises';

export interface ExerciseHint {
    level: 1 | 2 | 3;
    text: string;
    pointsPenalty: number;
}

type Exercise = DragDropExercise | FillInBlanksExercise;

// Contexto adicional del usuario para generar hints más específicos
export interface UserContext {
    userAnswers?: Record<string, string> | string[]; // Respuestas actuales del usuario
    currentOrder?: string[]; // Orden actual para drag-drop
    validationResults?: Record<string, boolean>; // Resultados de validación si ya se verificó
}

/**
 * Genera hints para un ejercicio usando IA con contexto del usuario
 */
export async function generateHintsForExercise(
    exercise: Exercise,
    userContext?: UserContext
): Promise<ExerciseHint[]> {
    const prompt = createHintsPrompt(exercise, userContext);

    try {
        console.log('🤖 [hints-generator] Generating contextual hints with Groq/Gemini fallback...');

        const result = await generateWithFallback({
            prompt: [{ text: prompt }],
        });

        const hintsText = result.text || '';
        console.log('✅ [hints-generator] Contextual hints generated successfully');

        const hints = parseHintsResponse(hintsText);
        return hints;
    } catch (error) {
        console.error('❌ [hints-generator] Error:', error);
        return getDefaultHints();
    }
}

/**
 * Crea el prompt para generar hints contextuales
 */
function createHintsPrompt(exercise: Exercise, userContext?: UserContext): string {
    let exerciseDescription = '';
    let userContextDescription = '';

    if (exercise.type === 'drag-drop') {
        exerciseDescription = `
**Tipo de Ejercicio**: Ordenar pasos en secuencia lógica
**Título**: ${exercise.title}
**Descripción**: ${exercise.description}
**Pasos a ordenar**: 
${exercise.items.map((item, i) => `  ${i + 1}. ${item.content}`).join('\n')}
`;

        if (userContext?.currentOrder && userContext.currentOrder.length > 0) {
            userContextDescription = `
**Orden actual del estudiante**:
${userContext.currentOrder.map((id, i) => {
                const item = exercise.items.find(it => it.id === id);
                return `  ${i + 1}. ${item?.content || id}`;
            }).join('\n')}
`;
        }
    } else {
        exerciseDescription = `
**Tipo de Ejercicio**: Completar espacios en blanco
**Título**: ${exercise.title}
**Descripción**: ${exercise.description}
**Enunciado con espacios**: ${exercise.template}
**Espacios a completar**: ${exercise.blanks.length}
`;

        if (userContext?.userAnswers && Object.keys(userContext.userAnswers).length > 0) {
            const answers = userContext.userAnswers as Record<string, string>;
            userContextDescription = `
**Respuestas actuales del estudiante**:
${exercise.blanks.map((blank, i) => {
                const userAnswer = answers[blank.id] || '(sin responder)';
                const isCorrect = userContext.validationResults?.[blank.id];
                const status = isCorrect === true ? '✓ Correcto' : isCorrect === false ? '✗ Incorrecto' : 'Sin verificar';
                return `  Espacio ${i + 1}: "${userAnswer}" - ${status}`;
            }).join('\n')}
`;
        }
    }

    return `Eres un profesor experto de matemáticas de Geometra, una plataforma educativa especializada en geometría y matemáticas. Tu objetivo es ayudar al estudiante a aprender guiándolo hacia la solución, NO dándole la respuesta directa.

${exerciseDescription}
${userContextDescription ? '\n' + userContextDescription : ''}

**TU MISIÓN**: Genera 3 pistas progresivas que sean ESPECÍFICAS a este ejercicio. Las pistas deben:

1. **Nivel 1 (Pista Conceptual)**: 
   - Mencionar el concepto matemático específico que se aplica en ESTE ejercicio
   - Hacer una pregunta guía relacionada con el contenido del ejercicio
   - NO ser genérica, sino referirse a elementos específicos del problema

2. **Nivel 2 (Pista Estratégica)**:
   - Explicar la estrategia o método específico para resolver ESTE ejercicio
   - Incluir un ejemplo matemático similar si es relevante
   - Dar el primer paso concreto sin resolver completamente

3. **Nivel 3 (Pista Detallada)**:
   - Proporcionar pasos más específicos con valores del ejercicio
   - Incluir fórmulas o procedimientos aplicados a ESTE caso
   - Guiar muy cerca de la solución pero SIN dar la respuesta final
${userContextDescription ? '\n   - Si el estudiante tiene respuestas incorrectas, orientarlo sobre dónde está el error' : ''}

**REGLAS ESTRICTAS**:
- Las pistas DEBEN mencionar elementos específicos del ejercicio (números, conceptos, pasos)
- NO uses frases genéricas como "lee el enunciado" o "piensa en las operaciones"
- Incluye ejemplos matemáticos cuando sea apropiado
- NUNCA des la respuesta completa, solo guía hacia ella
- Usa un tono amigable y motivador

**FORMATO DE RESPUESTA** (JSON únicamente):

[
  {
    "level": 1,
    "text": "Pista conceptual específica del ejercicio",
    "pointsPenalty": 2
  },
  {
    "level": 2,
    "text": "Pista estratégica con ejemplo o primer paso",
    "pointsPenalty": 5
  },
  {
    "level": 3,
    "text": "Pista detallada con pasos específicos",
    "pointsPenalty": 8
  }
]

Responde ÚNICAMENTE con el array JSON, sin texto adicional antes o después.`;
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
