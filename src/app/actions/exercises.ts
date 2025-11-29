// Server Actions para ejercicios

'use server';

import { getFirestore } from '@/firebase/server';
import { generateExercises } from '@/ai/flows/exercise-generator';
import type { DragDropExercise, FillInBlanksExercise, ExerciseResult } from '@/types/exercises';

const firestore = getFirestore();

type Exercise = DragDropExercise | FillInBlanksExercise;

export async function getExercises(gradeId: string, subjectId: string, count: number = 20) {
    try {
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
