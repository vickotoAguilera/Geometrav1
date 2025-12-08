#!/usr/bin/env tsx

/**
 * Verifica la integridad de todos los pools y completa los faltantes
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { generateExercises } from '../src/ai/flows/exercise-generator';
import { generateHintsForExercise } from '../src/ai/flows/hints-generator';
import { curriculum } from '../src/data/curriculum';

const EXERCISES_PER_POOL = 100;
const DELAY_BETWEEN_EXERCISES = 2000;

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

async function getPoolFromR2(gradeId: string, subjectId: string): Promise<any | null> {
    try {
        const response = await r2Client.send(new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || '',
            Key: `exercises/${gradeId}/${subjectId}.json`,
        }));

        const bodyString = await response.Body?.transformToString();
        if (!bodyString) return null;

        return JSON.parse(bodyString);
    } catch (error) {
        return null;
    }
}

async function uploadPoolToR2(gradeId: string, subjectId: string, pool: any): Promise<void> {
    await r2Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || '',
        Key: `exercises/${gradeId}/${subjectId}.json`,
        Body: JSON.stringify(pool, null, 2),
        ContentType: 'application/json',
    }));
}

async function completePool(gradeId: string, subjectId: string, subjectName: string, existingPool: any) {
    const currentExercises = existingPool?.exercises || [];
    const missing = EXERCISES_PER_POOL - currentExercises.length;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔧 COMPLETANDO: ${subjectName}`);
    console.log(`   📊 Actuales: ${currentExercises.length}/${EXERCISES_PER_POOL}`);
    console.log(`   ➕ Faltantes: ${missing}`);
    console.log(`${'='.repeat(70)}\n`);

    if (missing <= 0) {
        console.log('✅ Pool ya está completo\n');
        return existingPool;
    }

    // Generar ejercicios faltantes
    console.log(`📝 Generando ${missing} ejercicios faltantes...\n`);

    const newExercises = await generateExercises({
        gradeId,
        subjectId,
        type: 'fill-in-blanks',
        count: missing,
        difficulty: 'medio',
    });

    console.log(`✅ Generados ${newExercises.length} ejercicios nuevos`);

    // Generar hints para los nuevos ejercicios
    console.log(`\n💡 Generando hints para ${newExercises.length} ejercicios...\n`);
    const exercisesWithHints = [];

    for (let i = 0; i < newExercises.length; i++) {
        const ex = newExercises[i];

        if ((i + 1) % 5 === 0 || i === newExercises.length - 1) {
            console.log(`  Progreso: ${i + 1}/${newExercises.length}`);
        }

        try {
            const hints = await generateHintsForExercise(ex);
            exercisesWithHints.push({ ...ex, hints });
        } catch (error) {
            exercisesWithHints.push(ex);
        }

        if (i < newExercises.length - 1) {
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_EXERCISES));
        }
    }

    // Combinar ejercicios existentes con nuevos
    const allExercises = [...currentExercises, ...exercisesWithHints];

    const updatedPool = {
        subject: subjectId,
        grade: gradeId,
        exercises: allExercises,
        version: (existingPool?.version || 0) + 1,
        lastUpdated: new Date().toISOString(),
        completedAt: new Date().toISOString(),
    };

    // Subir pool actualizado
    console.log(`\n☁️ Subiendo pool actualizado a R2...`);
    await uploadPoolToR2(gradeId, subjectId, updatedPool);

    console.log(`✅ Pool completado y actualizado!`);
    console.log(`   📦 Total: ${allExercises.length} ejercicios`);
    console.log(`   💡 ${allExercises.filter((e: any) => e.hints).length} con hints\n`);

    return updatedPool;
}

async function verifyAndCompleteAllPools() {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 VERIFICACIÓN Y COMPLETADO DE POOLS - 1° MEDIO');
    console.log('='.repeat(70) + '\n');

    const primeroMedio = curriculum.find(g => g.id === 'primero-medio');
    if (!primeroMedio) {
        console.error('❌ No se encontró 1° Medio');
        return;
    }

    // Verificar pools existentes
    console.log('📋 Verificando pools existentes...\n');

    const poolsStatus = [];

    for (const subject of primeroMedio.subjects) {
        const pool = await getPoolFromR2(primeroMedio.id, subject.id);
        const exerciseCount = pool?.exercises?.length || 0;
        const status = exerciseCount === 0 ? 'FALTANTE' :
            exerciseCount < EXERCISES_PER_POOL ? 'INCOMPLETO' : 'COMPLETO';

        poolsStatus.push({
            subject,
            pool,
            exerciseCount,
            status,
        });

        const icon = status === 'COMPLETO' ? '✅' : status === 'INCOMPLETO' ? '⚠️' : '❌';
        console.log(`${icon} ${subject.name}: ${exerciseCount}/${EXERCISES_PER_POOL} ejercicios (${status})`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN');
    console.log('='.repeat(70));

    const completos = poolsStatus.filter(p => p.status === 'COMPLETO').length;
    const incompletos = poolsStatus.filter(p => p.status === 'INCOMPLETO').length;
    const faltantes = poolsStatus.filter(p => p.status === 'FALTANTE').length;

    console.log(`✅ Completos: ${completos}/12`);
    console.log(`⚠️ Incompletos: ${incompletos}/12`);
    console.log(`❌ Faltantes: ${faltantes}/12`);
    console.log('='.repeat(70) + '\n');

    // Completar pools incompletos
    const needsWork = poolsStatus.filter(p => p.status !== 'COMPLETO');

    if (needsWork.length === 0) {
        console.log('🎉 ¡Todos los pools están completos!\n');
        return;
    }

    console.log(`🔧 Completando ${needsWork.length} pools...\n`);

    for (const { subject, pool, status } of needsWork) {
        try {
            if (status === 'FALTANTE') {
                console.log(`\n⚠️ ${subject.name} está completamente faltante`);
                console.log(`   Usa el script continue-generation.ts para generar pools nuevos\n`);
                continue;
            }

            await completePool(primeroMedio.id, subject.id, subject.name, pool);

            // Pausa entre pools
            await new Promise(r => setTimeout(r, 5000));
        } catch (error: any) {
            console.error(`❌ Error completando ${subject.name}:`, error.message);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ VERIFICACIÓN Y COMPLETADO FINALIZADO');
    console.log('='.repeat(70) + '\n');
}

// Manejo de Ctrl+C
process.on('SIGINT', () => {
    console.log('\n⏸️  Proceso interrumpido.\n');
    process.exit(0);
});

verifyAndCompleteAllPools()
    .then(() => {
        console.log('✅ Proceso completado\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
