/**
 * Script 1: Verificar Sincronización con R2
 * 
 * Este script verifica que los archivos locales en src/exercise-validation/
 * coincidan exactamente con los ejercicios almacenados en R2.
 * 
 * Ejecutar: npx tsx scripts/verify-r2-sync.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const VALIDATION_DIR = path.join(process.cwd(), 'src', 'exercise-validation');

const COURSES = [
    { folder: 'primero-medio', name: '1-medio' },
    { folder: 'segundo-medio', name: '2-medio' },
    { folder: 'tercero-medio', name: '3-medio' },
    { folder: 'cuarto-medio', name: '4-medio' },
];

interface VerificationResult {
    course: string;
    subject: string;
    status: 'ok' | 'missing-local' | 'missing-r2' | 'count-mismatch';
    r2Count: number;
    localCount: number;
    message: string;
}

async function listR2Pools() {
    const pools: { course: string; subject: string; key: string; count: number }[] = [];

    for (const course of COURSES) {
        try {
            const command = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: `exercises/${course.folder}/`,
            });

            const response = await s3Client.send(command);

            if (response.Contents) {
                for (const item of response.Contents) {
                    if (item.Key && item.Key.endsWith('.json')) {
                        const parts = item.Key.split('/');
                        const subject = parts[2].replace('.json', '');

                        // Descargar para contar ejercicios
                        const getCommand = new GetObjectCommand({
                            Bucket: BUCKET_NAME,
                            Key: item.Key,
                        });
                        const data = await s3Client.send(getCommand);
                        const body = await data.Body?.transformToString();
                        const json = JSON.parse(body || '{}');
                        const count = json.exercises?.length || 0;

                        pools.push({
                            course: course.name,
                            subject,
                            key: item.Key,
                            count,
                        });
                    }
                }
            }
        } catch (error) {
            // Curso no existe en R2
        }
    }

    return pools;
}

function countLocalExercises(course: string, subject: string): number {
    const filePath = path.join(VALIDATION_DIR, course, `${subject}.ts`);

    if (!fs.existsSync(filePath)) {
        return -1; // Archivo no existe
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Contar cuántos objetos de ejercicio hay en el array
    const matches = content.match(/{\s*id:\s*\d+,/g);
    return matches ? matches.length : 0;
}

async function verify() {
    console.log('🔍 Verificando sincronización entre archivos locales y R2...\n');

    const r2Pools = await listR2Pools();
    const results: VerificationResult[] = [];

    // Verificar cada pool de R2
    for (const pool of r2Pools) {
        const localCount = countLocalExercises(pool.course, pool.subject);

        if (localCount === -1) {
            results.push({
                course: pool.course,
                subject: pool.subject,
                status: 'missing-local',
                r2Count: pool.count,
                localCount: 0,
                message: 'Archivo local no existe',
            });
        } else if (localCount !== pool.count) {
            results.push({
                course: pool.course,
                subject: pool.subject,
                status: 'count-mismatch',
                r2Count: pool.count,
                localCount,
                message: `Diferencia: R2 tiene ${pool.count}, local tiene ${localCount}`,
            });
        } else {
            results.push({
                course: pool.course,
                subject: pool.subject,
                status: 'ok',
                r2Count: pool.count,
                localCount,
                message: 'Sincronizado correctamente',
            });
        }
    }

    // Verificar archivos locales que no estén en R2
    for (const course of COURSES) {
        const courseDir = path.join(VALIDATION_DIR, course.name);
        if (fs.existsSync(courseDir)) {
            const files = fs.readdirSync(courseDir).filter(f => f.endsWith('.ts'));
            for (const file of files) {
                const subject = file.replace('.ts', '');
                const existsInR2 = r2Pools.some(p => p.course === course.name && p.subject === subject);

                if (!existsInR2) {
                    const localCount = countLocalExercises(course.name, subject);
                    results.push({
                        course: course.name,
                        subject,
                        status: 'missing-r2',
                        r2Count: 0,
                        localCount,
                        message: 'Archivo local sin correspondencia en R2',
                    });
                }
            }
        }
    }

    // Mostrar resultados
    console.log('=' .repeat(80));
    console.log('📊 RESULTADOS DE VERIFICACIÓN\n');

    const ok = results.filter(r => r.status === 'ok');
    const errors = results.filter(r => r.status !== 'ok');

    console.log(`✅ Sincronizados: ${ok.length}`);
    console.log(`❌ Con problemas: ${errors.length}\n`);

    if (errors.length > 0) {
        console.log('⚠️  ARCHIVOS CON PROBLEMAS:\n');
        errors.forEach(result => {
            const icon = result.status === 'missing-local' ? '📁' :
                result.status === 'missing-r2' ? '☁️' : '🔢';
            console.log(`${icon} ${result.course}/${result.subject}`);
            console.log(`   ${result.message}`);
            console.log(`   R2: ${result.r2Count} ejercicios | Local: ${result.localCount} ejercicios\n`);
        });
    }

    console.log('=' .repeat(80));

    if (errors.length === 0) {
        console.log('\n✅ TODOS LOS ARCHIVOS ESTÁN SINCRONIZADOS\n');
        return true;
    } else {
        console.log(`\n❌ ${errors.length} ARCHIVO(S) NECESITAN ATENCIÓN\n`);
        return false;
    }
}

verify()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
