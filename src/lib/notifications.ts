// Funciones para gestionar notificaciones del aula

'use server';

import { getFirestore } from '@/firebase/server';
import { Timestamp } from 'firebase-admin/firestore';
import type { NotificationType } from '@/types/notification-types';

/**
 * Crea una notificación para un usuario
 */
export async function createNotification(
    userId: string,
    classroomId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>
): Promise<{ success: boolean; message: string }> {
    try {
        const firestore = getFirestore();

        await firestore.collection('notifications').add({
            userId,
            classroomId,
            type,
            title,
            message,
            read: false,
            createdAt: Timestamp.now(),
            metadata: metadata || {},
        });

        return {
            success: true,
            message: 'Notificación creada',
        };
    } catch (error) {
        console.error('Error creating notification:', error);
        return {
            success: false,
            message: 'Error al crear notificación',
        };
    }
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(
    notificationId: string
): Promise<{ success: boolean }> {
    try {
        const firestore = getFirestore();

        await firestore.collection('notifications').doc(notificationId).update({
            read: true,
        });

        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false };
    }
}

/**
 * Marca todas las notificaciones de un usuario como leídas
 */
export async function markAllNotificationsAsRead(
    userId: string
): Promise<{ success: boolean }> {
    try {
        const firestore = getFirestore();

        const snapshot = await firestore
            .collection('notifications')
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();

        const batch = firestore.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });

        await batch.commit();

        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false };
    }
}

/**
 * Elimina una notificación
 */
export async function deleteNotification(
    notificationId: string
): Promise<{ success: boolean }> {
    try {
        const firestore = getFirestore();

        await firestore.collection('notifications').doc(notificationId).delete();

        return { success: true };
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false };
    }
}
