/**
 * Script de prueba para verificar la conexión con Cloudflare R2
 * 
 * Ejecutar con: npx tsx test-r2-connection.ts
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
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

async function testR2Connection() {
    console.log('🔍 Probando conexión con Cloudflare R2...\n');
    console.log('📋 Configuración:');
    console.log(`   - Account ID: ${process.env.R2_ACCOUNT_ID}`);
    console.log(`   - Bucket: ${BUCKET_NAME}`);
    console.log(`   - Endpoint: https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com\n`);

    try {
        // Test 1: Subir un archivo de prueba
        console.log('📤 Test 1: Subir archivo de prueba...');
        const testContent = `Test file created at ${new Date().toISOString()}`;
        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: 'test/connection-test.txt',
            Body: Buffer.from(testContent),
            ContentType: 'text/plain',
        });
        await r2Client.send(uploadCommand);
        console.log('✅ Archivo subido exitosamente: test/connection-test.txt');


        // Test 2: Descargar el archivo
        console.log('\n📥 Test 2: Descargar archivo de prueba...');
        const downloadCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: 'test/connection-test.txt',
        });
        const downloadResult = await r2Client.send(downloadCommand);
        const downloadedContent = await downloadResult.Body?.transformToString();
        console.log('✅ Archivo descargado. Contenido:', downloadedContent);

        // Test 3: Eliminar el archivo de prueba
        console.log('\n🗑️  Test 3: Eliminar archivo de prueba...');
        const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: 'test/connection-test.txt',
        });
        await r2Client.send(deleteCommand);
        console.log('✅ Archivo eliminado exitosamente');

        console.log('\n✅ ¡Todos los tests pasaron! R2 está configurado correctamente.\n');

        console.log('📋 Configuración:');
        console.log(`   - Account ID: ${process.env.R2_ACCOUNT_ID}`);
        console.log(`   - Bucket: ${BUCKET_NAME}`);
        console.log(`   - Endpoint: https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
        console.log(`   - Public URL: ${process.env.R2_PUBLIC_URL}\n`);

    } catch (error) {
        console.error('\n❌ Error en la conexión con R2:', error);
        console.error('\n🔧 Verifica que:');
        console.error('   1. Las credenciales en .env.local sean correctas');
        console.error('   2. El bucket exista en tu cuenta de Cloudflare');
        console.error('   3. El token tenga permisos de lectura y escritura');
        process.exit(1);
    }
}

testR2Connection();
