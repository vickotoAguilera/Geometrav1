/**
 * Script para listar archivos en la carpeta users/
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

async function listUserFiles() {
    console.log('📋 Listando archivos en users/...\n');

    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'users/',
        });

        const result = await r2Client.send(listCommand);

        if (result.Contents && result.Contents.length > 0) {
            console.log(`✅ Se encontraron ${result.Contents.length} archivo(s) en users/:\n`);
            result.Contents.forEach((item, index) => {
                console.log(`${index + 1}. ${item.Key}`);
                console.log(`   Tamaño: ${item.Size} bytes`);
                console.log(`   Última modificación: ${item.LastModified}\n`);
            });
        } else {
            console.log('✅ No se encontraron archivos en users/ - ¡El archivo fue eliminado correctamente!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

listUserFiles();
