// Generador de retroalimentación con IA para ejercicios completados

import { ai } from '@/ai/genkit';
import type { DragDropExercise, FillInBlanksExercise } from '@/types/exercises';

type Exercise = DragDropExercise | FillInBlanksExercise;

export interface UserAnswer {
    exerciseId: string;
    answer: any;
    isCorrect: boolean;
    timeSpent?: number; // en segundos
}

export interface FeedbackResult {
    summary: string;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    nextSteps: string[];
}

/**
 * Genera retroalimentación personalizada con IA
 */
export async function generateExerciseFeedback(
    exercises: Exercise[],
    userAnswers: UserAnswer[],
    subjectName: string,
    gradeName: string
): Promise<string> {
    try {
        // Calcular estadísticas
        const totalExercises = exercises.length;
        const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
        const incorrectAnswers = totalExercises - correctAnswers;
        const successRate = Math.round((correctAnswers / totalExercises) * 100);

        // Identificar ejercicios difíciles (incorrectos)
        const difficultExercises = exercises.filter((ex, i) =>
            !userAnswers[i]?.isCorrect
        ).map(ex => ex.title || ex.description).slice(0, 3);

        // Crear prompt para la IA
        const prompt = `Eres un profesor experto en matemáticas. Analiza el desempeño de un estudiante de ${gradeName} en ${subjectName}.

**Estadísticas:**
- Total de ejercicios: ${totalExercises}
- Respuestas correctas: ${correctAnswers}
- Respuestas incorrectas: ${incorrectAnswers}
- Tasa de éxito: ${successRate}%

**Ejercicios con dificultad:**
${difficultExercises.length > 0 ? difficultExercises.map((e, i) => `${i + 1}. ${e}`).join('\n') : 'Ninguno'}

**Genera una retroalimentación constructiva y motivadora que incluya:**

1. **Resumen General:** Un párrafo breve sobre el desempeño general
2. **Fortalezas:** 2-3 puntos específicos que el estudiante hizo bien
3. **Áreas de Mejora:** 2-3 conceptos específicos que necesita reforzar
4. **Recomendaciones:** 2-3 sugerencias concretas de estudio
5. **Próximos Pasos:** 1-2 acciones específicas para seguir aprendiendo

**Importante:**
- Sé específico y constructivo
- Mantén un tono motivador y positivo
- Enfócate en el aprendizaje, no solo en las calificaciones
- Usa un lenguaje apropiado para estudiantes de ${gradeName}

Genera la retroalimentación en formato de texto claro y bien estructurado.`;

        // Generar retroalimentación con IA
        const { generateWithFallback } = await import('@/ai/api-key-fallback');

        const result = await generateWithFallback({
            model: 'googleai/gemini-2.0-flash',
            prompt,
            config: {
                temperature: 0.7, // Balance entre creatividad y consistencia
            },
        });

        return result.text || 'No se pudo generar retroalimentación.';
    } catch (error) {
        console.error('Error generating feedback:', error);
        throw new Error('No se pudo generar la retroalimentación. Por favor, intenta nuevamente.');
    }
}

/**
 * Genera retroalimentación estructurada (alternativa)
 */
export async function generateStructuredFeedback(
    exercises: Exercise[],
    userAnswers: UserAnswer[],
    subjectName: string,
    gradeName: string
): Promise<FeedbackResult> {
    const feedbackText = await generateExerciseFeedback(
        exercises,
        userAnswers,
        subjectName,
        gradeName
    );

    // Parsear el texto en secciones (simplificado)
    // En producción, podrías usar un prompt más estructurado o parsear mejor
    return {
        summary: feedbackText,
        strengths: [],
        improvements: [],
        recommendations: [],
        nextSteps: []
    };
}
