// Tipos para el sistema de términos y condiciones

import { Timestamp } from 'firebase/firestore';

/**
 * Registro de aceptación de términos y condiciones
 */
export interface UserAgreement {
    userId: string;
    classroomId: string;
    acceptedAt: Timestamp;
    ipAddress?: string;
    version: string; // v1.0, v1.1, etc.
    userAgent?: string;
}

/**
 * Resultado de verificación de aceptación
 */
export interface AgreementCheckResult {
    hasAccepted: boolean;
    needsUpdate: boolean; // Si hay nueva versión de términos
    currentVersion?: string;
    acceptedVersion?: string;
}

/**
 * Datos para crear nueva aceptación
 */
export interface CreateAgreementData {
    userId: string;
    classroomId: string;
    version: string;
    ipAddress?: string;
}
