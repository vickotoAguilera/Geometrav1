#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

async function verifyAllPools() {
    const r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
    });

    const grades = [
        { id: 'primero-medio', name: '1° Medio', expected: 12 },
        { id: 'segundo-medio', name: '2° Medio', expected: 9 },
        { id: 'tercero-medio', name: '3° Medio', expected: 8 },
        { id: 'cuarto-medio', name: '4° Medio', expected: 8 },
    ];

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║   📊 VERIFICACIÓN DE POOLS EN R2                              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    let totalExpected = 0;
    let totalFound = 0;

    for (const grade of grades) {
        try {
            const response = await r2Client.send(new ListObjectsV2Command({
                Bucket: process.env.R2_BUCKET_NAME || '',
                Prefix: `exercises/${grade.id}/`,
            }));

            const pools = response.Contents?.filter(item =>
                item.Key && !item.Key.endsWith('/') && item.Key.includes('.json')
            ) || [];

            const poolNames = pools.map(p =>
                p.Key?.replace(`exercises/${grade.id}/`, '').replace('.json', '')
            ).filter(Boolean);

            totalExpected += grade.expected;
            totalFound += pools.length;

            const status = pools.length === grade.expected ? '✅' : '⚠️';
            console.log(`${status} ${grade.name}: ${pools.length}/${grade.expected} pools`);

            if (poolNames.length > 0) {
                poolNames.forEach(name => {
                    console.log(`   - ${name}`);
                });
            }
            console.log();

        } catch (error) {
            console.error(`❌ Error verificando ${grade.name}:`, error);
        }
    }

    console.log('═'.repeat(70));
    console.log(`📦 TOTAL: ${totalFound}/${totalExpected} pools`);

    if (totalFound === totalExpected) {
        console.log('✅ ¡Todos los pools están completos y subidos a R2!');
    } else {
        console.log(`⚠️  Faltan ${totalExpected - totalFound} pools`);
    }
    console.log('═'.repeat(70) + '\n');
}

verifyAllPools()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
