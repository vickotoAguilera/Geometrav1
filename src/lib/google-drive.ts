/**
 * Utilidades para interactuar con Google Drive API
 * Permite descargar archivos, obtener metadata y listar archivos del usuario
 */

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    webViewLink: string;
    thumbnailLink?: string;
    createdTime: string;
    modifiedTime: string;
}

/**
 * Descarga un archivo desde Google Drive
 * @param fileId - ID del archivo en Drive
 * @param accessToken - Token de acceso de Firebase Auth
 * @returns ArrayBuffer con el contenido del archivo
 */
export async function downloadFromDrive(
    fileId: string,
    accessToken: string
): Promise<ArrayBuffer> {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error downloading file from Drive: ${response.statusText}`);
    }

    return response.arrayBuffer();
}

/**
 * Obtiene metadata de un archivo en Drive
 * @param fileId - ID del archivo
 * @param accessToken - Token de acceso
 * @returns Metadata del archivo
 */
export async function getFileMetadata(
    fileId: string,
    accessToken: string
): Promise<DriveFile> {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink,thumbnailLink,createdTime,modifiedTime`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error getting file metadata: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Lista archivos del Drive del usuario
 * @param accessToken - Token de acceso
 * @param mimeTypes - Tipos MIME a filtrar (opcional)
 * @returns Array de archivos
 */
export async function listDriveFiles(
    accessToken: string,
    mimeTypes?: string[]
): Promise<DriveFile[]> {
    let query = "trashed=false";

    if (mimeTypes && mimeTypes.length > 0) {
        const mimeQuery = mimeTypes
            .map((type) => `mimeType='${type}'`)
            .join(" or ");
        query += ` and (${mimeQuery})`;
    }

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,webViewLink,thumbnailLink,createdTime,modifiedTime)&orderBy=modifiedTime desc&pageSize=50`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error listing Drive files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
}

/**
 * Obtiene el access token del usuario autenticado
 * @param user - Usuario de Firebase Auth
 * @returns Access token para Google APIs
 */
export async function getAccessToken(user: any): Promise<string> {
    // El access token está disponible en el resultado de signInWithPopup
    // o podemos obtenerlo usando getIdToken con forceRefresh
    const token = await user.getIdToken(true);

    // Para Google Drive necesitamos el access token de OAuth, no el ID token de Firebase
    // Esto requiere acceder al credential del usuario
    // @ts-ignore - providerData contiene la información de OAuth
    const googleProvider = user.providerData?.find(
        (provider: any) => provider.providerId === 'google.com'
    );

    if (!googleProvider) {
        throw new Error('Usuario no autenticado con Google');
    }

    // El access token se guarda en el resultado de signInWithPopup
    // Necesitamos guardarlo cuando el usuario inicia sesión
    // Por ahora, retornamos el ID token (esto necesita ajustarse)
    return token;
}
