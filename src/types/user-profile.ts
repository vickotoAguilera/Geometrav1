import { Timestamp } from 'firebase/firestore';

/**
 * Roles de usuario en el sistema
 */
export type UserRole = 'student' | 'teacher' | 'admin';

/**
 * Estado de solicitud de docente
 */
export type TeacherRequestStatus = 'pending' | 'approved' | 'rejected';

/**
 * Solicitud para ser docente
 */
export interface TeacherRequest {
    status: TeacherRequestStatus;
    requestedAt: Timestamp;
    reviewedAt?: Timestamp;
    reviewedBy?: string; // userId del admin
    reason?: string; // Razón de la solicitud
    rejectionReason?: string; // Razón del rechazo
}

/**
 * Perfil básico del usuario
 */
export interface UserProfile {
    displayName: string;
    photoURL: string | null;
    bio: string;
    grade: string; // ej: "3° Medio" - Solo para estudiantes
    goals: string[];
    preferences: UserPreferences;
    createdAt: Timestamp;
    updatedAt: Timestamp;

    // Sistema de roles
    role: UserRole;
    teacherRequest?: TeacherRequest;

    // Solo para docentes
    subjects?: string[]; // Materias que enseña
    institution?: string; // Institución donde trabaja
}

/**
 * Preferencias del usuario
 */
export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailUpdates: boolean;
    learningReminders: boolean;
}

/**
 * Nivel matemático del usuario por área
 */
export interface MathLevel {
    overall: number; // 1-100
    algebra: number; // 1-100
    geometry: number; // 1-100
    calculus: number; // 1-100
    trigonometry: number; // 1-100
    statistics: number; // 1-100
    functions: number; // 1-100
    lastEvaluated: Timestamp;
    evaluationHistory: EvaluationResult[];
}

/**
 * Resultado de una evaluación
 */
export interface EvaluationResult {
    date: Timestamp;
    overall: number;
    byArea: {
        algebra: number;
        geometry: number;
        calculus: number;
        trigonometry: number;
        statistics: number;
        functions: number;
    };
    questionsAnswered: number;
    correctAnswers: number;
}

/**
 * Perfil de aprendizaje del usuario
 */
export interface LearningProfile {
    strengths: string[]; // Temas dominados
    weaknesses: string[]; // Temas a reforzar
    learningStyle: 'visual' | 'auditivo' | 'kinestésico' | 'mixto';
    preferredDifficulty: 'fácil' | 'medio' | 'difícil' | 'adaptativo';
    studyGoals: StudyGoal[];
    recommendedTopics: string[];
}

/**
 * Objetivo de estudio
 */
export interface StudyGoal {
    id: string;
    title: string;
    description: string;
    targetDate: Timestamp;
    completed: boolean;
    progress: number; // 0-100
}

export interface UserProgress {
    level: number;
    points: number;
    completedTopics: string[];
    currentStreak: number;
    lastActivityDate: Date | Timestamp;
}

export interface UserStats {
    totalExercises: number;
    correctAnswers: number;
    averageScore: number;
    studyTimeMinutes: number;
}

/**
 * Progreso del usuario
 */
export interface OriginalUserProgress { // Renamed to avoid conflict
    totalPoints: number;
    level: number;
    currentLevelPoints: number; // Puntos en el nivel actual
    pointsToNextLevel: number; // Puntos necesarios para siguiente nivel
    streak: number; // Días consecutivos
    longestStreak: number;
    lastActivityDate: Timestamp;
    exercisesCompleted: number;
    testsCompleted: number;
    averageScore: number;
    totalStudyTime: number; // En minutos
    achievements: Achievement[];
}

/**
 * Logro desbloqueado
 */
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: Timestamp;
    category: 'ejercicios' | 'pruebas' | 'racha' | 'nivel' | 'especial';
}

/**
 * Configuración del tutor personal
 */
export interface PersonalTutorConfig {
    conversationHistory: TutorMessage[];
    recommendedTopics: string[];
    generatedExercises: AdaptiveExercise[];
    lastInteraction: Timestamp;
    totalInteractions: number;
    adaptiveSettings: {
        focusOnWeaknesses: boolean;
        difficultyAdjustment: 'manual' | 'automatic';
        exerciseFrequency: 'low' | 'medium' | 'high';
    };
}

/**
 * Mensaje del tutor personal
 */
export interface TutorMessage {
    id: string;
    role: 'user' | 'tutor';
    content: string;
    timestamp: Timestamp;
    context?: {
        topic?: string;
        difficulty?: string;
        relatedExercises?: string[];
    };
}

/**
 * Ejercicio adaptativo generado por la IA
 */
export interface AdaptiveExercise {
    id: string;
    topic: string;
    difficulty: number; // 1-10
    question: string;
    options?: string[]; // Para múltiple opción
    correctAnswer: string;
    explanation: string;
    hints: string[];
    completed: boolean;
    userAnswer?: string;
    isCorrect?: boolean;
    attempts: number;
    generatedAt: Timestamp;
    completedAt?: Timestamp;
}

/**
 * Estadísticas de actividad
 */
export interface ActivityStats {
    daily: DailyActivity[];
    weekly: WeeklyActivity[];
    monthly: MonthlyActivity[];
}

export interface DailyActivity {
    date: string; // YYYY-MM-DD
    exercisesCompleted: number;
    testsCompleted: number;
    pointsEarned: number;
    studyTime: number; // minutos
}

export interface WeeklyActivity {
    weekStart: string; // YYYY-MM-DD
    weekEnd: string;
    totalExercises: number;
    totalTests: number;
    totalPoints: number;
    totalStudyTime: number;
    averageScore: number;
}

export interface MonthlyActivity {
    month: string; // YYYY-MM
    totalExercises: number;
    totalTests: number;
    totalPoints: number;
    totalStudyTime: number;
    averageScore: number;
    topTopics: { topic: string; count: number }[];
}

/**
 * Datos completos del usuario (agregación de todas las colecciones)
 */
export interface CompleteUserData {
    profile: UserProfile;
    mathLevel: MathLevel;
    learningProfile: LearningProfile;
    progress: UserProgress;
    tutorConfig: PersonalTutorConfig;
    stats: ActivityStats;
}
