/**
 * Validación de ejercicios: productos-notables
 * Curso: 1-medio
 * 
 * Este archivo contiene las reglas de validación y retroalimentación
 * para los ejercicios de productos-notables.
 */

export interface ValidationRule {
    blankId: string;
    correctAnswers: string[];
    validation: {
        type: 'numeric' | 'algebraic' | 'text';
        caseSensitive?: boolean;
        acceptSpaces?: boolean;
        tolerance?: number;
    };
    feedback: {
        correct: string;
        almostCorrect?: string;
        incorrect: string;
        commonErrors?: Array<{
            answer: string;
            feedback: string;
        }>;
    };
}

export interface ExerciseValidation {
    id: number;
    question: string;
    blanks: ValidationRule[];
}

export const productosNotablesValidation: ExerciseValidation[] = [
];

export default productosNotablesValidation;
