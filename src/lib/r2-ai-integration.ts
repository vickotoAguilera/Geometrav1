/**
 * Integración entre Cloudflare R2 y los flujos de IA
 * 
 * Este módulo proporciona funciones para que la IA pueda procesar
 * archivos almacenados en R2, incluyendo imágenes, PDFs y documentos.
 */

'use server';

import { downloadFileFromR2 } from './r2-upload';
import { GoogleAIFileManager } from '@google/generative-ai/server';

// Inicializar el File Manager de Google AI
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_GENAI_API_KEY || '');

/**
 * Convierte un archivo de R2 a un formato que la IA puede procesar
 * Para imágenes: las descarga y las convierte a base64
 * Para PDFs: los descarga y extrae el texto
 */
export async function prepareR2FileForAI(fileUrl: string, mimeType: string): Promise<{
    type: 'image' | 'text' | 'file';
    data: string;
    mimeType: string;
}> {
    // Descargar el archivo desde R2
    const blob = await downloadFileFromR2(fileUrl);

    // Si es una imagen, convertir a base64
    if (mimeType.startsWith('image/')) {
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return {
            type: 'image',
            data: `data:${mimeType};base64,${base64}`,
            mimeType,
        };
    }

    // Si es un PDF, extraer texto (simplificado - en producción usar una librería como pdf-parse)
    if (mimeType === 'application/pdf') {
        // Por ahora, retornamos el archivo como tal
        // TODO: Implementar extracción de texto de PDF
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return {
            type: 'file',
            data: base64,
            mimeType,
        };
    }

    // Para documentos de texto, extraer el contenido
    if (mimeType.startsWith('text/')) {
        const text = await blob.text();

        return {
            type: 'text',
            data: text,
            mimeType,
        };
    }

    // Para otros tipos, retornar como archivo genérico
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
        type: 'file',
        data: base64,
        mimeType,
    };
}

/**
 * Sube un archivo a Google AI File Manager para procesamiento
 * Útil para archivos grandes que no se pueden enviar directamente en el prompt
 */
export async function uploadR2FileToGoogleAI(
    fileUrl: string,
    displayName: string,
    mimeType: string
): Promise<string> {
    const blob = await downloadFileFromR2(fileUrl);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Google AI File Manager
    const uploadResult = await fileManager.uploadFile(buffer as any, {
        mimeType,
        displayName,
    });

    return uploadResult.file.uri;
}

/**
 * Procesa múltiples archivos de R2 para incluirlos en un prompt de IA
 */
export async function processR2FilesForPrompt(
    files: Array<{ url: string; type: string; name: string }>
): Promise<Array<{ type: string; data: string; name: string }>> {
    const processedFiles = await Promise.all(
        files.map(async (file) => {
            const prepared = await prepareR2FileForAI(file.url, file.type);
            return {
                type: prepared.type,
                data: prepared.data,
                name: file.name,
            };
        })
    );

    return processedFiles;
}

/**
 * Genera un contexto de texto para la IA basado en archivos de R2
 * Útil para incluir información sobre archivos adjuntos en el prompt
 */
export function generateFileContext(
    files: Array<{ name: string; type: string; size: number }>
): string {
    if (files.length === 0) {
        return '';
    }

    const fileList = files.map((file, index) => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        return `${index + 1}. ${file.name} (${file.type}, ${sizeMB}MB)`;
    }).join('\n');

    return `\n\nArchivos adjuntos:\n${fileList}\n`;
}

/**
 * Determina si un archivo puede ser procesado directamente por la IA
 */
export function canProcessWithAI(mimeType: string): boolean {
    const processableTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'text/plain',
        'text/csv',
    ];

    return processableTypes.includes(mimeType);
}
