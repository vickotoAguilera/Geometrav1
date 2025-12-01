#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateExercises } from '../src/ai/flows/exercise-generator';
import { generateHintsForExercise } from '../src/ai/flows/hints-generator';

const TEST_GRADE = 'primero-medio';
const TEST_SUBJECT = 'ecuaciones-lineales';
const TEST_COUNT = 10;

async function generateAndUpload() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 GENERACIÓN Y UPLOAD DE POOL DE PRUEBA');
    console.log('='.repeat(60) + '\n');

    // 1. Generar ejercicios
    console.log(`📝 Generando ${TEST_COUNT} ejercicios...\n`);
    const exercises = await generateExercises({
        gradeId: TEST_GRADE,
        subjectId: TEST_SUBJECT,
        type: 'fill-in-blanks',
        count: TEST_COUNT,
        difficulty: 'facil',
    });

    console.log(`✅ Ejercicios generados: ${exercises.length}\n`);

    // 2. Generar hints
    console.log(`💡 Generando hints...\n`);
    const exercisesWithHints = [];
    for (let i = 0; i < exercises.length; i++) {
        console.log(`  [${i + 1}/${exercises.length}] ${exercises[i].title}`);
        try {
            const hints = await generateHintsForExercise(exercises[i]);
            exercisesWithHints.push({ ...exercises[i], hints });
            console.log(`  ✅ Hints generados`);
        } catch (error) {
            console.log(`  ⚠️ Sin hints`);
            exercisesWithHints.push(exercises[i]);
        }
        if (i < exercises.length - 1) {
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    // 3. Crear pool
    const pool = {
        subject: TEST_SUBJECT,
        grade: TEST_GRADE,
        exercises: exercisesWithHints,
        version: 1,
        lastUpdated: new Date().toISOString(),
    };

    // 4. Subir a R2 (usando configuración que sabemos que funciona)
    console.log(`\n☁️ Subiendo a R2...\n`);

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
            Key: `exercises/${TEST_GRADE}/${TEST_SUBJECT}.json`,
            Body: JSON.stringify(pool, null, 2),
            ContentType: 'application/json',
        }));

        console.log('✅ Pool subido exitosamente!\n');
        console.log('='.repeat(60));
        console.log(`📦 ${exercisesWithHints.length} ejercicios con hints`);
        console.log(`☁️ exercises/${TEST_GRADE}/${TEST_SUBJECT}.json`);
        console.log('='.repeat(60) + '\n');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error('Detalles:', error);
        process.exit(1);
    }
}

generateAndUpload();
