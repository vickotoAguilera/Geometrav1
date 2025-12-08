'use server';

/**
 * Flow de IA para generar retroalimentación de ejercicios
 * Basado en retroalimentacion-ia-flow.ts del otro PC
 * Adaptado para usar Gemini directamente
 */

import { getApiKey } from '@/lib/utils/api-key-fallback';

interface ExerciseAnswer {
    questionId: string;
    question: string;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
}

interface FeedbackInput {
    answers: ExerciseAnswer[];
    subject: string;
    grade: string;
}

interface FeedbackOutput {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    score: number;
    detailedFeedback: {
        questionId: string;
        feedback: string;
    }[];
}

/**
 * Genera retroalimentación personalizada para un conjunto de ejercicios
 */
export async function generateExerciseFeedback(input: FeedbackInput): Promise<FeedbackOutput> {
    // Calcular estadísticas
    const totalQuestions = input.answers.length;
    const correctAnswers = input.answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    try {
        const apiKey = await getApiKey();

        // Crear prompt para la IA
        const prompt = createFeedbackPrompt(input, score);

        console.log('🤖 [exercise-feedback] Generating feedback...');
        console.log(`📊 Score: ${score}% (${correctAnswers}/${totalQuestions})`);

        // Llamar a Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const feedbackText = data.candidates[0].content.parts[0].text;

        console.log('✅ [exercise-feedback] Feedback generated successfully');

        // Parsear respuesta de la IA
        const parsedFeedback = parseFeedbackResponse(feedbackText, input.answers);

        return {
            ...parsedFeedback,
            score,
        };
    } catch (error) {
        console.error('❌ [exercise-feedback] Error:', error);

        // Fallback: generar feedback básico sin IA
        console.log('⚠️ [exercise-feedback] Using fallback feedback');
        return generateFallbackFeedback(input, score);
    }
}

/**
 * Genera feedback básico sin IA (fallback)
 */
function generateFallbackFeedback(input: FeedbackInput, score: number): FeedbackOutput {
    const { answers } = input;
    const correctCount = answers.filter(a => a.isCorrect).length;

    let summary = '';
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (score >= 80) {
        summary = `¡Excelente trabajo! Obtuviste ${correctCount} de ${answers.length} respuestas correctas (${score}%). Demuestras un buen dominio del tema.`;
        strengths.push('Comprensión sólida de los conceptos');
        strengths.push('Buena precisión en las respuestas');
        suggestions.push('Intenta ejercicios más desafiantes');
    } else if (score >= 60) {
        summary = `Buen esfuerzo. Obtuviste ${correctCount} de ${answers.length} respuestas correctas (${score}%). Hay áreas que puedes mejorar.`;
        strengths.push('Comprensión básica del tema');
        weaknesses.push('Algunos conceptos necesitan refuerzo');
        suggestions.push('Repasa los ejercicios incorrectos');
        suggestions.push('Practica más problemas similares');
    } else {
        summary = `Obtuviste ${correctCount} de ${answers.length} respuestas correctas (${score}%). Te recomiendo repasar los conceptos básicos.`;
        weaknesses.push('Necesitas reforzar conceptos fundamentales');
        suggestions.push('Repasa la teoría del tema');
        suggestions.push('Practica ejercicios más simples primero');
        suggestions.push('Pide ayuda a tu profesor');
    }

    const detailedFeedback = answers.map(a => ({
        questionId: a.questionId,
        feedback: a.isCorrect
            ? '¡Correcto! Buen trabajo.'
            : `Revisa este concepto. La respuesta correcta es: ${a.correctAnswer}`,
    }));

    return {
        summary,
        strengths,
        weaknesses,
        suggestions,
        score,
        detailedFeedback,
    };
}

/**
 * Crea el prompt para la IA (VERSIÓN EXACTA DE GITHUB + FÓRMULAS Y EJEMPLOS)
 */
function createFeedbackPrompt(input: FeedbackInput, score: number): string {
    const { answers, subject, grade } = input;

    const totalExercises = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = answers.filter(a => !a.isCorrect).length;
    const successRate = score;

    // Ejercicios con dificultad (incorrectos)
    const difficultExercises = answers
        .filter(a => !a.isCorrect)
        .map((a, i) => `${i + 1}. ${a.question}`)
        .join('\n');

    return `Eres un profesor experto en matemáticas de la plataforma Geometra. Analiza el desempeño de un estudiante de ${grade} en ${subject}.

**Estadísticas:**
- Total de ejercicios: ${totalExercises}
- Respuestas correctas: ${correctAnswers}
- Respuestas incorrectas: ${incorrectAnswers}
- Tasa de éxito: ${successRate}%

**Ejercicios con dificultad:**
${difficultExercises.length > 0 ? difficultExercises : 'Ninguno'}

**Genera una retroalimentación constructiva y motivadora que incluya:**

1. **Resumen General:** Un párrafo breve sobre el desempeño general

2. **Fortalezas:** 2-3 puntos específicos que el estudiante hizo bien

3. **Áreas de Mejora:** 2-3 conceptos específicos que necesita reforzar
   - Para CADA concepto, incluye:
     * **Fórmula/Regla:** La fórmula matemática o regla que se aplica
       Ejemplo: "Binomio al cubo: (a-b)³ = a³ - 3a²b + 3ab² - b³"
     * **Explicación:** Qué significa cada parte de la fórmula
       Ejemplo: "Donde 'a' es el primer término, 'b' es el segundo término, y cada término del resultado representa..."
     * **Ejemplo Resuelto:** Un ejemplo paso a paso de cómo aplicar la fórmula
       Ejemplo: "Si tenemos (2x-3)³, entonces a=2x y b=3..."

4. **Recomendaciones:** 2-3 sugerencias concretas de estudio
   - Incluye ejercicios específicos para practicar
   - Menciona las fórmulas clave a memorizar

5. **Próximos Pasos:** 1-2 acciones específicas para seguir aprendiendo

**IMPORTANTE - Recursos de la Plataforma:**
Al final de la retroalimentación, SIEMPRE incluye una sección llamada "📚 Recursos en Geometra" que mencione:
- La sección "Estudia" donde pueden encontrar teoría sobre los temas que necesitan reforzar
- IMPORTANTE: Incluye el enlace directo a la sección de estudio:
  [LINK: /estudia]
- Menciona que pueden hablar con el "Asistente Geometra" (el chatbot de IA) que les ayudará con gusto en todo lo que necesiten
- Termina con un mensaje motivador como "¡Buena suerte!" o "¡Sigue adelante!"

**REGLAS ESPECIALES PARA FÓRMULAS Y EJEMPLOS:**
- SIEMPRE incluye la fórmula matemática relevante para cada área de mejora
- Usa notación matemática clara (ejemplo: x², √x, (a+b)², etc.)
- Explica cada variable y término de la fórmula
- Proporciona un ejemplo numérico concreto paso a paso
- Muestra el proceso completo de resolución, no solo el resultado
- Si hay múltiples pasos, enuméralos claramente

**Importante:**
- Sé específico y constructivo
- Mantén un tono motivador y positivo
- Enfócate en el aprendizaje, no solo en las calificaciones
- Usa un lenguaje apropiado para estudiantes de ${grade}
- Menciona recursos ESPECÍFICOS de la plataforma Geometra
- SIEMPRE incluye fórmulas y ejemplos para conceptos matemáticos

Genera la retroalimentación en formato de texto claro y bien estructurado.`;
}

/**
 * Parsea la respuesta de la IA (FORMATO TEXTO DE GITHUB)
 */
function parseFeedbackResponse(text: string, answers: ExerciseAnswer[]): Omit<FeedbackOutput, 'score'> {
    // El formato de GitHub es texto plano estructurado, no JSON
    // Extraer secciones del texto

    const sections = {
        summary: '',
        strengths: [] as string[],
        weaknesses: [] as string[],
        suggestions: [] as string[],
        detailedFeedback: [] as { questionId: string; feedback: string }[]
    };

    try {
        // Extraer Resumen General
        const summaryMatch = text.match(/\*\*Resumen General:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i);
        if (summaryMatch) {
            sections.summary = summaryMatch[1].trim();
        }

        // Extraer Fortalezas
        const strengthsMatch = text.match(/\*\*Fortalezas:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
        if (strengthsMatch) {
            sections.strengths = strengthsMatch[1]
                .split(/\n[-•*]\s*/)
                .filter(s => s.trim())
                .map(s => s.trim())
                .slice(0, 3);
        }

        // Extraer Áreas de Mejora
        const weaknessesMatch = text.match(/\*\*Áreas de Mejora:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
        if (weaknessesMatch) {
            sections.weaknesses = weaknessesMatch[1]
                .split(/\n[-•*]\s*/)
                .filter(s => s.trim())
                .map(s => s.trim())
                .slice(0, 3);
        }

        // Extraer Recomendaciones
        const suggestionsMatch = text.match(/\*\*Recomendaciones:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
        if (suggestionsMatch) {
            sections.suggestions = suggestionsMatch[1]
                .split(/\n[-•*]\s*/)
                .filter(s => s.trim())
                .map(s => s.trim())
                .slice(0, 3);
        }

        // Si no se encontraron secciones, usar el texto completo como summary
        if (!sections.summary) {
            sections.summary = text.substring(0, 300);
        }

    } catch (error) {
        console.warn('⚠️ Could not parse AI response sections, using fallback');
        sections.summary = text.substring(0, 300);
    }

    // Generar feedback detallado por pregunta
    sections.detailedFeedback = answers.map(a => ({
        questionId: a.questionId,
        feedback: a.isCorrect
            ? '¡Correcto! Excelente trabajo.'
            : 'Revisa este concepto y vuelve a intentarlo.',
    }));

    return sections;
}

/**
 * Genera retroalimentación rápida para una sola pregunta
 */
export async function generateQuickFeedback(
    question: string,
    correctAnswer: string,
    userAnswer: string,
    isCorrect: boolean
): Promise<string> {
    if (isCorrect) {
        return '¡Excelente! Tu respuesta es correcta. 🎉';
    }

    try {
        const apiKey = await getApiKey();

        const prompt = `Eres un tutor de matemáticas. Un estudiante respondió incorrectamente esta pregunta:

Pregunta: ${question}
Respuesta correcta: ${correctAnswer}
Respuesta del estudiante: ${userAnswer}

Genera un feedback breve (2-3 oraciones) que:
1. Identifique el posible error
2. Dé una pista sin revelar la respuesta
3. Motive al estudiante

Responde SOLO el feedback, sin formato adicional.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 200,
                    },
                }),
            }
        );

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('❌ Error generating quick feedback:', error);
        return 'Revisa tu respuesta e intenta nuevamente. ¡Tú puedes!';
    }
}
