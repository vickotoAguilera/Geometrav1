// Utilidades para estadísticas de tiempo

/**
 * Formatea segundos a formato MM:SS
 */
export function formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formatea segundos a formato legible (ej: "2h 30m" o "45m" o "30s")
 */
export function formatTimeHuman(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Calcula el tiempo promedio de un array de resultados
 */
export function calculateAverageTime(results: { timeSpent: number }[]): number {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.timeSpent, 0);
    return Math.round(total / results.length);
}

/**
 * Calcula el tiempo total de un array de resultados
 */
export function calculateTotalTime(results: { timeSpent: number }[]): number {
    return results.reduce((sum, result) => sum + result.timeSpent, 0);
}

/**
 * Agrupa resultados por materia y calcula tiempo total por cada una
 */
export function getTimeBySubject(
    results: { timeSpent: number; exerciseId: string }[],
    exerciseSubjectMap: Record<string, string>
): Record<string, number> {
    const timeBySubject: Record<string, number> = {};

    results.forEach((result) => {
        const subject = exerciseSubjectMap[result.exerciseId] || 'Desconocido';
        timeBySubject[subject] = (timeBySubject[subject] || 0) + result.timeSpent;
    });

    return timeBySubject;
}

/**
 * Obtiene estadísticas de tiempo de un usuario
 */
export interface TimeStatistics {
    totalTime: number;
    averageTime: number;
    totalExercises: number;
    timeBySubject: Record<string, number>;
}

export function calculateTimeStatistics(
    results: { timeSpent: number; exerciseId: string }[],
    exerciseSubjectMap: Record<string, string> = {}
): TimeStatistics {
    return {
        totalTime: calculateTotalTime(results),
        averageTime: calculateAverageTime(results),
        totalExercises: results.length,
        timeBySubject: getTimeBySubject(results, exerciseSubjectMap),
    };
}
