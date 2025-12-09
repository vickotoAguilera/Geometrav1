// Funciones para cargar ejercicios desde archivos de validación locales

import type { DragDropExercise, FillInBlanksExercise } from '@/types/exercises';

type Exercise = DragDropExercise | FillInBlanksExercise;

/**
 * Carga ejercicios desde los archivos de validación locales
 */
export async function getExercisesFromValidation(
    gradeId: string,
    subjectId: string
): Promise<Exercise[]> {
    try {
        // Mapear IDs de cursos a nombres de carpetas
        const gradeMap: Record<string, string> = {
            'primero-medio': '1-medio',
            'segundo-medio': '2-medio',
            'tercero-medio': '3-medio',
            'cuarto-medio': '4-medio',
        };

        const gradeFolderName = gradeMap[gradeId] || gradeId;

        // Intentar importar el archivo de validación
        const validationModule = await import(
            `@/exercise-validation/${gradeFolderName}/${subjectId}`
        );

        if (validationModule && validationModule.exercises) {
            console.log(`✅ Cargados ${validationModule.exercises.length} ejercicios desde validación local`);
            return validationModule.exercises;
        }

        console.warn(`⚠️ No se encontraron ejercicios en validación local para ${gradeId}/${subjectId}`);
        return [];
    } catch (error) {
        console.error(`❌ Error cargando ejercicios desde validación local:`, error);
        return [];
    }
}

/**
 * Verifica si existe un archivo de validación para el curso/materia
 */
export async function validationExists(gradeId: string, subjectId: string): Promise<boolean> {
    try {
        const exercises = await getExercisesFromValidation(gradeId, subjectId);
        return exercises.length > 0;
    } catch {
        return false;
    }
}

/**
 * Selecciona N ejercicios al azar de un pool
 */
export function selectRandomExercises(pool: Exercise[], count: number): Exercise[] {
    if (pool.length <= count) {
        return shuffleArray([...pool]);
    }

    const shuffled = shuffleArray([...pool]);
    return shuffled.slice(0, count);
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
