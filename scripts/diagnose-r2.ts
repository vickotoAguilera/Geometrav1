#!/usr/bin/env tsx

/**
 * Script de diagnóstico para R2
 * Verifica credenciales y conexión
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

console.log('\n' + '='.repeat(70));
console.log('🔍 DIAGNÓSTICO DE R2');
console.log('='.repeat(70) + '\n');

async function diagnoseR2() {
    // Verificar variables de entorno
    console.log('📋 Variables de Entorno:\n');

    const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
    const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

    console.log(`  R2_ACCOUNT_ID: ${R2_ACCOUNT_ID ? '✅ ' + R2_ACCOUNT_ID : '❌ NO CONFIGURADO'}`);
    console.log(`  R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID ? '✅ ' + R2_ACCESS_KEY_ID.substring(0, 10) + '...' : '❌ NO CONFIGURADO'}`);
    console.log(`  R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY ? '✅ ' + R2_SECRET_ACCESS_KEY.substring(0, 10) + '...' : '❌ NO CONFIGURADO'}`);
    console.log(`  R2_BUCKET_NAME: ${R2_BUCKET_NAME ? '✅ ' + R2_BUCKET_NAME : '❌ NO CONFIGURADO'}`);

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
        console.log('\n❌ Faltan variables de entorno requeridas');
        process.exit(1);
    }

    console.log('\n' + '-'.repeat(70) + '\n');

    // Test 1: Crear cliente
    console.log('🔧 Test 1: Crear Cliente S3\n');

    const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    console.log(`  Endpoint: ${endpoint}`);

    try {
        const r2Client = new S3Client({
            region: 'auto',
            endpoint,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        });
        console.log('  ✅ Cliente creado exitosamente\n');

        // Test 2: Listar buckets
        console.log('🔧 Test 2: Listar Buckets\n');
        try {
            const listCommand = new ListBucketsCommand({});
            const listResponse = await r2Client.send(listCommand);
            console.log(`  ✅ Buckets encontrados: ${listResponse.Buckets?.length || 0}`);
            listResponse.Buckets?.forEach(bucket => {
                console.log(`     - ${bucket.Name}`);
            });
            console.log();
        } catch (error: any) {
            console.log(`  ❌ Error listando buckets: ${error.message}\n`);
        }

        // Test 3: Subir archivo de prueba
        console.log('🔧 Test 3: Subir Archivo de Prueba\n');
        try {
            const testData = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Test de conexión R2',
            };

            const putCommand = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: 'test/connection-test.json',
                Body: JSON.stringify(testData, null, 2),
                ContentType: 'application/json',
            });

            await r2Client.send(putCommand);
            console.log('  ✅ Archivo subido exitosamente\n');

            // Test 4: Leer archivo
            console.log('🔧 Test 4: Leer Archivo\n');
            try {
                const getCommand = new GetObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: 'test/connection-test.json',
                });

                const getResponse = await r2Client.send(getCommand);
                const body = await getResponse.Body?.transformToString();
                const data = JSON.parse(body || '{}');

                console.log('  ✅ Archivo leído exitosamente');
                console.log(`  📄 Contenido: ${JSON.stringify(data, null, 2)}\n`);

                console.log('='.repeat(70));
                console.log('✅ TODOS LOS TESTS PASARON');
                console.log('='.repeat(70) + '\n');
                process.exit(0);

            } catch (error: any) {
                console.log(`  ❌ Error leyendo archivo: ${error.message}\n`);
                console.log('Detalles del error:', error);
            }

        } catch (error: any) {
            console.log(`  ❌ Error subiendo archivo: ${error.message}\n`);
            console.log('Detalles del error:', error);

            if (error.message?.includes('EPROTO') || error.message?.includes('SSL')) {
                console.log('\n💡 DIAGNÓSTICO:');
                console.log('  - Error SSL detectado');
                console.log('  - Posibles causas:');
                console.log('    1. Credenciales incorrectas');
                console.log('    2. Account ID incorrecto');
                console.log('    3. Problema de red/firewall');
                console.log('    4. Endpoint mal configurado');
                console.log('\n📝 SOLUCIONES:');
                console.log('  1. Verificar credenciales en Cloudflare Dashboard');
                console.log('  2. Verificar Account ID (debe ser el Account ID de Cloudflare)');
                console.log('  3. Probar con endpoint alternativo');
            }
        }

    } catch (error: any) {
        console.log(`  ❌ Error creando cliente: ${error.message}\n`);
    }

    console.log('='.repeat(70));
    console.log('❌ ALGUNOS TESTS FALLARON');
    console.log('='.repeat(70) + '\n');
    process.exit(1);
}

// Ejecutar diagnóstico
diagnoseR2().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
