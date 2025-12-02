/**
 * Tipos TypeScript para el sistema de clases (relación profesor-alumno)
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Roles disponibles en una clase
 */
export type ClassRole = 'owner' | 'assistant' | 'student';

/**
 * Estado de membresía en una clase
 */
export type MembershipStatus = 'active' | 'inactive' | 'pending';

/**
 * Información básica de una clase
 */
export interface Class {
    id: string;
    name: string;
    description: string;
    code: string; // Código único de 6 caracteres
    subject: string; // Materia (ej: "Matemáticas", "Geometría")
    grade: string; // Curso (ej: "1° Medio", "2° Medio")
    createdBy: string; // userId del profesor creador
    createdAt: Timestamp;
    updatedAt: Timestamp;
    maxStudents: number; // Límite de alumnos (0 = sin límite)
    isActive: boolean;
}

/**
 * Relación de un profesor con una clase
 */
export interface TeacherMembership {
    classId: string;
    userId: string;
    role: 'owner' | 'assistant';
    addedAt: Timestamp;
    addedBy: string; // userId de quien lo agregó
}

/**
 * Relación de un alumno con una clase
 */
export interface StudentMembership {
    classId: string;
    userId: string;
    enrolledAt: Timestamp;
    status: MembershipStatus;
}

/**
 * Datos completos de una clase con contadores
 */
export interface ClassWithStats extends Class {
    teacherCount: number;
    studentCount: number;
    isOwner?: boolean; // Si el usuario actual es owner
    userRole?: ClassRole; // Rol del usuario actual en esta clase
}

/**
 * Miembro de una clase (profesor o alumno)
 */
export interface ClassMember {
    userId: string;
    displayName: string;
    photoURL: string | null;
    email: string;
    role: ClassRole;
    joinedAt: Timestamp;
    status?: MembershipStatus; // Solo para estudiantes
}

/**
 * Invitación a una clase
 */
export interface ClassInvitation {
    id: string;
    classId: string;
    className: string;
    invitedBy: string; // userId del profesor
    invitedByName: string;
    invitedEmail: string;
    role: ClassRole;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    createdAt: Timestamp;
    expiresAt: Timestamp;
}

/**
 * Datos para crear una nueva clase
 */
export interface CreateClassData {
    name: string;
    description: string;
    subject: string;
    grade: string;
    maxStudents: number;
}

/**
 * Datos para unirse a una clase
 */
export interface JoinClassData {
    code: string;
    userId: string;
}

/**
 * Resultado de operaciones con clases
 */
export interface ClassOperationResult {
    success: boolean;
    message: string;
    classId?: string;
    error?: string;
}
