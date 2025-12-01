#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

async function checkPools() {
    const r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
    });

    const response = await r2Client.send(new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME || '',
        Prefix: 'exercises/primero-medio/',
    }));

    console.log('\n📦 POOLS COMPLETADOS EN R2:\n');
    const pools = response.Contents?.filter(item =>
        item.Key !== 'exercises/primero-medio/' &&
        !item.Key?.endsWith('test.json')
    ) || [];

    console.log(`Total: ${pools.length}/12 materias de 1° Medio\n`);

    pools.forEach((item, i) => {
        const name = item.Key?.replace('exercises/primero-medio/', '').replace('.json', '');
        const size = ((item.Size || 0) / 1024).toFixed(1);
        const date = item.LastModified?.toLocaleString('es-CL');
        console.log(`${i + 1}. ✅ ${name}`);
        console.log(`   📊 Tamaño: ${size} KB | 📅 ${date}\n`);
    });
}

checkPools();
