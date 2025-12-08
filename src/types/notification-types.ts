// Tipos para el sistema de notificaciones

import { Timestamp } from 'firebase/firestore';

export type NotificationType =
    | 'task_assigned'      // Nueva tarea asignada (alumno)
    | 'task_submitted'     // Tarea entregada (profesor)
    | 'task_graded'        // Tarea calificada (alumno)
    | 'message'            // Nuevo mensaje en chat
    | 'material_uploaded'  // Nuevo material disponible
    | 'report_created'     // Nuevo reporte (admin/profesor)
    | 'student_joined'     // Nuevo alumno se unió (profesor)
    | 'announcement';      // Anuncio del profesor

export interface Notification {
    id: string;
    userId: string;
    classroomId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: Timestamp;
    metadata?: {
        taskId?: string;
        messageId?: string;
        materialId?: string;
        reportId?: string;
        studentId?: string;
    };
}

export interface NotificationCount {
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
}
