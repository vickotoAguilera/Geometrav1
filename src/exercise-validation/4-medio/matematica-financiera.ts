/**
 * Validación de ejercicios: matematica-financiera
 * Curso: 4-medio
 * 
 * Este archivo contiene las reglas de validación y retroalimentación
 * para los ejercicios de matematica-financiera.
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

export const matematicaFinancieraValidation: ExerciseValidation[] = [
];

export default matematicaFinancieraValidation;
