/**
 * Validación de ejercicios: potencias-y-raices
 * Curso: 1-medio
 * 
 * Este archivo contiene las reglas de validación y retroalimentación
 * para los ejercicios de potencias-y-raices.
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

export const potenciasYRaicesValidation: ExerciseValidation[] = [
];

export default potenciasYRaicesValidation;
