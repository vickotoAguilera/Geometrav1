'use server';

/**
 * Server actions para la evaluación de nivel matemático
 */

import { generateEvaluationTest, evaluateUserAnswers } from '@/ai/flows/evaluacion-nivel-flow';
import type { EvaluationTest, EvaluationQuestion, UserAnswer, EvaluationResult } from '@/ai/flows/evaluacion-nivel-flow';

/**
 * Genera un test de evaluación de nivel matemático
 */
export async function generateEvaluation(grade?: string): Promise<{ test: EvaluationTest }> {
    try {
        const test = await generateEvaluationTest(grade);
        return { test };
    } catch (error) {
        console.error('Error generating evaluation:', error);
        throw new Error('No se pudo generar el test de evaluación');
    }
}

/**
 * Evalúa las respuestas del usuario y retorna el resultado
 */
export async function evaluateAnswers(
    questions: EvaluationQuestion[],
    answers: UserAnswer[]
): Promise<{ result: EvaluationResult }> {
    try {
        const result = await evaluateUserAnswers(questions, answers);
        return { result };
    } catch (error) {
        console.error('Error evaluating answers:', error);
        throw new Error('No se pudo evaluar las respuestas');
    }
}
