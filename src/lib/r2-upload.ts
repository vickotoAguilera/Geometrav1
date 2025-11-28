/**
 * Utilidades para subir imágenes a Cloudflare R2
 * 
 * Este módulo maneja la subida de fotos de perfil a Cloudflare R2,
 * incluyendo optimización, validación y eliminación de imágenes.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Configuración del cliente S3 (compatible con R2)
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'geometra-user-profiles';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

// Constantes de validación
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const TARGET_SIZE = 500; // 500x500px
const TARGET_QUALITY = 0.8; // 80% calidad

/**
 * Optimiza una imagen: redimensiona y comprime
 */
export async function optimizeImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            // Calcular dimensiones manteniendo aspect ratio
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > TARGET_SIZE) {
                    height = (height * TARGET_SIZE) / width;
                    width = TARGET_SIZE;
                }
            } else {
                if (height > TARGET_SIZE) {
                    width = (width * TARGET_SIZE) / height;
                    height = TARGET_SIZE;
                }
            }

            canvas.width = TARGET_SIZE;
            canvas.height = TARGET_SIZE;

            if (!ctx) {
                reject(new Error('No se pudo obtener contexto del canvas'));
                return;
            }

            // Fondo blanco para transparencias
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

            // Centrar imagen
            const x = (TARGET_SIZE - width) / 2;
            const y = (TARGET_SIZE - height) / 2;

            ctx.drawImage(img, x, y, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Error al convertir canvas a blob'));
                    }
                },
                'image/jpeg',
                TARGET_QUALITY
            );
        };

        img.onerror = () => {
            reject(new Error('Error al cargar la imagen'));
        };

        img.src = URL.createObjectURL(file);
    });
}

/**
 * Valida un archivo de imagen
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Formato no permitido. Usa JPG, PNG o WebP.',
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: 'El archivo es demasiado grande. Máximo 5MB.',
        };
    }

    return { valid: true };
}

/**
 * Sube una foto de perfil a R2
 */
export async function uploadProfileImage(
    file: File,
    userId: string
): Promise<string> {
    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Optimizar imagen
    const optimizedBlob = await optimizeImage(file);

    // Generar nombre único
    const timestamp = Date.now();
    const extension = 'jpg'; // Siempre guardamos como JPG
    const key = `profiles/${userId}/${timestamp}.${extension}`;

    // Convertir Blob a ArrayBuffer
    const arrayBuffer = await optimizedBlob.arrayBuffer();

    // Subir a R2
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000', // 1 año
    });

    await r2Client.send(command);

    // Retornar URL pública
    const publicUrl = `${PUBLIC_URL}/${key}`;
    return publicUrl;
}

/**
 * Elimina una foto de perfil de R2
 */
export async function deleteProfileImage(imageUrl: string): Promise<void> {
    // Extraer key de la URL
    const key = imageUrl.replace(`${PUBLIC_URL}/`, '');

    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await r2Client.send(command);
}

/**
 * Extrae el userId de una URL de imagen de perfil
 */
export function extractUserIdFromImageUrl(imageUrl: string): string | null {
    const match = imageUrl.match(/profiles\/([^/]+)\//);
    return match ? match[1] : null;
}

/**
 * Verifica si una URL es de R2
 */
export function isR2Url(url: string): boolean {
    return url.startsWith(PUBLIC_URL);
}
