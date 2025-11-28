/**
 * Utilidades helper para el sistema de almacenamiento R2
 * Funciones síncronas que no requieren 'use server'
 */

/**
 * Formatea bytes a formato legible
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calcula días restantes hasta expiración
 */
export function getDaysUntilExpiration(expiresAt: Date): number {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Determina el tipo de archivo basado en la extensión
 */
export function getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

    const types: { [key: string]: string } = {
        // Imágenes
        jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
        // Documentos
        pdf: 'document', doc: 'document', docx: 'document',
        // Hojas de cálculo
        xls: 'spreadsheet', xlsx: 'spreadsheet', csv: 'spreadsheet',
        // Presentaciones
        ppt: 'presentation', pptx: 'presentation',
        // Texto
        txt: 'text',
        // Comprimidos
        zip: 'archive', rar: 'archive', '7z': 'archive',
    };

    return types[ext || ''] || 'other';
}
