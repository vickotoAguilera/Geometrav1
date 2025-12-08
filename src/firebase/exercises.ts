// Funciones de Firestore para ejercicios

import { initializeFirebase } from '@/firebase';
import { collection, doc, getDoc, setDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { DragDropExercise, FillInBlanksExercise, ExerciseResult } from '@/types/exercises';
import { generateExercises } from '@/ai/flows/exercise-generator';

const { firestore } = initializeFirebase();

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

/**
 * Obtiene ejercicios mixtos (desde caché o generando nuevos)
 */
export async function getMixedExercises(
    gradeId: string,
    count: number = 50
): Promise<Exercise[]> {
    // Intentar obtener desde caché
    const cachedExercises = await getCachedMixedExercises(gradeId);

    // Verificar si el caché es válido (menos de 7 días)
    if (cachedExercises.exercises.length >= count && !isCacheExpired(cachedExercises.cachedAt)) {
        console.log(`Using cached mixed exercises for ${gradeId}`);
        return shuffleArray(cachedExercises.exercises).slice(0, count);
    }

    // Generar nuevos ejercicios mixtos
    console.log(`Generating ${count} mixed exercises for ${gradeId}`);
    const { generateMixedExercises } = await import('@/ai/flows/exercise-generator');
    const newExercises = await generateMixedExercises(gradeId, count);

    // Guardar en caché
    await cacheMixedExercises(gradeId, newExercises);

    return newExercises;
}

/**
 * Obtiene ejercicios mixtos desde el caché de Firestore
 */
async function getCachedMixedExercises(
    gradeId: string
): Promise<{ exercises: Exercise[]; cachedAt: Date | null }> {
    try {
        const mixedRef = doc(firestore, 'exercises', 'mixed', gradeId, 'data');
        const snapshot = await getDoc(mixedRef);

        if (!snapshot.exists()) {
            return { exercises: [], cachedAt: null };
        }

        const data = snapshot.data();
        const cachedAt = data.cachedAt instanceof Timestamp
            ? data.cachedAt.toDate()
            : null;

        return {
            exercises: data.exercises || [],
            cachedAt,
        };
    } catch (error) {
        console.error('Error getting cached mixed exercises:', error);
        return { exercises: [], cachedAt: null };
    }
}

/**
 * Guarda ejercicios mixtos en el caché de Firestore
 */
async function cacheMixedExercises(
    gradeId: string,
    exercises: Exercise[]
): Promise<void> {
    try {
        const mixedRef = doc(firestore, 'exercises', 'mixed', gradeId, 'data');
        await setDoc(mixedRef, {
            exercises,
            cachedAt: serverTimestamp(),
            version: 1,
        });
        console.log(`Cached ${exercises.length} mixed exercises for ${gradeId}`);
    } catch (error) {
        console.error('Error caching mixed exercises:', error);
    }
}

/**
 * Verifica si el caché ha expirado (más de 7 días)
 */
function isCacheExpired(cachedAt: Date | null): boolean {
    if (!cachedAt) return true;

    const now = new Date();
    const diffDays = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60 * 24);

    return diffDays > 7;
}

