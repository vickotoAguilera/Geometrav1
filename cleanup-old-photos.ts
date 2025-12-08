/**
 * Script para limpiar fotos antiguas de perfil
 * Deja solo la última foto de cada usuario
 */

import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

async function cleanupOldPhotos() {
    console.log('🧹 Limpiando fotos antiguas de perfil...\n');

    try {
        // Listar todas las fotos de perfil
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'profiles/',
        });

        const result = await r2Client.send(listCommand);

        if (!result.Contents || result.Contents.length === 0) {
            console.log('No hay fotos para limpiar');
            return;
        }

        // Agrupar por usuario
        const photosByUser: { [userId: string]: any[] } = {};

        result.Contents.forEach(item => {
            if (!item.Key) return;

            // Extraer userId de la key: profiles/{userId}/{timestamp}.jpg
            const parts = item.Key.split('/');
            if (parts.length === 3) {
                const userId = parts[1];
                if (!photosByUser[userId]) {
                    photosByUser[userId] = [];
                }
                photosByUser[userId].push(item);
            }
        });

        console.log(`📊 Usuarios encontrados: ${Object.keys(photosByUser).length}\n`);

        // Para cada usuario, mantener solo la última foto
        let totalDeleted = 0;

        for (const [userId, photos] of Object.entries(photosByUser)) {
            if (photos.length <= 1) {
                console.log(`✅ ${userId}: Solo tiene 1 foto, no hay nada que limpiar`);
                continue;
            }

            // Ordenar por fecha (más reciente primero)
            photos.sort((a, b) => {
                const dateA = a.LastModified ? new Date(a.LastModified).getTime() : 0;
                const dateB = b.LastModified ? new Date(b.LastModified).getTime() : 0;
                return dateB - dateA;
            });

            // La primera es la más reciente, eliminar el resto
            const toKeep = photos[0];
            const toDelete = photos.slice(1);

            console.log(`\n👤 Usuario: ${userId}`);
            console.log(`   ✅ Manteniendo: ${toKeep.Key}`);
            console.log(`   🗑️  Eliminando ${toDelete.length} foto(s) antigua(s)...`);

            for (const photo of toDelete) {
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: photo.Key,
                });

                await r2Client.send(deleteCommand);
                console.log(`      ❌ Eliminado: ${photo.Key}`);
                totalDeleted++;
            }
        }

        console.log(`\n✅ Limpieza completada!`);
        console.log(`📊 Total de fotos eliminadas: ${totalDeleted}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

cleanupOldPhotos();
