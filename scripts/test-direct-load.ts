#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

async function testDirectLoad() {
    console.log('\n🔍 Test directo de lectura desde R2\n');

    const r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
    });

    try {
        const response = await r2Client.send(new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || '',
            Key: 'exercises/primero-medio/ecuaciones-lineales.json',
        }));

        const body = await response.Body?.transformToString();
        const data = JSON.parse(body || '{}');

        console.log(`✅ Pool cargado: ${data.exercises?.length || 0} ejercicios`);
        console.log(`   Versión: ${data.version}`);
        console.log(`   Última actualización: ${data.lastUpdated}\n`);

        if (data.exercises && data.exercises.length > 0) {
            console.log('📋 Primer ejercicio:');
            const ex = data.exercises[0];
            console.log(`   ${ex.title}`);
            console.log(`   Tipo: ${ex.type}`);
            console.log(`   Hints: ${ex.hints?.length || 0} niveles\n`);
        }

        console.log('✅ Sistema completo funcionando!\n');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testDirectLoad();
