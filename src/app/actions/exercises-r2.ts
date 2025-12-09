// Server Actions para ejercicios con R2

'use server';

import { getExercisePool, selectRandomExercises, poolExists } from '@/lib/r2-exercises';
import { generateHintsForExercise } from '@/ai/flows/hints-generator';
import { generateExamplesForExercises } from '@/ai/flows/example-generator';
import { getFirestore } from '@/firebase/server';
import type { DragDropExercise, FillInBlanksExercise, ExerciseResult } from '@/types/exercises';

const firestore = getFirestore();

type Exercise = DragDropExercise | FillInBlanksExercise;

/**
 * Obtiene ejercicios desde R2 (con fallback al sistema actual)
 * AHORA CON EJEMPLOS GENERADOS POR IA
 */
export async function getExercisesFromR2(
    gradeId: string,
    subjectId: string,
    count: number = 20
) {
    try {
        console.log(`📚 Cargando ejercicios locales: ${gradeId}/${subjectId}`);

        // Importar funciones de ejercicios locales
        const { getExercisesFromValidation, selectRandomExercises } = await import('@/lib/local-exercises');

        // 1. Intentar cargar desde archivos de validación locales
        const pool = await getExercisesFromValidation(gradeId, subjectId);

        if (pool.length === 0) {
            console.log(`⚠️ No hay ejercicios en validación local, usando sistema actual`);
            const { getExercises } = await import('@/app/actions/exercises');
            return await getExercises(gradeId, subjectId, count);
        }

        // 2. Seleccionar ejercicios al azar
        const selected = selectRandomExercises(pool, count);

        console.log(`✅ Seleccionados ${selected.length} ejercicios de pool local de ${pool.length}`);

        return {
            success: true,
            exercises: selected,
            source: 'local-validation',
        };
    } catch (error) {
        console.error('Error cargando ejercicios locales:', error);

        // Fallback al sistema actual
        console.log(`⚠️ Error en validación local, usando sistema actual`);
        const { getExercises } = await import('@/app/actions/exercises');
        return await getExercises(gradeId, subjectId, count);
    }
}

/**
 * Genera hints para un ejercicio (si no los tiene)
 */
export async function getHintsForExercise(exercise: Exercise) {
    try {
        // Si ya tiene hints, retornarlos
        if (exercise.hints && exercise.hints.length > 0) {
            return { success: true, hints: exercise.hints };
        }

        // Generar hints con IA
        const hints = await generateHintsForExercise(exercise);

        return { success: true, hints };
    } catch (error) {
        console.error('Error generando hints:', error);
        return {
            success: false,
            hints: [],
            error: 'Failed to generate hints'
        };
    }
}

/**
 * Guarda el resultado de un ejercicio (con descuento de hints)
 */
export async function saveResultWithHints(
    userId: string,
    result: ExerciseResult,
    hintsUsed: number[] = []
) {
    try {
        // Calcular descuento por hints
        const hintsPenalty = hintsUsed.reduce((sum, level) => {
            if (level === 1) return sum + 2;
            if (level === 2) return sum + 5;
            if (level === 3) return sum + 8;
            return sum;
        }, 0);

        // Ajustar puntos ganados
        const adjustedPoints = Math.max(0, result.pointsEarned - hintsPenalty);

        const adjustedResult = {
            ...result,
            pointsEarned: adjustedPoints,
            hintsUsed,
            hintsPenalty,
        };

        // Guardar en Firestore
        await firestore
            .collection('userProgress')
            .doc(userId)
            .collection('exercises')
            .doc(result.exerciseId)
            .set({
                ...adjustedResult,
                completedAt: new Date(),
            });

        // Actualizar puntos del usuario
        if (adjustedPoints > 0) {
            const { updateUserPoints } = await import('@/app/actions/points');
            await updateUserPoints(userId, adjustedPoints);
        }

        return { success: true, adjustedPoints, hintsPenalty };
    } catch (error) {
        console.error('Error saving result with hints:', error);
        return { success: false, error: 'Failed to save result' };
    }
}
