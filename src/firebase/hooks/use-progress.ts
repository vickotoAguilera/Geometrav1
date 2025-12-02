/**
 * Hook personalizado para gestionar el progreso del usuario
 */

'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { OriginalUserProgress as UserProgress } from '@/types/user-profile';
import { getLevelProgress, didLevelUp, getNewLevel } from '@/lib/points-system';

export function useProgress() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user || !firestore) {
            setProgress(null);
            setIsLoading(false);
            return;
        }

        const fetchProgress = async () => {
            try {
                setIsLoading(true);
                const progressRef = doc(firestore, 'users', user.uid, 'progress', 'data');
                const progressSnap = await getDoc(progressRef);

                if (progressSnap.exists()) {
                    const data = progressSnap.data() as UserProgress;
                    setProgress(data);
                } else {
                    // Crear progreso inicial
                    const initialProgress: UserProgress = {
                        totalPoints: 0,
                        level: 1,
                        currentLevelPoints: 0,
                        pointsToNextLevel: 100,
                        streak: 0,
                        longestStreak: 0,
                        lastActivityDate: serverTimestamp() as any,
                        exercisesCompleted: 0,
                        testsCompleted: 0,
                        averageScore: 0,
                        totalStudyTime: 0,
                        achievements: [],
                    };

                    await setDoc(progressRef, initialProgress);
                    setProgress(initialProgress);
                }
            } catch (err) {
                console.error('Error fetching progress:', err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProgress();
    }, [user, firestore]);

    const addPoints = async (points: number): Promise<{ leveledUp: boolean; newLevel?: number }> => {
        if (!user || !firestore || !progress) {
            throw new Error('Usuario no autenticado o progreso no cargado');
        }

        try {
            const progressRef = doc(firestore, 'users', user.uid, 'progress', 'data');
            const previousPoints = progress.totalPoints;
            const newPoints = previousPoints + points;

            // Verificar si subió de nivel
            const leveledUp = didLevelUp(previousPoints, newPoints);
            const newLevelData = leveledUp ? getNewLevel(previousPoints, newPoints) : null;

            // Calcular progreso de nivel
            const levelProgressData = getLevelProgress(newPoints);

            // Actualizar en Firestore
            await updateDoc(progressRef, {
                totalPoints: increment(points),
                level: levelProgressData.currentLevel.level,
                currentLevelPoints: levelProgressData.currentLevelPoints,
                pointsToNextLevel: levelProgressData.pointsToNextLevel,
                lastActivityDate: serverTimestamp(),
            });

            // Actualizar estado local
            setProgress(prev => prev ? {
                ...prev,
                totalPoints: newPoints,
                level: levelProgressData.currentLevel.level,
                currentLevelPoints: levelProgressData.currentLevelPoints,
                pointsToNextLevel: levelProgressData.pointsToNextLevel,
            } : null);

            return {
                leveledUp,
                newLevel: newLevelData?.level,
            };
        } catch (err) {
            console.error('Error adding points:', err);
            throw err;
        }
    };

    const incrementExercises = async () => {
        if (!user || !firestore) {
            throw new Error('Usuario no autenticado');
        }

        try {
            const progressRef = doc(firestore, 'users', user.uid, 'progress', 'data');
            await updateDoc(progressRef, {
                exercisesCompleted: increment(1),
                lastActivityDate: serverTimestamp(),
            });

            setProgress(prev => prev ? {
                ...prev,
                exercisesCompleted: prev.exercisesCompleted + 1,
            } : null);
        } catch (err) {
            console.error('Error incrementing exercises:', err);
            throw err;
        }
    };

    const incrementTests = async () => {
        if (!user || !firestore) {
            throw new Error('Usuario no autenticado');
        }

        try {
            const progressRef = doc(firestore, 'users', user.uid, 'progress', 'data');
            await updateDoc(progressRef, {
                testsCompleted: increment(1),
                lastActivityDate: serverTimestamp(),
            });

            setProgress(prev => prev ? {
                ...prev,
                testsCompleted: prev.testsCompleted + 1,
            } : null);
        } catch (err) {
            console.error('Error incrementing tests:', err);
            throw err;
        }
    };

    const updateStreak = async (newStreak: number) => {
        if (!user || !firestore || !progress) {
            throw new Error('Usuario no autenticado');
        }

        try {
            const progressRef = doc(firestore, 'users', user.uid, 'progress', 'data');
            const longestStreak = Math.max(progress.longestStreak, newStreak);

            await updateDoc(progressRef, {
                streak: newStreak,
                longestStreak,
                lastActivityDate: serverTimestamp(),
            });

            setProgress(prev => prev ? {
                ...prev,
                streak: newStreak,
                longestStreak,
            } : null);
        } catch (err) {
            console.error('Error updating streak:', err);
            throw err;
        }
    };

    const addAchievement = async (achievement: any) => {
        if (!user || !firestore) {
            throw new Error('Usuario no autenticado');
        }

        try {
            const progressRef = doc(firestore, 'users', user.uid, 'progress', 'data');
            await updateDoc(progressRef, {
                achievements: [...(progress?.achievements || []), achievement],
            });

            setProgress(prev => prev ? {
                ...prev,
                achievements: [...(prev.achievements || []), achievement],
            } : null);
        } catch (err) {
            console.error('Error adding achievement:', err);
            throw err;
        }
    };

    return {
        progress,
        isLoading,
        error,
        addPoints,
        incrementExercises,
        incrementTests,
        updateStreak,
        addAchievement,
    };
}
