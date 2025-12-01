#!/usr/bin/env tsx

/**
 * Continúa generación de pools desde donde se detuvo
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { generateExercises } from '../src/ai/flows/exercise-generator';
import { generateHintsForExercise } from '../src/ai/flows/hints-generator';
import { curriculum } from '../src/data/curriculum';
import { ProgressTracker } from './lib/progress-tracker';

const EXERCISES_PER_POOL = 100;
const BATCH_SIZE = 10;
const DELAY_BETWEEN_EXERCISES = 2000;
const DELAY_BETWEEN_SUBJECTS = 5000;

async function getCompletedPools(): Promise<Set<string>> {
    const r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
    });

    try {
        const response = await r2Client.send(new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME || '',
            Prefix: 'exercises/primero-medio/',
        }));

        const completed = new Set<string>();
        response.Contents?.forEach(item => {
            const name = item.Key?.replace('exercises/primero-medio/', '').replace('.json', '');
            if (name && name !== 'test') {
                completed.add(name);
            }
        });

        return completed;
    } catch (error) {
        console.error('Error verificando pools:', error);
        return new Set();
    }
}

async function generatePoolForSubject(gradeId: string, subjectId: string, subjectName: string) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📚 ${subjectName}`);
    console.log(`${'='.repeat(70)}\n`);

    // Crear tracker con nombre descriptivo
    const tracker = new ProgressTracker(
        `generate-${gradeId}-${subjectId}`,
        `🎯 Generando pool de ejercicios: ${subjectName} (1° Medio)`,
        EXERCISES_PER_POOL,
        { gradeId, subjectId, subjectName, grade: '1° Medio' }
    );

    const allExercises: any[] = [];
    const batches = Math.ceil(EXERCISES_PER_POOL / BATCH_SIZE);

    // Generar ejercicios en lotes
    for (let i = 0; i < batches; i++) {
        const remaining = EXERCISES_PER_POOL - allExercises.length;
        const currentBatchSize = Math.min(BATCH_SIZE, remaining);

        console.log(`📝 Lote ${i + 1}/${batches}: generando ${currentBatchSize} ejercicios...`);
        tracker.update(allExercises.length, `Generando lote ${i + 1}/${batches} de ejercicios`);

        try {
            const exercises = await generateExercises({
                gradeId,
                subjectId,
                type: 'fill-in-blanks',
                count: currentBatchSize,
                difficulty: i < batches / 3 ? 'facil' : i < (2 * batches) / 3 ? 'medio' : 'dificil',
            });

            allExercises.push(...exercises);
            tracker.update(allExercises.length, `Lote ${i + 1}/${batches} completado`);
            console.log(`✅ Total: ${allExercises.length}/${EXERCISES_PER_POOL}`);
        } catch (error: any) {
            console.error(`❌ Error lote ${i + 1}:`, error.message);
            tracker.incrementErrors();
        }

        if (i < batches - 1) {
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    if (allExercises.length === 0) {
        console.error(`❌ No se generaron ejercicios para ${subjectName}`);
        tracker.error(`No se generaron ejercicios para ${subjectName}`);
        return false;
    }

    // Generar hints
    console.log(`\n💡 Generando hints para ${allExercises.length} ejercicios...\n`);
    const exercisesWithHints = [];

    for (let i = 0; i < allExercises.length; i++) {
        const ex = allExercises[i];

        // Obtener preview del ejercicio (puede ser question, title o description)
        const questionText = ex.question || ex.title || ex.description || 'ejercicio';
        const questionPreview = questionText.substring(0, 50);
        tracker.update(i, `Generando hints: ${questionPreview}...`);

        if ((i + 1) % 10 === 0 || i === allExercises.length - 1) {
            console.log(`  Progreso: ${i + 1}/${allExercises.length}`);
        }

        try {
            const hints = await generateHintsForExercise(ex);
            exercisesWithHints.push({ ...ex, hints });
        } catch (error) {
            exercisesWithHints.push(ex);
            tracker.incrementErrors();
        }

        if (i < allExercises.length - 1) {
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_EXERCISES));
        }
    }

    // Subir a R2
    console.log(`\n☁️ Subiendo a R2...`);
    tracker.update(EXERCISES_PER_POOL, 'Subiendo pool a R2...');

    const pool = {
        subject: subjectId,
        grade: gradeId,
        exercises: exercisesWithHints,
        version: 1,
        lastUpdated: new Date().toISOString(),
    };

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

        console.log(`✅ Pool subido!`);
        console.log(`   📦 ${exercisesWithHints.length} ejercicios`);
        console.log(`   💡 ${exercisesWithHints.filter((e: any) => e.hints).length} con hints\n`);

        tracker.complete();
        return true;
    } catch (error: any) {
        console.error(`❌ Error R2:`, error.message);
        tracker.error(`Error al subir a R2: ${error.message}`);
        return false;
    }
}

async function continueGeneration() {
    console.log('\n' + '='.repeat(70));
    console.log('🔄 CONTINUANDO GENERACIÓN DE POOLS - 1° MEDIO');
    console.log('='.repeat(70) + '\n');

    const primeroMedio = curriculum.find(g => g.id === 'primero-medio');
    if (!primeroMedio) {
        console.error('❌ No se encontró 1° Medio');
        return;
    }

    // Verificar pools completados
    console.log('🔍 Verificando pools existentes...\n');
    const completed = await getCompletedPools();

    console.log(`✅ Pools completados: ${completed.size}`);
    completed.forEach(pool => console.log(`   - ${pool}`));
    console.log();

    const pending = primeroMedio.subjects.filter(s => !completed.has(s.id));
    console.log(`📋 Pendientes: ${pending.length}`);
    pending.forEach(s => console.log(`   - ${s.name}`));
    console.log();

    if (pending.length === 0) {
        console.log('✅ Todos los pools están completos!\n');
        return;
    }

    let completedNow = 0;
    let failed = 0;

    for (const subject of pending) {
        const success = await generatePoolForSubject(
            primeroMedio.id,
            subject.id,
            subject.name
        );

        if (success) {
            completedNow++;
        } else {
            failed++;
        }

        if (subject !== pending[pending.length - 1]) {
            console.log(`⏳ Esperando ${DELAY_BETWEEN_SUBJECTS / 1000}s...\n`);
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_SUBJECTS));
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN');
    console.log('='.repeat(70));
    console.log(`✅ Nuevos pools: ${completedNow}`);
    console.log(`❌ Fallidos: ${failed}`);
    console.log(`📦 Total pools: ${completed.size + completedNow}/12`);
    console.log('='.repeat(70) + '\n');
}

// Manejo de Ctrl+C para pausar correctamente
process.on('SIGINT', () => {
    console.log('\n⏸️  Proceso interrumpido. El progreso ha sido guardado.');
    console.log('💡 Puedes reanudar ejecutando este script nuevamente.\n');
    process.exit(0);
});

continueGeneration()
    .then(() => {
        console.log('✅ Proceso completado\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
