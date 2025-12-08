import { DriveFile } from '@/types/drive';

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
    speed: number; // bytes/sec
    timeRemaining: number; // seconds
}

/**
 * Iniciar sesión de upload resumable
 */
async function initiateResumableUpload(
    file: File,
    accessToken: string,
    folderId?: string
): Promise<string> {
    const metadata = {
        name: file.name,
        mimeType: file.type,
        ...(folderId && { parents: [folderId] }),
    };

    const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metadata),
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to initiate upload: ${response.statusText}`);
    }

    const uploadUrl = response.headers.get('Location');
    if (!uploadUrl) {
        throw new Error('No upload URL received');
    }

    return uploadUrl;
}

/**
 * Subir archivo a Google Drive con progreso
 */
export async function uploadFileToDrive(
    file: File,
    accessToken: string,
    folderId?: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<DriveFile> {
    // Iniciar sesión de upload
    const uploadUrl = await initiateResumableUpload(file, accessToken, folderId);

    // Subir archivo con XMLHttpRequest para tracking de progreso
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const startTime = Date.now();
        let lastLoaded = 0;
        let lastTime = startTime;

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const now = Date.now();
                const timeDiff = (now - lastTime) / 1000; // segundos
                const loadedDiff = e.loaded - lastLoaded;

                // Calcular velocidad instantánea
                const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;

                // Calcular tiempo restante
                const remaining = e.total - e.loaded;
                const timeRemaining = speed > 0 ? remaining / speed : 0;

                const progress: UploadProgress = {
                    loaded: e.loaded,
                    total: e.total,
                    percentage: (e.loaded / e.total) * 100,
                    speed,
                    timeRemaining,
                };

                onProgress?.(progress);

                lastLoaded = e.loaded;
                lastTime = now;
            }
        });

        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201) {
                try {
                    const driveFile = JSON.parse(xhr.responseText);
                    resolve(driveFile);
                } catch (err) {
                    reject(new Error('Failed to parse response'));
                }
            } else {
                reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error during upload'));
        };

        xhr.onabort = () => {
            reject(new Error('Upload cancelled'));
        };

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
    });
}

/**
 * Formatear velocidad de bytes/sec a formato legible
 */
export function formatSpeed(bytesPerSecond: number): string {
    if (bytesPerSecond === 0) return '0 B/s';

    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));

    return `${(bytesPerSecond / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Formatear tiempo en segundos a formato legible
 */
export function formatTime(seconds: number): string {
    if (seconds === 0 || !isFinite(seconds)) return '0s';

    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}m ${secs}s`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    }
}

/**
 * Validar archivo antes de subir
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100 MB
    const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
    ];

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `El archivo "${file.name}" es muy grande (máx. 100 MB)`,
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Tipo de archivo "${file.type}" no permitido`,
        };
    }

    return { valid: true };
}
