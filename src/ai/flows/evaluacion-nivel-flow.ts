'use server';
/**
 * @fileOverview Flow de IA para evaluar el nivel matemático del usuario
 * 
 * Este flow genera un test de diagnóstico de 20 preguntas (4 por área matemática)
 * y evalúa las respuestas para determinar el nivel del usuario en cada área.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema para una pregunta de evaluación
const EvaluationQuestionSchema = z.object({
    id: z.string().describe('ID único de la pregunta'),
    area: z.enum(['algebra', 'geometry', 'calculus', 'trigonometry', 'statistics', 'functions']).describe('Área matemática'),
    difficulty: z.number().min(1).max(10).describe('Dificultad de 1 a 10'),
    question: z.string().describe('Enunciado de la pregunta'),
    options: z.array(z.string()).length(4).describe('4 opciones de respuesta'),
    correctAnswer: z.string().describe('Respuesta correcta (debe ser una de las opciones)'),
    explanation: z.string().describe('Explicación de por qué es correcta'),
});

// Schema para el test completo
const EvaluationTestSchema = z.object({
    questions: z.array(EvaluationQuestionSchema).length(24).describe('24 preguntas (4 por área)'),
});

// Schema para una respuesta del usuario
const UserAnswerSchema = z.object({
    questionId: z.string(),
    userAnswer: z.string(),
});

// Schema de entrada para generar el test
const GenerateTestInputSchema = z.object({
    grade: z.string().optional().describe('Curso del usuario (ej: "3° Medio")'),
});

// Schema de entrada para evaluar respuestas
const EvaluateAnswersInputSchema = z.object({
    questions: z.array(EvaluationQuestionSchema).describe('Las preguntas del test'),
    answers: z.array(UserAnswerSchema).describe('Las respuestas del usuario'),
});

// Schema de salida de la evaluación
const EvaluationResultSchema = z.object({
    overall: z.number().min(0).max(100).describe('Nivel general (0-100)'),
    algebra: z.number().min(0).max(100).describe('Nivel en álgebra'),
    geometry: z.number().min(0).max(100).describe('Nivel en geometría'),
    calculus: z.number().min(0).max(100).describe('Nivel en cálculo'),
    trigonometry: z.number().min(0).max(100).describe('Nivel en trigonometría'),
    statistics: z.number().min(0).max(100).describe('Nivel en estadística'),
    functions: z.number().min(0).max(100).describe('Nivel en funciones'),
    strengths: z.array(z.string()).describe('Áreas fuertes del usuario'),
    weaknesses: z.array(z.string()).describe('Áreas a reforzar'),
    recommendations: z.array(z.string()).describe('Recomendaciones personalizadas'),
    questionsAnswered: z.number().describe('Total de preguntas respondidas'),
    correctAnswers: z.number().describe('Total de respuestas correctas'),
});

export type EvaluationQuestion = z.infer<typeof EvaluationQuestionSchema>;
export type EvaluationTest = z.infer<typeof EvaluationTestSchema>;
export type UserAnswer = z.infer<typeof UserAnswerSchema>;
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

/**
 * Genera un test de evaluación de nivel matemático
 */
export async function generateEvaluationTest(grade?: string): Promise<EvaluationTest> {
    return generateTestFlow({ grade });
}

/**
 * Evalúa las respuestas del usuario y calcula su nivel
 */
export async function evaluateUserAnswers(
    questions: EvaluationQuestion[],
    answers: UserAnswer[]
): Promise<EvaluationResult> {
    return evaluateFlow({ questions, answers });
}

// Flow para generar el test
const generateTestFlow = ai.defineFlow(
    {
        name: 'generateEvaluationTest',
        inputSchema: GenerateTestInputSchema,
        outputSchema: EvaluationTestSchema,
    },
    async (input) => {
        const gradeContext = input.grade
            ? `El usuario está en ${input.grade}, ajusta la dificultad apropiadamente.`
            : 'Genera preguntas de dificultad variada.';

        const systemPrompt = `Eres un experto en evaluación educativa matemática. Tu tarea es generar un test de diagnóstico de 24 preguntas para evaluar el nivel matemático de un estudiante chileno.

ÁREAS A EVALUAR (4 preguntas por área):
1. **Álgebra**: Ecuaciones, sistemas, factorización, expresiones algebraicas
2. **Geometría**: Figuras, áreas, volúmenes, teoremas geométricos
3. **Cálculo**: Límites, derivadas, integrales (si aplica al nivel)
4. **Trigonometría**: Razones trigonométricas, identidades, ecuaciones
5. **Estadística**: Probabilidad, medidas de tendencia, gráficos
6. **Funciones**: Tipos de funciones, dominio, rango, transformaciones

REGLAS ESTRICTAS:
1. Para cada área, genera EXACTAMENTE 4 preguntas con dificultad progresiva:
   - Pregunta 1: Dificultad 2-3 (básica)
   - Pregunta 2: Dificultad 4-5 (intermedia)
   - Pregunta 3: Dificultad 6-7 (avanzada)
   - Pregunta 4: Dificultad 8-9 (experto)

2. Cada pregunta debe tener:
   - Enunciado claro y conciso
   - 4 opciones de respuesta (A, B, C, D)
   - UNA sola respuesta correcta
   - Explicación pedagógica de la respuesta

3. Las preguntas deben ser realistas y aplicables al contexto chileno

4. Usa notación matemática clara (sin LaTeX complejo)

${gradeContext}

IMPORTANTE: Genera EXACTAMENTE 24 preguntas, 4 por cada una de las 6 áreas.`;

        const { output } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-001',
            system: systemPrompt,
            prompt: 'Genera el test de evaluación completo con 24 preguntas.',
            output: {
                schema: EvaluationTestSchema,
            },
        });

        return output!;
    }
);

// Flow para evaluar las respuestas
const evaluateFlow = ai.defineFlow(
    {
        name: 'evaluateUserAnswers',
        inputSchema: EvaluateAnswersInputSchema,
        outputSchema: EvaluationResultSchema,
    },
    async (input) => {
        const systemPrompt = `Eres un evaluador experto en matemáticas. Tu tarea es analizar las respuestas de un estudiante y calcular su nivel en cada área matemática.

CRITERIOS DE EVALUACIÓN:
1. Calcula el porcentaje de respuestas correctas por área
2. Convierte el porcentaje a una escala de 0-100
3. Calcula el nivel general como promedio de todas las áreas
4. Identifica fortalezas (áreas con 70%+ de aciertos)
5. Identifica debilidades (áreas con menos de 50% de aciertos)
6. Genera 3-5 recomendaciones personalizadas basadas en los resultados

ESCALA DE NIVELES:
- 0-25: Principiante (necesita reforzar conceptos básicos)
- 26-50: Básico (comprende conceptos fundamentales)
- 51-70: Intermedio (buen dominio general)
- 71-85: Avanzado (dominio sólido)
- 86-100: Experto (excelencia matemática)

IMPORTANTE: Sé honesto pero alentador en tus recomendaciones.`;

        // Preparar contexto de preguntas y respuestas
        const questionsContext = input.questions.map((q, idx) => ({
            id: q.id,
            area: q.area,
            question: q.question,
            correctAnswer: q.correctAnswer,
            userAnswer: input.answers.find(a => a.questionId === q.id)?.userAnswer || 'Sin respuesta',
        }));

        const prompt = `Evalúa las siguientes respuestas:

${JSON.stringify(questionsContext, null, 2)}

Calcula el nivel del estudiante en cada área y proporciona un análisis completo.`;

        const { output } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-001',
            system: systemPrompt,
            prompt,
            output: {
                schema: EvaluationResultSchema,
            },
        });

        return output!;
    }
);
