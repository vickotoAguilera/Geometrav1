// Server Actions para ejercicios

'use server';

import { getFirestore } from '@/firebase/server';
import { generateExercises } from '@/ai/flows/exercise-generator';
import type { DragDropExercise, FillInBlanksExercise, ExerciseResult } from '@/types/exercises';

const firestore = getFirestore();

type Exercise = DragDropExercise | FillInBlanksExercise;

export async function getExercises(gradeId: string, subjectId: string, count: number = 20) {
    try {
<<<<<<< HEAD
        // Intentar obtener desde caché
        const exercisesRef = firestore.collection('exercises').doc(gradeId).collection(subjectId);
        const snapshot = await exercisesRef.get();

        const cachedExercises: Exercise[] = [];
        snapshot.forEach(doc => {
            cachedExercises.push(doc.data() as Exercise);
        });

        if (cachedExercises.length >= count) {
            // Retornar ejercicios cacheados (mezclados)
            const shuffled = shuffleArray(cachedExercises);
            return { success: true, exercises: shuffled.slice(0, count) };
        }

        // No hay suficientes, generar nuevos
        console.log(`Generating ${count} exercises for ${gradeId}/${subjectId}`);

        try {
            const newExercises = await generateExercises({
                gradeId,
                subjectId,
                type: 'mixed',
                count,
                difficulty: 'medio',
            });

            // Cachear en Firestore
            for (const exercise of newExercises) {
                await firestore
                    .collection('exercises')
                    .doc(gradeId)
                    .collection(subjectId)
                    .doc(exercise.id)
                    .set({
                        ...exercise,
                        cachedAt: new Date(),
                    });
            }

            return { success: true, exercises: newExercises };
        } catch (aiError) {
            console.error('AI generation failed, using fallback exercises:', aiError);
            // Usar ejercicios de fallback si la IA falla
            const { getFallbackExercises } = await import('@/lib/fallback-exercises');
            const fallbackExercises = getFallbackExercises(subjectId, count);
            return { success: true, exercises: fallbackExercises };
        }
    } catch (error) {
        console.error('Error getting exercises:', error);
        // En caso de error total, usar fallback
=======
        // Cargar ejercicios desde R2 con items de drag-drop desordenados
        const { loadRandomExercises } = await import('@/lib/r2-exercises');
        const exercises = await loadRandomExercises(gradeId, subjectId, count);

        if (exercises.length > 0) {
            console.log(`✅ Loaded ${exercises.length} exercises from R2 for ${gradeId}/${subjectId}`);
            return { success: true, exercises };
        }

        // Si no hay ejercicios en R2, usar fallback
        console.warn(`No exercises found in R2 for ${gradeId}/${subjectId}, using fallback`);
        const { getFallbackExercises } = await import('@/lib/fallback-exercises');
        const fallbackExercises = getFallbackExercises(subjectId, count);
        return { success: true, exercises: fallbackExercises };

    } catch (error) {
        console.error('Error getting exercises from R2:', error);

        // En caso de error, usar fallback
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
        try {
            const { getFallbackExercises } = await import('@/lib/fallback-exercises');
            const fallbackExercises = getFallbackExercises(subjectId, count);
            return { success: true, exercises: fallbackExercises };
        } catch (fallbackError) {
            return { success: false, error: 'Failed to load exercises', exercises: [] };
        }
    }
}

export async function saveResult(userId: string, result: ExerciseResult) {
    try {
        await firestore
            .collection('userProgress')
            .doc(userId)
            .collection('exercises')
            .doc(result.exerciseId)
            .set({
                ...result,
                completedAt: new Date(),
            });

        // Actualizar puntos del usuario si ganó puntos
        if (result.pointsEarned > 0) {
            const { updateUserPoints } = await import('@/app/actions/points');
            await updateUserPoints(userId, result.pointsEarned);
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving result:', error);
        return { success: false, error: 'Failed to save result' };
    }
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export async function getMixedExercisesAction(gradeId: string, count: number = 50) {
    try {
        // Intentar obtener desde caché
        const mixedRef = firestore.collection('exercises').doc('mixed').collection(gradeId).doc('data');
        const snapshot = await mixedRef.get();

        // Verificar si el caché existe y es válido (menos de 7 días)
        if (snapshot.exists) {
            const data = snapshot.data();
            const cachedAt = data?.cachedAt?.toDate();
            const exercises = data?.exercises || [];

            if (cachedAt) {
                const now = new Date();
                const diffDays = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60 * 24);

                if (diffDays <= 7 && exercises.length >= count) {
                    console.log(`Using cached mixed exercises for ${gradeId}`);
                    const shuffled = shuffleArray(exercises);
                    return { success: true, exercises: shuffled.slice(0, count) };
                }
            }
        }

        // Generar nuevos ejercicios mixtos
        console.log(`Generating ${count} mixed exercises for ${gradeId}`);

        try {
            const { generateMixedExercises } = await import('@/ai/flows/exercise-generator');
            const newExercises = await generateMixedExercises(gradeId, count);

            // Cachear en Firestore
            await mixedRef.set({
                exercises: newExercises,
                cachedAt: new Date(),
                version: 1,
            });

            return { success: true, exercises: newExercises };
        } catch (aiError) {
            console.error('AI generation failed for mixed exercises:', aiError);
            // Usar ejercicios de fallback si la IA falla
            const { getFallbackExercises } = await import('@/lib/fallback-exercises');
            const fallbackExercises = getFallbackExercises('mixto', count);
            return { success: true, exercises: fallbackExercises };
        }
    } catch (error) {
        console.error('Error getting mixed exercises:', error);
        // En caso de error total, usar fallback
        try {
            const { getFallbackExercises } = await import('@/lib/fallback-exercises');
            const fallbackExercises = getFallbackExercises('mixto', count);
            return { success: true, exercises: fallbackExercises };
        } catch (fallbackError) {
            return { success: false, error: 'Failed to load mixed exercises', exercises: [] };
        }
    }
}

