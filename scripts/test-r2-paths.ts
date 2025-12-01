#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function testUpload() {
    const r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
    });

    const testData = {
        test: true,
        exercises: [],
        timestamp: new Date().toISOString(),
    };

    try {
        console.log('🧪 Test 1: Subir a test/...');
        await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || '',
            Key: 'test/pool-test.json',
            Body: JSON.stringify(testData),
            ContentType: 'application/json',
        }));
        console.log('✅ test/ funciona\n');
    } catch (e: any) {
        console.log('❌ test/ falló:', e.message, '\n');
    }

    try {
        console.log('🧪 Test 2: Subir a exercises/...');
        await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || '',
            Key: 'exercises/primero-medio/test.json',
            Body: JSON.stringify(testData),
            ContentType: 'application/json',
        }));
        console.log('✅ exercises/ funciona\n');
    } catch (e: any) {
        console.log('❌ exercises/ falló:', e.message, '\n');
    }
}

testUpload();
