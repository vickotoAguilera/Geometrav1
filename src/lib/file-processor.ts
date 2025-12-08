/**
 * Orquestador de procesamiento de archivos de Google Drive
 * Coordina la descarga, procesamiento y almacenamiento de archivos
 */

import { downloadFromDrive, getFileMetadata } from './google-drive';
import { extractPdfText } from './processors/pdf-processor';
import { analyzeImageWithGemini, createThumbnail } from './processors/image-processor';
import { extractDocxText } from './processors/docx-processor';

export interface ProcessedFile {
    messageId: string;
    fileName: string;
    mimeType: string;
    source: 'google-drive';
    driveFileId: string;
    driveUrl: string;

    // Para PDFs y DOCX
    extractedContent?: string;
    contentSummary?: string;

    // Para imágenes
    visualDescription?: string;
    detectedText?: string;
    detectedMath?: string[];
    thumbnailBase64?: string;

    // Metadata
    fileSize: number;
}

/**
 * Procesa un archivo de Google Drive y lo guarda en Firestore
 * @param driveFileId - ID del archivo en Google Drive
 * @param userId - ID del usuario
 * @param accessToken - Token de acceso de Google
 * @param firestore - Instancia de Firestore
 * @returns Información del archivo procesado
 */
export async function processGoogleDriveFile(
    driveFileId: string,
    userId: string,
    accessToken: string,
    firestore: any // No longer used, kept for compatibility
): Promise<ProcessedFile> {
    try {
        // 1. Obtener metadata del archivo
        const metadata = await getFileMetadata(driveFileId, accessToken);

        // 2. Descargar archivo
        const fileData = await downloadFromDrive(driveFileId, accessToken);

        // 3. Procesar según tipo de archivo
        let processedData: Partial<ProcessedFile> = {};

        if (metadata.mimeType === 'application/pdf') {
            // Procesar PDF con Google AI File Manager
            const text = await extractPdfText(fileData, metadata.name);
            processedData = {
                extractedContent: text,
                contentSummary: generateSummary(text),
            };
        } else if (metadata.mimeType.startsWith('image/')) {
            // Procesar imagen
            const analysis = await analyzeImageWithGemini(fileData, metadata.mimeType);
            const thumbnail = await createThumbnail(fileData, 200);

            processedData = {
                visualDescription: analysis.visualDescription,
                detectedText: analysis.detectedText,
                detectedMath: analysis.mathSymbols,
                thumbnailBase64: thumbnail,
            };
        } else if (
            metadata.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            // Procesar DOCX
            const text = await extractDocxText(fileData);
            processedData = {
                extractedContent: text,
                contentSummary: generateSummary(text),
            };
        } else {
            throw new Error(`Tipo de archivo no soportado: ${metadata.mimeType}`);
        }

        // 4. Retornar resultado SIN guardar en Firestore
        // El cliente se encargará de guardar en Firestore
        return {
            messageId: '', // Se generará en el cliente
            fileName: metadata.name,
            mimeType: metadata.mimeType,
            source: 'google-drive',
            driveFileId: driveFileId,
            driveUrl: metadata.webViewLink,
            fileSize: metadata.size,
            ...processedData,
        };
    } catch (error) {
        console.error('Error processing Google Drive file:', error);
        throw new Error(
            `No se pudo procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
    }
}

/**
 * Genera un resumen corto de un texto
 * @param text - Texto completo
 * @param maxLength - Longitud máxima del resumen
 * @returns Resumen del texto
 */
function generateSummary(text: string, maxLength: number = 200): string {
    if (text.length <= maxLength) {
        return text;
    }

    // Tomar las primeras palabras hasta el límite
    const words = text.split(' ');
    let summary = '';

    for (const word of words) {
        if ((summary + word).length > maxLength) {
            break;
        }
        summary += word + ' ';
    }

    return summary.trim() + '...';
}

/**
 * Valida que un archivo sea soportado
 * @param mimeType - Tipo MIME del archivo
 * @returns true si es soportado
 */
export function isSupportedFileType(mimeType: string): boolean {
    const supportedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    return supportedTypes.includes(mimeType) || mimeType.startsWith('image/');
}

/**
 * Obtiene el tamaño máximo permitido para archivos (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Valida el tamaño de un archivo
 * @param size - Tamaño en bytes
 * @returns true si está dentro del límite
 */
export function isValidFileSize(size: number): boolean {
    return size <= MAX_FILE_SIZE;
}
