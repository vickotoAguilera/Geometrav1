import { DriveFile, DriveFilesResponse, DriveListOptions, DriveFolder } from '@/types/drive';

/**
 * Listar archivos de Google Drive
 */
export async function listDriveFiles(
    accessToken: string,
    options: DriveListOptions = {}
): Promise<DriveFilesResponse> {
    const {
        folderId,
        pageSize = 20,
        pageToken,
        query,
        orderBy = 'modifiedTime desc'
    } = options;

    // Construir query de búsqueda
    let q = query || 'trashed=false';

    // Si la query personalizada no incluye 'trashed', agregar trashed=false
    if (query && !query.includes('trashed')) {
        q = `${query} and trashed=false`;
    }

    if (folderId) {
        q = `'${folderId}' in parents and ${q}`;
    }

    const params = new URLSearchParams({
        q,
        pageSize: pageSize.toString(),
        orderBy,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink, parents, owners(displayName,emailAddress,me))',
    });

    if (pageToken) {
        params.append('pageToken', pageToken);
    }

    const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
    console.log('🔍 Drive API URL:', url);

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Drive API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorBody
        });
        throw new Error(`Error listing files: ${response.statusText} - ${errorBody}`);
    }

    return response.json();
}

/**
 * Buscar archivos en Google Drive
 */
export async function searchDriveFiles(
    accessToken: string,
    query: string
): Promise<DriveFile[]> {
    const response = await listDriveFiles(accessToken, { query, pageSize: 50 });
    return response.files;
}

/**
 * Obtener estructura de carpetas
 */
export async function getFolderStructure(
    accessToken: string,
    folderId?: string
): Promise<DriveFolder[]> {
    const q = folderId
        ? `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        : "mimeType='application/vnd.google-apps.folder' and trashed=false";

    const params = new URLSearchParams({
        q,
        pageSize: '100',
        orderBy: 'name',
        fields: 'files(id, name, parents)',
    });

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error getting folders: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files;
}

/**
 * Crear una carpeta en Google Drive
 */
export async function createFolder(
    accessToken: string,
    name: string,
    parentId?: string
): Promise<DriveFolder> {
    const metadata: any = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
        metadata.parents = [parentId];
    }

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
    });

    if (!response.ok) {
        throw new Error(`Error creating folder: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Mover un archivo a otra carpeta
 */
export async function moveFile(
    accessToken: string,
    fileId: string,
    newParentId: string,
    oldParentId?: string
): Promise<void> {
    const params = new URLSearchParams();
    if (oldParentId) {
        params.append('removeParents', oldParentId);
    }
    params.append('addParents', newParentId);

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?${params.toString()}`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error moving file: ${response.statusText}`);
    }
}

/**
 * Obtener icono según tipo MIME
 */
export function getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('document')) return '📝';
    if (mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType === 'application/vnd.google-apps.folder') return '📁';
    return '📎';
}

/**
 * Formatear tamaño de archivo
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Formatear fecha
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return date.toLocaleDateString();
}
