/**
 * Validación de ejercicios: numeros-complejos
 * Curso: 3-medio
 * 
 * Este archivo contiene las reglas de validación y retroalimentación
 * para los ejercicios de numeros-complejos.
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

export const numerosComplejosValidation: ExerciseValidation[] = [
];

export default numerosComplejosValidation;
