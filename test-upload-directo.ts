/**
 * Script de prueba para subir un archivo de texto directamente a R2
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env.local') });

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'geometra';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

async function testDirectUpload() {
    console.log('🧪 Prueba de upload directo a R2\n');
    console.log('📋 Configuración:');
    console.log(`   - Bucket: ${BUCKET_NAME}`);
    console.log(`   - Public URL: ${PUBLIC_URL}\n`);

    try {
        // 1. Subir archivo de prueba
        console.log('📤 Subiendo archivo de prueba...');
        const testContent = 'Hola! Este es un archivo de prueba subido directamente a R2.';
        const key = 'test-directo/hola.txt';

        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: Buffer.from(testContent),
            ContentType: 'text/plain',
        });

        await r2Client.send(uploadCommand);
        console.log('✅ Archivo subido exitosamente!');
        console.log(`   Key: ${key}`);
        console.log(`   URL pública: ${PUBLIC_URL}/${key}\n`);

        // 2. Listar archivos en el bucket
        console.log('📋 Listando archivos en el bucket...');
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
        });

        const listResult = await r2Client.send(listCommand);

        if (listResult.Contents && listResult.Contents.length > 0) {
            console.log(`✅ Se encontraron ${listResult.Contents.length} archivo(s):\n`);
            listResult.Contents.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.Key}`);
                console.log(`      Tamaño: ${item.Size} bytes`);
                console.log(`      Última modificación: ${item.LastModified}\n`);
            });
        } else {
            console.log('⚠️  No se encontraron archivos en el bucket');
        }

        console.log('\n🎯 Prueba la URL pública en tu navegador:');
        console.log(`   ${PUBLIC_URL}/${key}\n`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testDirectUpload();
