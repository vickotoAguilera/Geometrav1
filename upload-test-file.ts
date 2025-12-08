/**
 * Script para subir un archivo de prueba a la cuenta del usuario
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

// Tu user ID
const USER_ID = 'yFHm8sKCCjNtlbuGgdO5QPbRf9E3';

async function uploadTestFile() {
    console.log('📤 Subiendo archivo de prueba...\n');

    try {
        // Crear contenido del archivo
        const fileContent = `Archivo de prueba para Geometra
        
Este es un archivo de prueba subido a R2.

Información:
- Usuario: ${USER_ID}
- Fecha: ${new Date().toLocaleString('es-CL')}
- Propósito: Probar el sistema de gestión de almacenamiento

Este archivo se eliminará automáticamente después de 7 días.

¡Saludos! 🚀
`;

        // Generar nombre único
        const timestamp = Date.now();
        const fileName = `prueba-${timestamp}.txt`;
        const key = `users/${USER_ID}/${fileName}`;

        console.log(`📝 Archivo: ${fileName}`);
        console.log(`🔑 Key: ${key}`);
        console.log(`📊 Tamaño: ${fileContent.length} bytes\n`);

        // Subir a R2
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: Buffer.from(fileContent),
            ContentType: 'text/plain',
        });

        await r2Client.send(command);

        const publicUrl = `${PUBLIC_URL}/${key}`;

        console.log('✅ Archivo subido exitosamente!\n');
        console.log(`🌐 URL pública: ${publicUrl}\n`);
        console.log('📋 Ahora ve a http://localhost:9002/perfil');
        console.log('   y verás el archivo en la sección "Almacenamiento R2"\n');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

uploadTestFile();
