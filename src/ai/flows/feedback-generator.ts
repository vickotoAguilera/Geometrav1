// Generador de retroalimentación con IA para ejercicios completados

import { generateWithFallback } from '@/ai/api-key-fallback';
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
    console.log('🚀🚀🚀 [FEEDBACK] Function called - START');
    console.log('📊 [FEEDBACK] Params:', { exercisesCount: exercises.length, answersCount: userAnswers.length, subjectName, gradeName });

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
        const prompt = `Eres un profesor experto en matemáticas de la plataforma Geometra. Analiza el desempeño de un estudiante de ${gradeName} en ${subjectName}.

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

**IMPORTANTE - Recursos de la Plataforma:**
Al final de la retroalimentación, SIEMPRE incluye una sección llamada "📚 Recursos en Geometra" que mencione:
- La sección "Estudia" donde pueden encontrar teoría sobre los temas que necesitan reforzar
- IMPORTANTE: Incluye el enlace directo a la sección de estudio:
  [LINK: /estudia]
- Menciona que pueden hablar con el "Asistente Geometra" (el chatbot de IA) que les ayudará con gusto en todo lo que necesiten
- Termina con un mensaje motivador como "¡Buena suerte!" o "¡Sigue adelante!"

**Importante:**
- Sé específico y constructivo
- Mantén un tono motivador y positivo
- Enfócate en el aprendizaje, no solo en las calificaciones
- Usa un lenguaje apropiado para estudiantes de ${gradeName}
- Menciona recursos ESPECÍFICOS de la plataforma Geometra

Genera la retroalimentación en formato de texto claro y bien estructurado.`;

        console.log('🤖 [feedback-generator] Generating feedback with Groq/Gemini fallback...');

        const result = await generateWithFallback({
            prompt: [{ text: prompt }],
        });

        const feedbackText = result.text || 'No se pudo generar retroalimentación.';
        console.log('✅ [feedback-generator] Feedback generated successfully');
        return feedbackText;
    } catch (error) {
        console.error('❌ [feedback-generator] Error generating feedback:', error);
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
