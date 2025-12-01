// Funciones para manejar pools de ejercicios en R2

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import type { DragDropExercise, FillInBlanksExercise } from '@/types/exercises';

type Exercise = DragDropExercise | FillInBlanksExercise;

interface ExercisePool {
    subject: string;
    grade: string;
    exercises: Exercise[];
    version: number;
    lastUpdated: string;
}

// Función para obtener cliente R2 (lazy initialization)
function getR2Client() {
    return new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
    });
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';

/**
 * Obtiene un pool de ejercicios desde R2
 */
export async function getExercisePool(gradeId: string, subjectId: string): Promise<Exercise[]> {
    try {
        const key = `exercises/${gradeId}/${subjectId}.json`;

        const r2Client = getR2Client();
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        const response = await r2Client.send(command);
        const body = await response.Body?.transformToString();

        if (!body) {
            console.warn(`No pool found for ${gradeId}/${subjectId}`);
            return [];
        }

        const pool: ExercisePool = JSON.parse(body);
        return pool.exercises || [];
    } catch (error) {
        console.error(`Error getting exercise pool from R2:`, error);
        return [];
    }
}

/**
 * Sube un pool de ejercicios a R2
 */
export async function uploadExercisePool(
    gradeId: string,
    subjectId: string,
    exercises: Exercise[]
): Promise<boolean> {
    try {
        const pool: ExercisePool = {
            subject: subjectId,
            grade: gradeId,
            exercises,
            version: 1,
            lastUpdated: new Date().toISOString(),
        };

        const key = `exercises/${gradeId}/${subjectId}.json`;

        const r2Client = getR2Client();
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: JSON.stringify(pool, null, 2),
            ContentType: 'application/json',
        });

        await r2Client.send(command);
        console.log(`✅ Uploaded pool: ${gradeId}/${subjectId} (${exercises.length} exercises)`);
        return true;
    } catch (error) {
        console.error(`Error uploading exercise pool to R2:`, error);
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

/**
 * Verifica si existe un pool en R2
 */
export async function poolExists(gradeId: string, subjectId: string): Promise<boolean> {
    try {
        const pool = await getExercisePool(gradeId, subjectId);
        return pool.length > 0;
    } catch {
        return false;
    }
}

/**
 * Carga ejercicios aleatorios con items de drag-drop desordenados
 */
export async function loadRandomExercises(
    gradeId: string,
    subjectId: string,
    count: number = 20
): Promise<Exercise[]> {
    try {
        // 1. Cargar pool completo desde R2
        const pool = await getExercisePool(gradeId, subjectId);

        if (pool.length === 0) {
            console.warn(`No exercises found for ${gradeId}/${subjectId}`);
            return [];
        }

        // 2. Seleccionar ejercicios aleatorios
        const selectedExercises = selectRandomExercises(pool, count);

        // 3. Desordenar items de drag-drop
        const exercisesWithShuffledItems = selectedExercises.map(exercise => {
            if (exercise.type === 'drag-drop') {
                return {
                    ...exercise,
                    items: shuffleArray([...exercise.items])
                };
            }
            return exercise;
        });

        return exercisesWithShuffledItems;
    } catch (error) {
        console.error(`Error loading random exercises:`, error);
        return [];
    }
}

/**
 * Exportar shuffleArray para uso externo
 */
export { shuffleArray };

