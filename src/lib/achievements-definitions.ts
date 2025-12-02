/**
 * Definiciones de todos los logros disponibles en el sistema
 */

import type { Achievement } from '@/types/user-profile';

export interface AchievementDefinition {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'ejercicios' | 'pruebas' | 'racha' | 'nivel' | 'especial';
    condition: (progress: any) => boolean;
}

/**
 * Todas las definiciones de logros disponibles
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
    // Logros de Ejercicios
    {
        id: 'first_exercise',
        title: 'Primer Paso',
        description: 'Completa tu primer ejercicio',
        icon: '🎯',
        category: 'ejercicios',
        condition: (progress) => progress.exercisesCompleted >= 1,
    },
    {
        id: 'exercises_10',
        title: 'Practicante',
        description: 'Completa 10 ejercicios',
        icon: '📚',
        category: 'ejercicios',
        condition: (progress) => progress.exercisesCompleted >= 10,
    },
    {
        id: 'exercises_50',
        title: 'Dedicado',
        description: 'Completa 50 ejercicios',
        icon: '⭐',
        category: 'ejercicios',
        condition: (progress) => progress.exercisesCompleted >= 50,
    },
    {
        id: 'exercises_100',
        title: 'Centurión',
        description: 'Completa 100 ejercicios',
        icon: '💯',
        category: 'ejercicios',
        condition: (progress) => progress.exercisesCompleted >= 100,
    },
    {
        id: 'exercises_500',
        title: 'Maestro Practicante',
        description: 'Completa 500 ejercicios',
        icon: '🏆',
        category: 'ejercicios',
        condition: (progress) => progress.exercisesCompleted >= 500,
    },

    // Logros de Racha
    {
        id: 'streak_3',
        title: 'Constante',
        description: 'Mantén una racha de 3 días',
        icon: '🔥',
        category: 'racha',
        condition: (progress) => progress.streak >= 3,
    },
    {
        id: 'streak_7',
        title: 'Semana Perfecta',
        description: 'Mantén una racha de 7 días',
        icon: '🌟',
        category: 'racha',
        condition: (progress) => progress.streak >= 7,
    },
    {
        id: 'streak_30',
        title: 'Mes Imparable',
        description: 'Mantén una racha de 30 días',
        icon: '🚀',
        category: 'racha',
        condition: (progress) => progress.streak >= 30,
    },
    {
        id: 'streak_100',
        title: 'Leyenda',
        description: 'Mantén una racha de 100 días',
        icon: '👑',
        category: 'racha',
        condition: (progress) => progress.streak >= 100,
    },

    // Logros de Nivel
    {
        id: 'level_5',
        title: 'Aprendiz',
        description: 'Alcanza el nivel 5',
        icon: '🌱',
        category: 'nivel',
        condition: (progress) => progress.level >= 5,
    },
    {
        id: 'level_10',
        title: 'Estudiante Avanzado',
        description: 'Alcanza el nivel 10',
        icon: '📖',
        category: 'nivel',
        condition: (progress) => progress.level >= 10,
    },
    {
        id: 'level_20',
        title: 'Experto',
        description: 'Alcanza el nivel 20',
        icon: '🎓',
        category: 'nivel',
        condition: (progress) => progress.level >= 20,
    },
    {
        id: 'level_50',
        title: 'Maestro',
        description: 'Alcanza el nivel 50',
        icon: '🧙‍♂️',
        category: 'nivel',
        condition: (progress) => progress.level >= 50,
    },

    // Logros de Pruebas
    {
        id: 'first_test',
        title: 'Primera Evaluación',
        description: 'Completa tu primera prueba',
        icon: '📝',
        category: 'pruebas',
        condition: (progress) => progress.testsCompleted >= 1,
    },
    {
        id: 'tests_10',
        title: 'Evaluador',
        description: 'Completa 10 pruebas',
        icon: '✅',
        category: 'pruebas',
        condition: (progress) => progress.testsCompleted >= 10,
    },
    {
        id: 'tests_50',
        title: 'Examinado',
        description: 'Completa 50 pruebas',
        icon: '🎯',
        category: 'pruebas',
        condition: (progress) => progress.testsCompleted >= 50,
    },

    // Logros Especiales
    {
        id: 'perfect_score',
        title: 'Perfección',
        description: 'Obtén un promedio de 100%',
        icon: '💎',
        category: 'especial',
        condition: (progress) => progress.averageScore >= 100,
    },
    {
        id: 'high_achiever',
        title: 'Alto Rendimiento',
        description: 'Mantén un promedio superior al 90%',
        icon: '🌟',
        category: 'especial',
        condition: (progress) => progress.averageScore >= 90,
    },
    {
        id: 'points_1000',
        title: 'Millonario',
        description: 'Acumula 1000 puntos',
        icon: '💰',
        category: 'especial',
        condition: (progress) => progress.totalPoints >= 1000,
    },
    {
        id: 'points_5000',
        title: 'Multimillonario',
        description: 'Acumula 5000 puntos',
        icon: '💸',
        category: 'especial',
        condition: (progress) => progress.totalPoints >= 5000,
    },
];

/**
 * Obtiene todas las definiciones de logros
 */
export function getAllAchievementDefinitions(): AchievementDefinition[] {
    return ACHIEVEMENT_DEFINITIONS;
}

/**
 * Obtiene una definición de logro por ID
 */
export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
    return ACHIEVEMENT_DEFINITIONS.find(achievement => achievement.id === id);
}

/**
 * Obtiene definiciones de logros por categoría
 */
export function getAchievementsByCategory(category: Achievement['category']): AchievementDefinition[] {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => achievement.category === category);
}
