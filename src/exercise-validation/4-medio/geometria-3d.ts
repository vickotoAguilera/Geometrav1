/**
 * Validación de ejercicios: geometria-3d
 * Curso: 4-medio
 * 
 * Este archivo contiene las reglas de validación y retroalimentación
 * para los ejercicios de geometria-3d.
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

export const geometria3dValidation: ExerciseValidation[] = [
];

export default geometria3dValidation;
