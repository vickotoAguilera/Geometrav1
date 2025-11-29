// Funciones de Firestore para ejercicios

import { firestore } from '@/firebase';
import { collection, doc, getDoc, setDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { DragDropExercise, FillInBlanksExercise, ExerciseResult } from '@/types/exercises';
import { generateExercises } from '@/ai/flows/exercise-generator';

type Exercise = DragDropExercise | FillInBlanksExercise;

/**
 * Obtiene ejercicios de una materia (desde caché o generando nuevos)
 */
export async function getExercisesForSubject(
    gradeId: string,
    subjectId: string,
    count: number = 20
): Promise<Exercise[]> {
    // Intentar obtener desde caché
    const cachedExercises = await getCachedExercises(gradeId, subjectId);

    if (cachedExercises.length >= count) {
        // Retornar ejercicios cacheados (mezclados aleatoriamente)
        return shuffleArray(cachedExercises).slice(0, count);
    }

    // No hay suficientes ejercicios en caché, generar nuevos
    console.log(`Generating ${count} exercises for ${gradeId}/${subjectId}`);

    const newExercises = await generateExercises({
        gradeId,
        subjectId,
        type: 'mixed',
        count,
        difficulty: 'medio',
    });

    // Guardar en caché
    await cacheExercises(gradeId, subjectId, newExercises);

    return newExercises;
}

/**
 * Obtiene ejercicios desde el caché de Firestore
 */
async function getCachedExercises(
    gradeId: string,
    subjectId: string
): Promise<Exercise[]> {
    try {
        const exercisesRef = collection(firestore, 'exercises', gradeId, subjectId);
        const snapshot = await getDocs(exercisesRef);

        const exercises: Exercise[] = [];
        snapshot.forEach(doc => {
            exercises.push(doc.data() as Exercise);
        });

        return exercises;
    } catch (error) {
        console.error('Error getting cached exercises:', error);
        return [];
    }
}

/**
 * Guarda ejercicios en el caché de Firestore
 */
async function cacheExercises(
    gradeId: string,
    subjectId: string,
    exercises: Exercise[]
): Promise<void> {
    try {
        for (const exercise of exercises) {
            const exerciseRef = doc(firestore, 'exercises', gradeId, subjectId, exercise.id);
            await setDoc(exerciseRef, {
                ...exercise,
                cachedAt: serverTimestamp(),
            });
        }
        console.log(`Cached ${exercises.length} exercises for ${gradeId}/${subjectId}`);
    } catch (error) {
        console.error('Error caching exercises:', error);
    }
}

/**
 * Guarda el resultado de un ejercicio completado
 */
export async function saveExerciseResult(
    userId: string,
    result: ExerciseResult
): Promise<void> {
    try {
        const resultRef = doc(
            firestore,
            'userProgress',
            userId,
            'exercises',
            result.exerciseId
        );

        await setDoc(resultRef, {
            ...result,
            completedAt: serverTimestamp(),
        });

        console.log(`Saved result for exercise ${result.exerciseId}`);
    } catch (error) {
        console.error('Error saving exercise result:', error);
        throw error;
    }
}

/**
 * Obtiene el progreso del usuario en una materia
 */
export async function getUserProgressForSubject(
    userId: string,
    gradeId: string,
    subjectId: string
): Promise<{
    completed: number;
    totalPoints: number;
    averageScore: number;
}> {
    try {
        // Obtener todos los ejercicios de la materia
        const exercisesRef = collection(firestore, 'exercises', gradeId, subjectId);
        const exercisesSnapshot = await getDocs(exercisesRef);
        const exerciseIds = exercisesSnapshot.docs.map(doc => doc.id);

        // Obtener resultados del usuario
        const resultsRef = collection(firestore, 'userProgress', userId, 'exercises');
        const resultsSnapshot = await getDocs(resultsRef);

        let completed = 0;
        let totalPoints = 0;
        let totalScore = 0;

        resultsSnapshot.forEach(doc => {
            const result = doc.data() as ExerciseResult;
            if (exerciseIds.includes(result.exerciseId) && result.isCorrect) {
                completed++;
                totalPoints += result.pointsEarned;
                totalScore += 100; // Asumimos 100% si es correcto
            }
        });

        const averageScore = completed > 0 ? totalScore / completed : 0;

        return {
            completed,
            totalPoints,
            averageScore,
        };
    } catch (error) {
        console.error('Error getting user progress:', error);
        return {
            completed: 0,
            totalPoints: 0,
            averageScore: 0,
        };
    }
}

/**
 * Mezcla un array aleatoriamente (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
