/**
 * Validación de ejercicios: relaciones-metricas-circunferencia
 * Curso: 3-medio
 * 
 * Este archivo contiene las reglas de validación y retroalimentación
 * para los ejercicios de relaciones-metricas-circunferencia.
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

export const relacionesMetricasCircunferenciaValidation: ExerciseValidation[] = [
];

export default relacionesMetricasCircunferenciaValidation;
