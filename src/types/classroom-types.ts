// Tipos para el sistema de aulas profesor-alumno

import { Timestamp } from 'firebase/firestore';

// Roles en el aula
export type ClassroomRole = 'owner' | 'assistant' | 'student';

// Estado del alumno
export type StudentStatus = 'active' | 'inactive';

// Información básica del aula
export interface Classroom {
    id: string;
    name: string;
    description: string;
    password: string;
    subject: string;
    grade: string;
    createdBy: string; // userId del profesor creador
    createdAt: Timestamp;
    maxStudents?: number;
    isActive: boolean;
}

// Membresía de profesor en un aula
export interface TeacherMembership {
    userId: string;
    classroomId: string;
    role: 'owner' | 'assistant';
    addedAt: Timestamp;
    addedBy: string; // userId de quien lo agregó
}

// Membresía de alumno en un aula
export interface StudentMembership {
    userId: string;
    classroomId: string;
    enrolledAt: Timestamp;
    status: StudentStatus;
    lastActivity?: Timestamp;
}

// Aula con estadísticas
export interface ClassroomWithStats extends Classroom {
    teacherCount: number;
    studentCount: number;
    activeStudentCount: number;
}

// Miembro del aula con datos de perfil
export interface ClassroomMember {
    userId: string;
    displayName: string;
    email: string;
    photoURL?: string;
    role: ClassroomRole;
    joinedAt: Timestamp;
    lastActivity?: Timestamp;
}

// Datos para crear un aula
export interface CreateClassroomData {
    name: string;
    description: string;
    subject: string;
    grade: string;
    maxStudents?: number;
}

// Resultado de unirse a un aula
export interface JoinClassroomResult {
    success: boolean;
    message: string;
    classroomId?: string;
}

// Resultado de crear un aula
export interface CreateClassroomResult {
    success: boolean;
    message: string;
    classroomId?: string;
    password?: string;
}

// Filtros para listar aulas
export interface ClassroomFilters {
    subject?: string;
    grade?: string;
    isActive?: boolean;
}
