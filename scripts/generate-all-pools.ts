#!/usr/bin/env tsx

/**
 * Genera pools de 100 ejercicios para todas las materias de 1° Medio
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateExercises } from '../src/ai/flows/exercise-generator';
import { generateHintsForExercise } from '../src/ai/flows/hints-generator';
import { curriculum } from '../src/data/curriculum';

const EXERCISES_PER_POOL = 100;
const BATCH_SIZE = 10; // Generar de 10 en 10
const DELAY_BETWEEN_EXERCISES = 2000; // 2 segundos entre ejercicios
const DELAY_BETWEEN_SUBJECTS = 5000; // 5 segundos entre materias

async function generatePoolForSubject(gradeId: string, subjectId: string, subjectName: string) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📚 ${subjectName}`);
    console.log(`${'='.repeat(70)}\n`);

    const allExercises: any[] = [];
    const batches = Math.ceil(EXERCISES_PER_POOL / BATCH_SIZE);

    // Generar ejercicios en lotes
    for (let i = 0; i < batches; i++) {
        const remaining = EXERCISES_PER_POOL - allExercises.length;
        const currentBatchSize = Math.min(BATCH_SIZE, remaining);

        console.log(`📝 Lote ${i + 1}/${batches}: generando ${currentBatchSize} ejercicios...`);

        try {
            const exercises = await generateExercises({
                gradeId,
                subjectId,
                type: 'fill-in-blanks',
                count: currentBatchSize,
                difficulty: i < batches / 3 ? 'facil' : i < (2 * batches) / 3 ? 'medio' : 'dificil',
            });

            allExercises.push(...exercises);
            console.log(`✅ Total generados: ${allExercises.length}/${EXERCISES_PER_POOL}`);
        } catch (error: any) {
            console.error(`❌ Error en lote ${i + 1}:`, error.message);
        }

        // Pausa entre lotes
        if (i < batches - 1) {
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    // Generar hints
    console.log(`\n💡 Generando hints para ${allExercises.length} ejercicios...\n`);
    const exercisesWithHints = [];

    for (let i = 0; i < allExercises.length; i++) {
        const ex = allExercises[i];

        if ((i + 1) % 10 === 0 || i === allExercises.length - 1) {
            console.log(`  Progreso: ${i + 1}/${allExercises.length}`);
        }

        try {
            const hints = await generateHintsForExercise(ex);
            exercisesWithHints.push({ ...ex, hints });
        } catch (error) {
            console.log(`  ⚠️ Sin hints para ejercicio ${i + 1}`);
            exercisesWithHints.push(ex);
        }

        // Pausa entre hints
        if (i < allExercises.length - 1) {
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_EXERCISES));
        }
    }

    // Crear pool
    const pool = {
        subject: subjectId,
        grade: gradeId,
        exercises: exercisesWithHints,
        version: 1,
        lastUpdated: new Date().toISOString(),
    };

    // Subir a R2
    console.log(`\n☁️ Subiendo a R2...`);

    const r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
    });

    try {
        await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || '',
            Key: `exercises/${gradeId}/${subjectId}.json`,
            Body: JSON.stringify(pool, null, 2),
            ContentType: 'application/json',
        }));

        console.log(`✅ Pool subido exitosamente!`);
        console.log(`   📦 ${exercisesWithHints.length} ejercicios con hints`);
        console.log(`   ☁️ exercises/${gradeId}/${subjectId}.json\n`);

        return true;
    } catch (error: any) {
        console.error(`❌ Error subiendo a R2:`, error.message);
        return false;
    }
}

async function generateAllPools() {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 GENERACIÓN DE POOLS COMPLETOS - 1° MEDIO');
    console.log('='.repeat(70));
    console.log(`📊 ${EXERCISES_PER_POOL} ejercicios por materia`);
    console.log(`💡 3 niveles de hints por ejercicio`);
    console.log('='.repeat(70) + '\n');

    const primeroMedio = curriculum.find(g => g.id === 'primero-medio');
    if (!primeroMedio) {
        console.error('❌ No se encontró 1° Medio');
        return;
    }

    console.log(`📚 Total de materias: ${primeroMedio.subjects.length}\n`);

    let completed = 0;
    let failed = 0;

    for (const subject of primeroMedio.subjects) {
        const success = await generatePoolForSubject(
            primeroMedio.id,
            subject.id,
            subject.name
        );

        if (success) {
            completed++;
        } else {
            failed++;
        }

        // Pausa entre materias
        if (subject !== primeroMedio.subjects[primeroMedio.subjects.length - 1]) {
            console.log(`⏳ Esperando ${DELAY_BETWEEN_SUBJECTS / 1000}s antes de la siguiente materia...\n`);
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_SUBJECTS));
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(70));
    console.log(`✅ Materias completadas: ${completed}`);
    console.log(`❌ Materias fallidas: ${failed}`);
    console.log(`📦 Total ejercicios generados: ${completed * EXERCISES_PER_POOL}`);
    console.log(`💡 Total hints generados: ${completed * EXERCISES_PER_POOL * 3}`);
    console.log('='.repeat(70) + '\n');
}

generateAllPools()
    .then(() => {
        console.log('✅ Proceso completado\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
