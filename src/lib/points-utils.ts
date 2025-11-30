// Utilidades para el sistema de puntos global

/**
 * Calcula el total de puntos de un array de resultados
 */
export function calculateTotalPoints(results: { pointsEarned: number }[]): number {
    return results.reduce((total, result) => total + result.pointsEarned, 0);
}

/**
 * Calcula puntos por curso
 */
export function getPointsByGrade(
    results: { pointsEarned: number; exerciseId: string }[],
    exerciseGradeMap: Record<string, string>
): Record<string, number> {
    const pointsByGrade: Record<string, number> = {};

    results.forEach((result) => {
        const grade = exerciseGradeMap[result.exerciseId] || 'Desconocido';
        pointsByGrade[grade] = (pointsByGrade[grade] || 0) + result.pointsEarned;
    });

    return pointsByGrade;
}

/**
 * Calcula puntos por materia
 */
export function getPointsBySubject(
    results: { pointsEarned: number; exerciseId: string }[],
    exerciseSubjectMap: Record<string, string>
): Record<string, number> {
    const pointsBySubject: Record<string, number> = {};

    results.forEach((result) => {
        const subject = exerciseSubjectMap[result.exerciseId] || 'Desconocido';
        pointsBySubject[subject] = (pointsBySubject[subject] || 0) + result.pointsEarned;
    });

    return pointsBySubject;
}

/**
 * Sistema de niveles basado en puntos
 */
export interface UserLevel {
    level: number;
    name: string;
    minPoints: number;
    maxPoints: number;
    icon: string;
}

export const LEVELS: UserLevel[] = [
    { level: 1, name: 'Principiante', minPoints: 0, maxPoints: 100, icon: '🌱' },
    { level: 2, name: 'Aprendiz', minPoints: 101, maxPoints: 300, icon: '📚' },
    { level: 3, name: 'Estudiante', minPoints: 301, maxPoints: 600, icon: '🎓' },
    { level: 4, name: 'Avanzado', minPoints: 601, maxPoints: 1000, icon: '⭐' },
    { level: 5, name: 'Experto', minPoints: 1001, maxPoints: 1500, icon: '🏆' },
    { level: 6, name: 'Maestro', minPoints: 1501, maxPoints: Infinity, icon: '👑' },
];

/**
 * Obtiene el nivel del usuario basado en sus puntos
 */
export function getUserLevel(points: number): UserLevel {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (points >= LEVELS[i].minPoints) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}

/**
 * Calcula los puntos necesarios para el siguiente nivel
 */
export function getNextLevelPoints(currentPoints: number): number {
    const currentLevel = getUserLevel(currentPoints);

    if (currentLevel.level === LEVELS.length) {
        return 0; // Ya está en el nivel máximo
    }

    const nextLevel = LEVELS[currentLevel.level]; // level es 1-indexed, array es 0-indexed
    return nextLevel.minPoints - currentPoints;
}

/**
 * Calcula el progreso hacia el siguiente nivel (0-100)
 */
export function getLevelProgress(points: number): number {
    const currentLevel = getUserLevel(points);

    if (currentLevel.level === LEVELS.length) {
        return 100; // Nivel máximo alcanzado
    }

    const pointsInLevel = points - currentLevel.minPoints;
    const levelRange = currentLevel.maxPoints - currentLevel.minPoints;

    return Math.round((pointsInLevel / levelRange) * 100);
}

/**
 * Formatea los puntos con separador de miles
 */
export function formatPoints(points: number): string {
    return points.toLocaleString('es-CL');
}
