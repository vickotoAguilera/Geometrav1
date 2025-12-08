export interface Message {
    id: string;
    type: 'chat' | 'fileContext' | 'text';
    role: 'user' | 'assistant';
    content: string;
    createdAt: any;

    // File-specific fields
    fileName?: string;
    mimeType?: string;
    source?: 'local' | 'drive';
    fileSize?: number;
    fileDataUri?: string;
    extractedContent?: string;
    thumbnailBase64?: string;
    isActive?: boolean;

    // Chunking fields
    groupId?: string;
    partNumber?: number;
    totalParts?: number;

    // Screenshot field
    screenshot?: string;
}

export type TutorMode = 'math' | 'geogebra' | 'stepByStep' | 'socratic';

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    thumbnailLink?: string;
    webViewLink?: string;
}
