/**
 * Utilidades para gestionar el almacenamiento R2 por usuario
 * Límite: 100MB por usuario
 * Expiración: 7 días
 */

'use server';

import { S3Client, ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from '@/firebase/server';
import { formatBytes, getDaysUntilExpiration, getFileType } from './storage-utils';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'geometra';
const MAX_STORAGE_BYTES = 100 * 1024 * 1024; // 100MB en bytes
const EXPIRATION_DAYS = 7;

export interface UserFile {
    key: string;
    name: string;
    size: number;
    uploadedAt: Date;
    expiresAt: Date;
    url: string;
    type: string;
}

export interface StorageStats {
    usedBytes: number;
    usedMB: number;
    maxBytes: number;
    maxMB: number;
    usagePercentage: number;
    filesCount: number;
    files: UserFile[];
}

/**
 * Obtiene las estadísticas de almacenamiento de un usuario
 */
export async function getUserStorageStats(userId: string): Promise<StorageStats> {
    try {
        // Listar todos los archivos del usuario (excepto profile.jpg)
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: `users/${userId}/`,
        });

        const result = await r2Client.send(listCommand);
        const files: UserFile[] = [];
        let totalBytes = 0;

        if (result.Contents) {
            for (const item of result.Contents) {
                if (!item.Key || !item.Size || !item.LastModified) continue;

                // Extraer nombre del archivo
                const parts = item.Key.split('/');
                const fileName = parts[parts.length - 1];

                files.push({
                    key: item.Key,
                    name: fileName,
                    size: item.Size,
                    uploadedAt: item.LastModified,
                    expiresAt: new Date(item.LastModified.getTime() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
                    url: `${process.env.R2_PUBLIC_URL}/${item.Key}`,
                    type: getFileType(fileName),
                });

                totalBytes += item.Size;
            }
        }

        // Ordenar por fecha (más reciente primero)
        files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

        return {
            usedBytes: totalBytes,
            usedMB: parseFloat((totalBytes / (1024 * 1024)).toFixed(2)),
            maxBytes: MAX_STORAGE_BYTES,
            maxMB: 100,
            usagePercentage: parseFloat(((totalBytes / MAX_STORAGE_BYTES) * 100).toFixed(2)),
            filesCount: files.length,
            files,
        };
    } catch (error) {
        console.error('Error getting storage stats:', error);
        throw error;
    }
}

/**
 * Elimina archivos expirados (más de 7 días)
 */
export async function deleteExpiredFiles(userId: string): Promise<number> {
    try {
        const stats = await getUserStorageStats(userId);
        const now = new Date();
        let deletedCount = 0;

        for (const file of stats.files) {
            if (file.expiresAt < now) {
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: file.key,
                });

                await r2Client.send(deleteCommand);
                deletedCount++;
                console.log(`Deleted expired file: ${file.key}`);
            }
        }

        return deletedCount;
    } catch (error) {
        console.error('Error deleting expired files:', error);
        throw error;
    }
}

/**
 * Elimina un archivo específico
 */
export async function deleteUserFile(userId: string, fileKey: string): Promise<void> {
    try {
        // Verificar que el archivo pertenece al usuario
        if (!fileKey.startsWith(`users/${userId}/`)) {
            throw new Error('No tienes permiso para eliminar este archivo');
        }

        const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        await r2Client.send(deleteCommand);
        console.log(`File deleted: ${fileKey}`);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

/**
 * Verifica si el usuario tiene espacio disponible
 */
export async function hasStorageSpace(userId: string, fileSizeBytes: number): Promise<boolean> {
    const stats = await getUserStorageStats(userId);
    return (stats.usedBytes + fileSizeBytes) <= MAX_STORAGE_BYTES;
}
