import { DriveFile } from '@/types/drive';

export interface StorageQuota {
    limit: number;
    usage: number;
    usageInDrive: number;
}

/**
 * Obtener cuota de almacenamiento de Google Drive
 */
export async function getStorageQuota(accessToken: string): Promise<StorageQuota> {
    const response = await fetch(
        'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error getting storage quota: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        limit: parseInt(data.storageQuota.limit),
        usage: parseInt(data.storageQuota.usage),
        usageInDrive: parseInt(data.storageQuota.usageInDrive),
    };
}

/**
 * Eliminar archivo (mover a papelera)
 */
export async function deleteFile(
    accessToken: string,
    fileId: string
): Promise<void> {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trashed: true }),
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `Error al eliminar archivo: ${response.statusText}`;

        try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.error?.message) {
                errorMessage = errorJson.error.message;

                // Detectar error de permisos
                if (errorMessage.includes('insufficient permissions') ||
                    errorMessage.includes('does not have sufficient permissions')) {
                    errorMessage = 'Este archivo pertenece a otra persona o fue creado por otra aplicación.\n\n' +
                        'No puedes eliminarlo desde aquí.\n\n' +
                        'Opciones:\n' +
                        '1. Pide al propietario que lo elimine\n' +
                        '2. Elimínalo directamente desde drive.google.com\n' +
                        '3. Quítalo de tu Drive (no lo elimina, solo lo oculta)';
                }
            }
        } catch (e) {
            // Si no es JSON, usar el mensaje por defecto
        }

        throw new Error(errorMessage);
    }
}

/**
 * Restaurar archivo de la papelera
 */
export async function restoreFile(
    accessToken: string,
    fileId: string
): Promise<void> {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trashed: false }),
        }
    );

    if (!response.ok) {
        throw new Error(`Error restoring file: ${response.statusText}`);
    }
}

/**
 * Eliminar archivo permanentemente
 */
export async function permanentlyDeleteFile(
    accessToken: string,
    fileId: string
): Promise<void> {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `Error al eliminar permanentemente: ${response.statusText}`;

        try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.error?.message) {
                errorMessage = errorJson.error.message;

                // Detectar error de permisos
                if (errorMessage.includes('insufficient permissions') ||
                    errorMessage.includes('does not have sufficient permissions')) {
                    errorMessage = 'Este archivo pertenece a otra persona.\n\n' +
                        'Solo el propietario puede eliminarlo permanentemente.\n\n' +
                        'Opciones:\n' +
                        '1. Pide al propietario que lo elimine\n' +
                        '2. Elimínalo desde drive.google.com con la cuenta del propietario';
                }
            }
        } catch (e) {
            // Si no es JSON, usar el mensaje por defecto
        }

        throw new Error(errorMessage);
    }
}

/**
 * Vaciar papelera completa
 */
export async function emptyTrash(accessToken: string): Promise<void> {
    const response = await fetch(
        'https://www.googleapis.com/drive/v3/files/trash',
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error emptying trash: ${response.statusText}`);
    }
}

/**
 * Formatear bytes a formato legible (GB, MB, KB)
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Obtener color según porcentaje de uso
 */
export function getStorageColor(percentage: number): {
    color: string;
    bgColor: string;
    textColor: string;
} {
    if (percentage < 50) {
        return {
            color: 'green',
            bgColor: 'bg-green-500',
            textColor: 'text-green-600',
        };
    } else if (percentage < 75) {
        return {
            color: 'yellow',
            bgColor: 'bg-yellow-500',
            textColor: 'text-yellow-600',
        };
    } else {
        return {
            color: 'red',
            bgColor: 'bg-red-500',
            textColor: 'text-red-600',
        };
    }
}
