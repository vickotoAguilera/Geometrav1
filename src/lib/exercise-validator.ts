// Funciones de validación para ejercicios interactivos

import type { DragDropItem, FillInBlank } from '@/types/exercises';

/**
 * Valida si el orden de los items es correcto en un ejercicio de drag & drop
 */
export function validateDragDropOrder(
    items: DragDropItem[],
    userOrder: string[]
): { isCorrect: boolean; correctCount: number } {
    let correctCount = 0;

    for (let i = 0; i < userOrder.length; i++) {
        const item = items.find(it => it.id === userOrder[i]);
        if (item && item.correctPosition === i) {
            correctCount++;
        }
    }

    const isCorrect = correctCount === items.length;
    return { isCorrect, correctCount };
}

/**
 * Valida una respuesta de fill-in-blank
 */
export function validateBlankAnswer(
    blank: FillInBlank,
    userAnswer: string
): boolean {
    let trimmedAnswer = userAnswer.trim().toLowerCase();

    // Lista de unidades comunes a eliminar para validación numérica
    const commonUnits = [
        'km/h', 'km/hr', 'kmh',
        'm/s', 'm/seg', 'ms',
        'cm', 'mm', 'km', 'm',
        'kg', 'g', 'mg',
        'l', 'ml',
        'h', 'min', 's', 'seg',
        '°', 'grados', 'rad',
        '%', 'porciento',
    ];

    // Intentar eliminar unidades comunes del final de la respuesta
    let numericAnswer = trimmedAnswer;
    for (const unit of commonUnits) {
        const unitLower = unit.toLowerCase();
        if (numericAnswer.endsWith(unitLower)) {
            numericAnswer = numericAnswer.slice(0, -unitLower.length).trim();
            break;
        }
        // También intentar con espacio antes de la unidad
        if (numericAnswer.endsWith(' ' + unitLower)) {
            numericAnswer = numericAnswer.slice(0, -(unitLower.length + 1)).trim();
            break;
        }
    }

    // Si correctAnswer es un array, verificar si la respuesta está en el array
    if (Array.isArray(blank.correctAnswer)) {
        return blank.correctAnswer.some(
            answer => answer.toLowerCase() === trimmedAnswer || answer.toLowerCase() === numericAnswer
        );
    }

    const correctAnswer = blank.correctAnswer.toLowerCase();

    // Si hay tolerancia definida, es una respuesta numérica
    if (blank.tolerance !== undefined) {
        const userNum = parseFloat(numericAnswer);
        const correctNum = parseFloat(correctAnswer);

        if (isNaN(userNum) || isNaN(correctNum)) {
            return false;
        }

        return Math.abs(userNum - correctNum) <= blank.tolerance;
    }

    // Comparación exacta (case-insensitive) - intentar con y sin unidades
    return trimmedAnswer === correctAnswer || numericAnswer === correctAnswer;
}

/**
 * Valida todas las respuestas de un ejercicio fill-in-blanks
 */
export function validateFillInBlanks(
    blanks: FillInBlank[],
    userAnswers: Record<string, string>
): { isCorrect: boolean; correctCount: number; results: Record<string, boolean> } {
    const results: Record<string, boolean> = {};
    let correctCount = 0;

    for (const blank of blanks) {
        const userAnswer = userAnswers[blank.id] || '';
        const isCorrect = validateBlankAnswer(blank, userAnswer);
        results[blank.id] = isCorrect;
        if (isCorrect) correctCount++;
    }

    const isCorrect = correctCount === blanks.length;
    return { isCorrect, correctCount, results };
}

/**
 * Calcula el porcentaje de aciertos
 */
export function calculateScore(correctCount: number, totalCount: number): number {
    if (totalCount === 0) return 0;
    return Math.round((correctCount / totalCount) * 100);
}
