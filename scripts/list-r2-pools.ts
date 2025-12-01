#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

async function listR2Pools() {
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

        console.log('\n📦 Pools en R2 (1° Medio):\n');

        if (response.Contents && response.Contents.length > 0) {
            response.Contents.forEach((item, index) => {
                const name = item.Key?.replace('exercises/primero-medio/', '').replace('.json', '');
                const size = ((item.Size || 0) / 1024).toFixed(2);
                console.log(`${index + 1}. ✅ ${name} (${size} KB)`);
            });
            console.log(`\nTotal: ${response.Contents.length} pools\n`);
        } else {
            console.log('❌ No se encontraron pools\n');
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

listR2Pools();
