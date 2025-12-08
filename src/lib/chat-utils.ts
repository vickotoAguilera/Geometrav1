// Funciones para gestionar el chat del aula

'use server';

import { getFirestore } from '@/firebase/server';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Envía un mensaje al chat del aula
 */
export async function sendChatMessage(
    classroomId: string,
    userId: string,
    userName: string,
    userRole: 'teacher' | 'student',
    content: string,
    userPhotoURL?: string
): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
        const firestore = getFirestore();

        const messageRef = await firestore
            .collection('classrooms')
            .doc(classroomId)
            .collection('messages')
            .add({
                userId,
                userName,
                userRole,
                userPhotoURL: userPhotoURL || null,
                content,
                timestamp: Timestamp.now(),
                attachments: [],
                mentions: [],
                reactions: [],
                isPinned: false,
                isEdited: false,
                isDeleted: false,
            });

        return {
            success: true,
            message: 'Mensaje enviado',
            messageId: messageRef.id,
        };
    } catch (error) {
        console.error('Error sending message:', error);
        return {
            success: false,
            message: 'Error al enviar mensaje',
        };
    }
}

/**
 * Elimina un mensaje del chat
 */
export async function deleteChatMessage(
    classroomId: string,
    messageId: string,
    userId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const firestore = getFirestore();

        const messageRef = firestore
            .collection('classrooms')
            .doc(classroomId)
            .collection('messages')
            .doc(messageId);

        const messageDoc = await messageRef.get();

        if (!messageDoc.exists) {
            return {
                success: false,
                message: 'Mensaje no encontrado',
            };
        }

        const messageData = messageDoc.data();

        // Solo el autor o un profesor puede eliminar
        if (messageData?.userId !== userId && messageData?.userRole !== 'teacher') {
            return {
                success: false,
                message: 'No tienes permiso para eliminar este mensaje',
            };
        }

        await messageRef.update({
            isDeleted: true,
            content: '[Mensaje eliminado]',
        });

        return {
            success: true,
            message: 'Mensaje eliminado',
        };
    } catch (error) {
        console.error('Error deleting message:', error);
        return {
            success: false,
            message: 'Error al eliminar mensaje',
        };
    }
}

/**
 * Fija un mensaje en el chat (solo profesores)
 */
export async function pinChatMessage(
    classroomId: string,
    messageId: string,
    userId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const firestore = getFirestore();

        // Verificar que el usuario es profesor del aula
        const teacherDoc = await firestore
            .collection('classrooms')
            .doc(classroomId)
            .collection('teachers')
            .doc(userId)
            .get();

        if (!teacherDoc.exists) {
            return {
                success: false,
                message: 'Solo los profesores pueden fijar mensajes',
            };
        }

        const messageRef = firestore
            .collection('classrooms')
            .doc(classroomId)
            .collection('messages')
            .doc(messageId);

        await messageRef.update({
            isPinned: true,
        });

        return {
            success: true,
            message: 'Mensaje fijado',
        };
    } catch (error) {
        console.error('Error pinning message:', error);
        return {
            success: false,
            message: 'Error al fijar mensaje',
        };
    }
}
