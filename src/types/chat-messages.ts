/**
 * Tipos TypeScript para mensajes de chat con soporte de Google Drive
 */

import { Timestamp } from 'firebase/firestore';

export interface BaseMessage {
    id: string;
    role: 'user' | 'assistant';
    createdAt?: Timestamp;
}

export interface TextMessage extends BaseMessage {
    type: 'text';
    content: string;
    imageUrl?: string; // Para imágenes enviadas con mensaje de texto
}

export interface FileContextMessage extends BaseMessage {
    type: 'fileContext';
    fileName: string;
    isActive: boolean;

    // Soporte para diferentes fuentes de archivos
    source: 'upload' | 'google-drive' | 'r2-cache';

    // Para archivos de Google Drive
    driveFileId?: string;
    driveUrl?: string;

    // Para archivos de texto (PDF, DOCX)
    extractedContent?: string;
    contentSummary?: string;

    // Para imágenes
    visualDescription?: string;
    detectedText?: string;
    detectedMath?: string[];
    thumbnailBase64?: string;

    // Metadata general
    fileSize?: number;
    mimeType?: string;
    dimensions?: { width: number; height: number };

    // Para chunking de archivos grandes
    groupId?: string;
    partNumber?: number;
    totalParts?: number;

    // Caché en R2
    r2CacheKey?: string;
    r2CacheExpiry?: Timestamp;
}

export type Message = TextMessage | FileContextMessage;

export interface GenkitMessage {
    role: 'user' | 'model';
    content: Part[];
}

// Re-exportar Part de genkit si está disponible
export type Part = any; // Ajustar según la definición real de genkit
