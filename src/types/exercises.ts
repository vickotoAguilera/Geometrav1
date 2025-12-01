// Tipos para ejercicios interactivos con verificación automática

// Hint/Pista para ayudar al estudiante
export interface ExerciseHint {
    level: 1 | 2 | 3;
    text: string;
    pointsPenalty: number;
}

// Tipo base para todos los ejercicios
export interface BaseExercise {
    id: string;
    title: string;
    description: string;
    points: number;
    difficulty: 'facil' | 'medio' | 'dificil';
    hints?: ExerciseHint[]; // Pistas progresivas generadas por IA
}

// Ejercicio de arrastrar y soltar
export interface DragDropItem {
    id: string;
    content: string;
    correctPosition: number;
}

export interface DragDropExercise extends BaseExercise {
    type: 'drag-drop';
    items: DragDropItem[];
}

// Ejercicio de completar espacios
export interface FillInBlank {
    id: string;
    correctAnswer: string | string[]; // Puede aceptar múltiples respuestas válidas
    tolerance?: number; // Para respuestas numéricas (ej: 0.01 para aceptar 3.14 y 3.1416)
}

export interface FillInBlanksExercise extends BaseExercise {
    type: 'fill-in-blanks';
    template: string; // Texto con [___] para marcar espacios en blanco
    blanks: FillInBlank[];
}

// Ejercicio de construcción geométrica
export interface ValidationCriterion {
    type: 'point' | 'line' | 'circle' | 'angle' | 'distance';
    expected: any;
    tolerance: number;
}

export interface GeometryConstructionExercise extends BaseExercise {
    type: 'geometry-construction';
    instructions: string;
    geogebraFile?: string; // Archivo .ggb inicial (opcional)
    validationCriteria: ValidationCriterion[];
}

// Union type de todos los ejercicios
export type Exercise = DragDropExercise | FillInBlanksExercise | GeometryConstructionExercise;

// Resultado de un ejercicio
export interface ExerciseResult {
    exerciseId: string;
    userId: string;
    isCorrect: boolean;
    attempts: number;
    timeSpent: number; // en segundos
    pointsEarned: number;
    completedAt: Date;
}

// Estado de un ejercicio en progreso
export interface ExerciseState {
    exerciseId: string;
    startedAt: Date;
    attempts: number;
    currentAnswer?: any;
}
