/**
 * Utilidades para subir archivos a Cloudflare R2
 * 
 * Este módulo maneja la subida de archivos a Cloudflare R2:
 * - Fotos de perfil (optimizadas)
 * - Archivos de tareas de alumnos (PDFs, imágenes, documentos)
 * - Archivos de retroalimentación de profesores
 * - Mensajes con archivos adjuntos
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

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

// Constantes de validación para fotos de perfil
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const TARGET_SIZE = 500; // 500x500px
const TARGET_QUALITY = 0.8; // 80% calidad

// Constantes de validación para archivos de tareas y retroalimentación
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ALLOWED_FILE_TYPES = [
    // Imágenes
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain',
    'text/csv',
    // Archivos comprimidos
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
];

// Tipos de archivo prohibidos (videos)
const FORBIDDEN_FILE_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
];

// Tipos de archivo para organización
export type FileCategory = 'profile' | 'task' | 'feedback' | 'message';

// Metadata de archivo
export interface FileMetadata {
    url: string;
    key: string;
    name: string;
    type: string;
    size: number;
    category: FileCategory;
    uploadedAt: Date;
}


/**
 * Optimiza una imagen: redimensiona y comprime
 * NOTA: Esta función debe ejecutarse en el CLIENTE, no en el servidor
 */
export async function optimizeImage(file: File): Promise<Blob> {
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') {
        throw new Error('optimizeImage debe ejecutarse en el cliente');
    }

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
 * Valida un archivo de imagen para foto de perfil
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Formato no permitido. Usa JPG, PNG o WebP.',
        };
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
        return {
            valid: false,
            error: 'El archivo es demasiado grande. Máximo 5MB.',
        };
    }

    return { valid: true };
}

/**
 * Valida un archivo general (tareas, retroalimentación, mensajes)
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    // Verificar que no sea un video
    if (FORBIDDEN_FILE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Los archivos de video no están permitidos.',
        };
    }

    // Verificar que sea un tipo permitido
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Formato de archivo no permitido. Usa PDF, imágenes, Word, Excel, PowerPoint, o archivos de texto.',
        };
    }

    // Verificar tamaño
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        return {
            valid: false,
            error: `El archivo es demasiado grande. Máximo ${sizeMB}MB.`,
        };
    }

    return { valid: true };
}


/**
 * Sube una foto de perfil a R2
 * NOTA: Recibe un Blob ya optimizado desde el cliente
 */
export async function uploadProfileImage(
    blob: Blob,
    userId: string
): Promise<string> {
    console.log('🔍 [R2] uploadProfileImage called');
    console.log('📦 [R2] Blob size:', blob.size, 'bytes');
    console.log('👤 [R2] User ID:', userId);

    // Usar nombre fijo para que se reemplace automáticamente
    const key = `profiles/${userId}/profile.jpg`;
    console.log('🔑 [R2] Key (fijo):', key);

    // Convertir Blob a ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    console.log('📊 [R2] ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');

    console.log('📤 [R2] Uploading to bucket:', BUCKET_NAME);
    // Subir a R2 (esto reemplazará automáticamente la foto anterior)
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000', // 1 año
    });

    await r2Client.send(command);
    console.log('✅ [R2] Upload successful!');

    // Retornar URL pública (siempre la misma para cada usuario)
    const publicUrl = `${PUBLIC_URL}/${key}`;
    console.log('🌐 [R2] Public URL:', publicUrl);
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

/**
 * Obtiene la extensión de un archivo basado en su tipo MIME
 */
function getFileExtension(mimeType: string, originalName?: string): string {
    // Intentar obtener extensión del nombre original
    if (originalName && originalName.includes('.')) {
        const ext = originalName.split('.').pop();
        if (ext) return ext.toLowerCase();
    }

    // Mapeo de tipos MIME a extensiones
    const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/bmp': 'bmp',
        'image/svg+xml': 'svg',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'text/plain': 'txt',
        'text/csv': 'csv',
        'application/zip': 'zip',
        'application/x-rar-compressed': 'rar',
        'application/x-7z-compressed': '7z',
    };

    return mimeToExt[mimeType] || 'bin';
}

/**
 * Sube un archivo de tarea a R2
 */
export async function uploadTaskFile(
    file: File,
    userId: string,
    taskId: string
): Promise<FileMetadata> {
    const timestamp = Date.now();
    const extension = getFileExtension(file.type, file.name);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `tasks/${userId}/${taskId}/${timestamp}_${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type,
        CacheControl: 'public, max-age=86400', // 1 día
        Metadata: {
            originalName: file.name,
            uploadedBy: userId,
            category: 'task',
        },
    });

    await r2Client.send(command);

    const url = `${PUBLIC_URL}/${key}`;

    return {
        url,
        key,
        name: file.name,
        type: file.type,
        size: file.size,
        category: 'task',
        uploadedAt: new Date(),
    };
}

/**
 * Sube un archivo de retroalimentación a R2
 */
export async function uploadFeedbackFile(
    file: File,
    teacherId: string,
    taskId: string
): Promise<FileMetadata> {
    const timestamp = Date.now();
    const extension = getFileExtension(file.type, file.name);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `feedback/${teacherId}/${taskId}/${timestamp}_${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type,
        CacheControl: 'public, max-age=86400', // 1 día
        Metadata: {
            originalName: file.name,
            uploadedBy: teacherId,
            category: 'feedback',
        },
    });

    await r2Client.send(command);

    const url = `${PUBLIC_URL}/${key}`;

    return {
        url,
        key,
        name: file.name,
        type: file.type,
        size: file.size,
        category: 'feedback',
        uploadedAt: new Date(),
    };
}

/**
 * Sube un archivo adjunto a un mensaje
 */
export async function uploadMessageFile(
    file: File,
    senderId: string,
    messageId: string
): Promise<FileMetadata> {
    const timestamp = Date.now();
    const extension = getFileExtension(file.type, file.name);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `messages/${senderId}/${messageId}/${timestamp}_${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type,
        CacheControl: 'public, max-age=86400', // 1 día
        Metadata: {
            originalName: file.name,
            uploadedBy: senderId,
            category: 'message',
        },
    });

    await r2Client.send(command);

    const url = `${PUBLIC_URL}/${key}`;

    return {
        url,
        key,
        name: file.name,
        type: file.type,
        size: file.size,
        category: 'message',
        uploadedAt: new Date(),
    };
}

/**
 * Descarga un archivo desde R2 (para procesamiento de IA)
 * NOTA: Esta función debe ejecutarse en el SERVIDOR
 */
export async function downloadFileFromR2(fileUrl: string): Promise<Blob> {
    const key = fileUrl.replace(`${PUBLIC_URL}/`, '');

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
        throw new Error('No se pudo descargar el archivo desde R2');
    }

    // Convertir el stream a Blob
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    const blob = new Blob(chunks, { type: response.ContentType });
    return blob;
}

/**
 * Lista archivos de un usuario por categoría
 */
export async function listUserFiles(
    userId: string,
    category: FileCategory
): Promise<FileMetadata[]> {
    const prefix = category === 'profile'
        ? `profiles/${userId}/`
        : category === 'task'
            ? `tasks/${userId}/`
            : category === 'feedback'
                ? `feedback/${userId}/`
                : `messages/${userId}/`;

    const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
    });

    const response = await r2Client.send(command);

    if (!response.Contents) {
        return [];
    }

    return response.Contents.map(item => ({
        url: `${PUBLIC_URL}/${item.Key}`,
        key: item.Key || '',
        name: item.Key?.split('/').pop() || '',
        type: '', // No disponible en listado
        size: item.Size || 0,
        category,
        uploadedAt: item.LastModified || new Date(),
    }));
}

/**
 * Elimina un archivo de R2 (genérico)
 */
export async function deleteFile(fileUrl: string): Promise<void> {
    const key = fileUrl.replace(`${PUBLIC_URL}/`, '');

    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await r2Client.send(command);
}
