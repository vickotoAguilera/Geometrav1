/**
 * Procesador de archivos DOCX
 * Extrae texto de documentos Word usando mammoth
 */

/**
 * Extrae texto de un archivo DOCX
 * @param fileData - ArrayBuffer con el contenido del DOCX
 * @returns Texto extraído del documento
 */
export async function extractDocxText(fileData: ArrayBuffer): Promise<string> {
    try {
        // mammoth ya está instalado en el proyecto
        const mammoth = await import('mammoth');

        // Convertir ArrayBuffer a Buffer
        const buffer = Buffer.from(fileData);

        // Extraer texto
        const result = await mammoth.extractRawText({ buffer });

        return result.value;
    } catch (error) {
        console.error('Error extracting DOCX text:', error);
        throw new Error(`No se pudo extraer texto del DOCX: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
}

/**
 * Extrae texto con formato HTML de un DOCX
 * @param fileData - ArrayBuffer con el contenido del DOCX
 * @returns HTML con el contenido del documento
 */
export async function extractDocxHtml(fileData: ArrayBuffer): Promise<string> {
    try {
        const mammoth = await import('mammoth');
        const buffer = Buffer.from(fileData);

        const result = await mammoth.convertToHtml({ buffer });

        return result.value;
    } catch (error) {
        console.error('Error extracting DOCX HTML:', error);
        throw new Error('No se pudo extraer HTML del DOCX');
    }
}
