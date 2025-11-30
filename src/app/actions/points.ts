// Funciones para manejo de puntos de usuario en Firestore

'use server';

import { getFirestore } from '@/firebase/server';

const firestore = getFirestore();

/**
 * Actualiza los puntos totales del usuario
 */
export async function updateUserPoints(userId: string, pointsToAdd: number) {
    try {
        const userRef = firestore.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Si el usuario no existe, crear documento con puntos iniciales
            await userRef.set({
                totalPoints: pointsToAdd,
                lastUpdated: new Date(),
            }, { merge: true });
        } else {
            // Incrementar puntos existentes
            const currentPoints = userDoc.data()?.totalPoints || 0;
            await userRef.update({
                totalPoints: currentPoints + pointsToAdd,
                lastUpdated: new Date(),
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating user points:', error);
        return { success: false, error: 'Failed to update points' };
    }
}

/**
 * Obtiene los puntos totales del usuario
 */
export async function getUserTotalPoints(userId: string): Promise<number> {
    try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        return userDoc.data()?.totalPoints || 0;
    } catch (error) {
        console.error('Error getting user points:', error);
        return 0;
    }
}

/**
 * Obtiene los puntos de todos los usuarios para el ranking
 */
export async function getAllUsersPoints(limit: number = 10) {
    try {
        const snapshot = await firestore
            .collection('users')
            .orderBy('totalPoints', 'desc')
            .limit(limit)
            .get();

        const users: Array<{
            userId: string;
            name: string;
            totalPoints: number;
            photoURL?: string;
        }> = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                userId: doc.id,
                name: data.name || data.displayName || 'Usuario',
                totalPoints: data.totalPoints || 0,
                photoURL: data.photoURL,
            });
        });

        return { success: true, users };
    } catch (error) {
        console.error('Error getting users ranking:', error);
        return { success: false, users: [], error: 'Failed to get ranking' };
    }
}

/**
 * Obtiene la posición del usuario en el ranking
 */
export async function getUserRanking(userId: string): Promise<number> {
    try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        const userPoints = userDoc.data()?.totalPoints || 0;

        // Contar cuántos usuarios tienen más puntos
        const snapshot = await firestore
            .collection('users')
            .where('totalPoints', '>', userPoints)
            .get();

        return snapshot.size + 1; // +1 porque la posición es 1-indexed
    } catch (error) {
        console.error('Error getting user ranking:', error);
        return 0;
    }
}

/**
 * Calcula puntos totales desde los resultados de ejercicios
 * (útil para sincronizar si hay desincronización)
 */
export async function recalculateUserPoints(userId: string) {
    try {
        const resultsSnapshot = await firestore
            .collection('userProgress')
            .doc(userId)
            .collection('exercises')
            .get();

        let totalPoints = 0;
        resultsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.isCorrect && data.pointsEarned) {
                totalPoints += data.pointsEarned;
            }
        });

        // Actualizar puntos del usuario
        await firestore.collection('users').doc(userId).update({
            totalPoints,
            lastUpdated: new Date(),
        });

        return { success: true, totalPoints };
    } catch (error) {
        console.error('Error recalculating user points:', error);
        return { success: false, error: 'Failed to recalculate points' };
    }
}
