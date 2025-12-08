// Tipos para Google Drive API

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    createdTime: string;
    modifiedTime: string;
    webViewLink: string;
    iconLink: string;
    thumbnailLink?: string;
    parents?: string[];
    owners?: Array<{
        displayName: string;
        emailAddress: string;
        me?: boolean;
    }>;
}

export interface DriveFolder {
    id: string;
    name: string;
    parents?: string[];
    children?: DriveFolder[];
}

export interface DriveFilesResponse {
    files: DriveFile[];
    nextPageToken?: string;
}

export interface DriveListOptions {
    folderId?: string;
    pageSize?: number;
    pageToken?: string;
    query?: string;
    orderBy?: string;
}
