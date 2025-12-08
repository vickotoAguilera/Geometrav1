/**
 * Procesador de archivos PDF usando Google AI File Manager
 * Funciona tanto para archivos locales como de Google Drive
 */

'use server';

import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { processWithApiKeyFallback } from '../utils/api-key-fallback';

/**
 * Procesa un PDF usando Google AI File Manager
 * @param fileData - ArrayBuffer con el contenido del PDF
 * @param fileName - Nombre del archivo
 * @returns Texto extraído del PDF
 */
export async function processPdfWithGoogleAI(
    fileData: ArrayBuffer,
    fileName: string
): Promise<string> {
    return processWithApiKeyFallback(async (fileManager, genAI) => {
        try {
            const buffer = Buffer.from(fileData);

            // Subir archivo a Google AI File Manager
            const uploadResult = await fileManager.uploadFile(buffer as any, {
                mimeType: 'application/pdf',
                displayName: fileName,
            });

            console.log(`PDF subido a Google AI: ${uploadResult.file.uri}`);

            // Esperar a que el archivo esté listo
            let file = await fileManager.getFile(uploadResult.file.name);
            while (file.state === 'PROCESSING') {
                await new Promise(resolve => setTimeout(resolve, 1000));
                file = await fileManager.getFile(uploadResult.file.name);
            }

            if (file.state === 'FAILED') {
                throw new Error('El procesamiento del PDF falló');
            }

            // Usar Gemini 2.5 Flash para extraer el texto del PDF (soporta File API)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType: uploadResult.file.mimeType,
                        fileUri: uploadResult.file.uri,
                    },
                },
                {
                    text: 'Extrae todo el texto de este PDF. Incluye ecuaciones matemáticas, tablas, y cualquier texto visible. Mantén el formato y estructura del documento original.',
                },
            ]);

            const extractedText = result.response.text();

            // Eliminar el archivo temporal de Google AI
            await fileManager.deleteFile(uploadResult.file.name);

            return extractedText;
        } catch (error) {
            console.error('Error procesando PDF con Google AI:', error);
            throw new Error(
                `No se pudo procesar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`
            );
        }
    });
}

/**
 * Extrae texto de un PDF (función compatible con la interfaz anterior)
 * @param fileData - ArrayBuffer con el contenido del PDF
 * @returns Texto extraído del PDF
 */
export async function extractPdfText(fileData: ArrayBuffer, fileName: string = 'document.pdf'): Promise<string> {
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB (límite de Google AI)
    const buffer = Buffer.from(fileData);

    if (buffer.length > MAX_SIZE) {
        const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
        return `[PDF de ${sizeMB}MB detectado - Archivo demasiado grande para procesar (máximo 50MB). Por favor, divide el PDF en archivos más pequeños.]`;
    }

    try {
        return await processPdfWithGoogleAI(fileData, fileName);
    } catch (error) {
        console.error('Error extrayendo texto del PDF:', error);
        return `[Error al procesar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, intenta con otro archivo o describe el contenido del PDF en tu mensaje.]`;
    }
}

/**
 * Extrae metadata de un PDF
 * @param fileData - ArrayBuffer con el contenido del PDF
 * @returns Metadata del PDF
 */
export async function extractPdfMetadata(fileData: ArrayBuffer): Promise<{
    numPages: number;
    info?: any;
}> {
    // Google AI File Manager no proporciona metadata detallada
    // Retornamos valores por defecto
    return {
        numPages: 0,
        info: {
            note: 'PDF procesado con Google AI File Manager',
        },
    };
}
