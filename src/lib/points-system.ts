/**
 * Sistema de puntos y niveles para Geometra
 * 
 * Este módulo define las reglas para otorgar puntos por actividades
 * y calcular el nivel del usuario basado en puntos acumulados.
 */

export interface Level {
    level: number;
    name: string;
    minPoints: number;
    maxPoints: number;
    icon: string;
    color: string;
}

export interface PointsRule {
    activity: string;
    points: number;
    description: string;
}

/**
 * Definición de niveles
 */
export const LEVELS: Level[] = [
    {
        level: 1,
        name: 'Principiante',
        minPoints: 0,
        maxPoints: 99,
        icon: '🌱',
        color: '#10b981', // green-500
    },
    {
        level: 2,
        name: 'Aprendiz',
        minPoints: 100,
        maxPoints: 299,
        icon: '📚',
        color: '#3b82f6', // blue-500
    },
    {
        level: 3,
        name: 'Estudiante',
        minPoints: 300,
        maxPoints: 599,
        icon: '✏️',
        color: '#8b5cf6', // violet-500
    },
    {
        level: 4,
        name: 'Intermedio',
        minPoints: 600,
        maxPoints: 999,
        icon: '📖',
        color: '#f59e0b', // amber-500
    },
    {
        level: 5,
        name: 'Avanzado',
        minPoints: 1000,
        maxPoints: 1499,
        icon: '⭐',
        color: '#ef4444', // red-500
    },
    {
        level: 6,
        name: 'Experto',
        minPoints: 1500,
        maxPoints: 2499,
        icon: '🏆',
        color: '#ec4899', // pink-500
    },
    {
        level: 7,
        name: 'Maestro',
        minPoints: 2500,
        maxPoints: Infinity,
        icon: '👑',
        color: '#fbbf24', // yellow-400
    },
];

/**
 * Reglas de puntos por actividad
 */
export const POINTS_RULES: PointsRule[] = [
    {
        activity: 'ejercicio_completado',
        points: 10,
        description: 'Completar un ejercicio',
    },
    {
        activity: 'ejercicio_perfecto',
        points: 20,
        description: 'Completar un ejercicio sin errores',
    },
    {
        activity: 'prueba_completada',
        points: 50,
        description: 'Completar una prueba',
    },
    {
        activity: 'prueba_perfecta',
        points: 100,
        description: 'Obtener 100% en una prueba',
    },
    {
        activity: 'paes_completada',
        points: 75,
        description: 'Completar una prueba PAES',
    },
    {
        activity: 'paes_alto_puntaje',
        points: 150,
        description: 'Obtener más de 90% en PAES',
    },
    {
        activity: 'racha_diaria',
        points: 5,
        description: 'Mantener racha diaria',
    },
    {
        activity: 'racha_semanal',
        points: 25,
        description: 'Completar 7 días consecutivos',
    },
    {
        activity: 'evaluacion_inicial',
        points: 30,
        description: 'Completar evaluación inicial de nivel',
    },
    {
        activity: 'tutor_personal_interaccion',
        points: 5,
        description: 'Interactuar con el tutor personal',
    },
    {
        activity: 'nota_creada',
        points: 3,
        description: 'Crear una nota personal',
    },
    {
        activity: 'highlight_creado',
        points: 2,
        description: 'Crear un highlight en material de estudio',
    },
];

/**
 * Calcula el nivel basado en puntos totales
 */
export function calculateLevel(totalPoints: number): Level {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalPoints >= LEVELS[i].minPoints) {
            return LEVELS[i];
        }
    }
    return LEVELS[0]; // Principiante por defecto
}

/**
 * Obtiene información del nivel actual y progreso al siguiente
 */
export function getLevelProgress(totalPoints: number): {
    currentLevel: Level;
    nextLevel: Level | null;
    currentLevelPoints: number;
    pointsToNextLevel: number;
    progressPercentage: number;
} {
    const currentLevel = calculateLevel(totalPoints);
    const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);
    const nextLevel = currentLevelIndex < LEVELS.length - 1 ? LEVELS[currentLevelIndex + 1] : null;

    const currentLevelPoints = totalPoints - currentLevel.minPoints;
    const pointsToNextLevel = nextLevel ? nextLevel.minPoints - totalPoints : 0;

    const levelRange = nextLevel
        ? nextLevel.minPoints - currentLevel.minPoints
        : 1;

    const progressPercentage = nextLevel
        ? Math.min(100, (currentLevelPoints / levelRange) * 100)
        : 100;

    return {
        currentLevel,
        nextLevel,
        currentLevelPoints,
        pointsToNextLevel,
        progressPercentage,
    };
}

/**
 * Obtiene los puntos por una actividad específica
 */
export function getPointsForActivity(activity: string): number {
    const rule = POINTS_RULES.find(r => r.activity === activity);
    return rule ? rule.points : 0;
}

/**
 * Verifica si el usuario subió de nivel
 */
export function didLevelUp(previousPoints: number, newPoints: number): boolean {
    const previousLevel = calculateLevel(previousPoints);
    const newLevel = calculateLevel(newPoints);
    return newLevel.level > previousLevel.level;
}

/**
 * Obtiene el nuevo nivel si hubo cambio
 */
export function getNewLevel(previousPoints: number, newPoints: number): Level | null {
    if (didLevelUp(previousPoints, newPoints)) {
        return calculateLevel(newPoints);
    }
    return null;
}

/**
 * Calcula puntos totales de múltiples actividades
 */
export function calculateTotalPoints(activities: { activity: string; count: number }[]): number {
    return activities.reduce((total, { activity, count }) => {
        return total + (getPointsForActivity(activity) * count);
    }, 0);
}

/**
 * Obtiene todos los niveles disponibles
 */
export function getAllLevels(): Level[] {
    return LEVELS;
}

/**
 * Obtiene un nivel específico por número
 */
export function getLevelByNumber(levelNumber: number): Level | undefined {
    return LEVELS.find(l => l.level === levelNumber);
}
