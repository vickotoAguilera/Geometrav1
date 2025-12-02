/**
 * Funciones para verificar y desbloquear logros
 */

import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Achievement } from '@/types/user-profile';
import { getAllAchievementDefinitions, getAchievementDefinition } from './achievements-definitions';

/**
 * Verifica qué logros debería tener el usuario basado en su progreso
 * y retorna los logros que aún no ha desbloqueado
 */
export function checkNewAchievements(
    progress: any,
    currentAchievements: Achievement[]
): string[] {
    const allDefinitions = getAllAchievementDefinitions();
    const unlockedIds = new Set(currentAchievements.map(a => a.id));
    const newAchievements: string[] = [];

    for (const definition of allDefinitions) {
        // Si ya está desbloqueado, continuar
        if (unlockedIds.has(definition.id)) {
            continue;
        }

        // Verificar si cumple la condición
        if (definition.condition(progress)) {
            newAchievements.push(definition.id);
        }
    }

    return newAchievements;
}

/**
 * Desbloquea un logro para el usuario
 */
export async function unlockAchievement(
    firestore: Firestore,
    userId: string,
    achievementId: string
): Promise<Achievement | null> {
    const definition = getAchievementDefinition(achievementId);
    if (!definition) {
        console.error(`Achievement definition not found: ${achievementId}`);
        return null;
    }

    const achievement: Achievement = {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        category: definition.category,
        unlockedAt: serverTimestamp() as any,
    };

    try {
        const progressRef = doc(firestore, 'users', userId, 'progress', 'data');
        await updateDoc(progressRef, {
            achievements: arrayUnion(achievement),
        });

        return achievement;
    } catch (error) {
        console.error('Error unlocking achievement:', error);
        return null;
    }
}

/**
 * Verifica y desbloquea automáticamente todos los logros nuevos
 */
export async function checkAndUnlockAchievements(
    firestore: Firestore,
    userId: string,
    progress: any
): Promise<Achievement[]> {
    const newAchievementIds = checkNewAchievements(progress, progress.achievements || []);
    const unlockedAchievements: Achievement[] = [];

    for (const achievementId of newAchievementIds) {
        const achievement = await unlockAchievement(firestore, userId, achievementId);
        if (achievement) {
            unlockedAchievements.push(achievement);
        }
    }

    return unlockedAchievements;
}
