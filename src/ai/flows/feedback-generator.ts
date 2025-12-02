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

        // Generar retroalimentación con IA usando llamada directa
        console.log('🤖 [feedback-generator] Starting AI generation...');
        console.log('📝 [feedback-generator] Prompt length:', prompt.length);

        const apiKey = process.env.GOOGLE_GENAI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_GENAI_API_KEY no está configurada');
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        };

        console.log('📡 [feedback-generator] Calling Gemini API...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📥 [feedback-generator] Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ [feedback-generator] API error:', errorData);
            throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const feedbackText = data.candidates[0].content.parts[0].text;
            console.log('✅ [feedback-generator] Feedback generated successfully');
            console.log('📄 [feedback-generator] Response length:', feedbackText.length);
            return feedbackText;
        }

        console.error('❌ [feedback-generator] No valid response from API');
        return 'No se pudo generar retroalimentación.';
    } catch (error) {
        console.error('❌ [feedback-generator] Error generating feedback:', error);
        console.error('❌ [feedback-generator] Error type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('❌ [feedback-generator] Error message:', error instanceof Error ? error.message : String(error));
        console.error('❌ [feedback-generator] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
