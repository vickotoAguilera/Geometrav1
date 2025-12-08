// Tipos para el sistema de chat del aula

import { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
    id: string;
    classroomId: string;
    userId: string;
    userName: string;
    userRole: 'teacher' | 'student';
    userPhotoURL?: string;
    content: string;
    timestamp: Timestamp;
    attachments?: ChatAttachment[];
    mentions?: string[]; // userIds mencionados
    reactions?: ChatReaction[];
    isPinned: boolean;
    isEdited: boolean;
    editedAt?: Timestamp;
    isDeleted: boolean;
}

export interface ChatAttachment {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'pdf' | 'document' | 'link';
    size?: number;
}

export interface ChatReaction {
    emoji: string;
    userId: string;
    userName: string;
}

export interface TypingIndicator {
    userId: string;
    userName: string;
    timestamp: Timestamp;
}
