/**
 * Validación de ejercicios: semejanza-triangulos
 * Curso: 1-medio
 * 
 * Este archivo contiene las reglas de validación y retroalimentación
 * para los ejercicios de semejanza-triangulos.
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

export const semejanzaTriangulosValidation: ExerciseValidation[] = [
];

export default semejanzaTriangulosValidation;
