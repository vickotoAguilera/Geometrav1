/**
 * Procesador de archivos locales para ChatBeta
 * Procesa PDFs y DOCX antes de guardarlos en Firestore
 */

'use server';

import { extractPdfText } from '@/lib/processors/pdf-processor';
import { extractDocxText } from '@/lib/processors/docx-processor';

export interface ProcessedLocalFile {
    fileName: string;
    mimeType: string;
    fileSize: number;
    extractedContent?: string;
    thumbnailBase64?: string;
}

/**
 * Procesa un archivo local antes de guardarlo
 * @param file - Archivo a procesar
 * @returns Datos procesados del archivo
 */
export async function processLocalFile(file: File): Promise<ProcessedLocalFile> {
    const fileData = await file.arrayBuffer();

    let extractedContent: string | undefined;
    let thumbnailBase64: string | undefined;

    // Procesar según tipo de archivo
    if (file.type === 'application/pdf') {
        // Procesar PDF con Google AI File Manager
        extractedContent = await extractPdfText(fileData, file.name);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Procesar DOCX
        extractedContent = await extractDocxText(fileData);
    } else if (file.type.startsWith('image/')) {
        // Para imágenes, convertir a base64
        const base64 = Buffer.from(fileData).toString('base64');
        thumbnailBase64 = `data:${file.type};base64,${base64}`;
        extractedContent = thumbnailBase64;
    } else {
        // Otros archivos, convertir a base64
        const base64 = Buffer.from(fileData).toString('base64');
        extractedContent = `data:${file.type};base64,${base64}`;
    }

    return {
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        extractedContent,
        thumbnailBase64,
    };
}
