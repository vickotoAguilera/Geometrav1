/**
 * Funciones utilitarias para el sistema de clases
 */

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp,
    Firestore,
    writeBatch,
} from 'firebase/firestore';
import type {
    Class,
    CreateClassData,
    JoinClassData,
    ClassOperationResult,
    TeacherMembership,
    StudentMembership,
} from '@/types/class-types';

/**
 * Genera un código único de 6 caracteres para una clase
 */
export function generateClassCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos (I, O, 0, 1)
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

/**
 * Verifica si un código de clase ya existe
 */
export async function isCodeUnique(firestore: Firestore, code: string): Promise<boolean> {
    const classesRef = collection(firestore, 'classes');
    const q = query(classesRef, where('code', '==', code));
    const snapshot = await getDocs(q);
    return snapshot.empty;
}

/**
 * Genera un código único verificando que no exista
 */
export async function generateUniqueClassCode(firestore: Firestore): Promise<string> {
    let code = generateClassCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (!(await isCodeUnique(firestore, code)) && attempts < maxAttempts) {
        code = generateClassCode();
        attempts++;
    }

    if (attempts >= maxAttempts) {
        throw new Error('No se pudo generar un código único después de varios intentos');
    }

    return code;
}

/**
 * Crea una nueva clase
 */
export async function createClass(
    firestore: Firestore,
    userId: string,
    data: CreateClassData
): Promise<ClassOperationResult> {
    try {
        // Generar código único
        const code = await generateUniqueClassCode(firestore);

        // Crear ID para la clase
        const classRef = doc(collection(firestore, 'classes'));
        const classId = classRef.id;

        const batch = writeBatch(firestore);

        // Crear documento de clase
        const classData: Omit<Class, 'id'> = {
            name: data.name,
            description: data.description,
            code,
            subject: data.subject,
            grade: data.grade,
            createdBy: userId,
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp,
            maxStudents: data.maxStudents || 0,
            isActive: true,
        };

        batch.set(classRef, classData);

        // Agregar al creador como owner en la subcolección teachers
        const teacherRef = doc(firestore, 'classes', classId, 'teachers', userId);
        const teacherData: Omit<TeacherMembership, 'classId' | 'userId'> = {
            role: 'owner',
            addedAt: serverTimestamp() as Timestamp,
            addedBy: userId,
        };
        batch.set(teacherRef, teacherData);

        // Agregar referencia en el perfil del profesor
        const userClassRef = doc(firestore, 'users', userId, 'teacherClasses', classId);
        batch.set(userClassRef, {
            role: 'owner',
            joinedAt: serverTimestamp() as Timestamp,
        });

        await batch.commit();

        return {
            success: true,
            message: 'Clase creada exitosamente',
            classId,
        };
    } catch (error) {
        console.error('Error creating class:', error);
        return {
            success: false,
            message: 'Error al crear la clase',
            error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Permite a un alumno unirse a una clase mediante código
 */
export async function joinClass(
    firestore: Firestore,
    data: JoinClassData
): Promise<ClassOperationResult> {
    try {
        // Buscar clase por código
        const classesRef = collection(firestore, 'classes');
        const q = query(classesRef, where('code', '==', data.code.toUpperCase()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return {
                success: false,
                message: 'Código de clase inválido',
            };
        }

        const classDoc = snapshot.docs[0];
        const classId = classDoc.id;
        const classData = classDoc.data() as Class;

        // Verificar si la clase está activa
        if (!classData.isActive) {
            return {
                success: false,
                message: 'Esta clase ya no está activa',
            };
        }

        // Verificar si ya es miembro
        const studentRef = doc(firestore, 'classes', classId, 'students', data.userId);
        const studentDoc = await getDoc(studentRef);

        if (studentDoc.exists()) {
            return {
                success: false,
                message: 'Ya eres miembro de esta clase',
            };
        }

        // Verificar límite de estudiantes
        if (classData.maxStudents > 0) {
            const studentsSnapshot = await getDocs(
                collection(firestore, 'classes', classId, 'students')
            );
            if (studentsSnapshot.size >= classData.maxStudents) {
                return {
                    success: false,
                    message: 'La clase ha alcanzado su límite de estudiantes',
                };
            }
        }

        const batch = writeBatch(firestore);

        // Agregar a la subcolección de estudiantes
        const studentData: Omit<StudentMembership, 'classId' | 'userId'> = {
            enrolledAt: serverTimestamp() as Timestamp,
            status: 'active',
        };
        batch.set(studentRef, studentData);

        // Agregar referencia en el perfil del alumno
        const userClassRef = doc(firestore, 'users', data.userId, 'studentClasses', classId);
        batch.set(userClassRef, {
            enrolledAt: serverTimestamp() as Timestamp,
            status: 'active',
        });

        await batch.commit();

        return {
            success: true,
            message: `Te has unido exitosamente a ${classData.name}`,
            classId,
        };
    } catch (error) {
        console.error('Error joining class:', error);
        return {
            success: false,
            message: 'Error al unirse a la clase',
            error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Remueve a un miembro de una clase
 */
export async function removeMemberFromClass(
    firestore: Firestore,
    classId: string,
    userId: string,
    isTeacher: boolean
): Promise<ClassOperationResult> {
    try {
        const batch = writeBatch(firestore);

        if (isTeacher) {
            // Remover de teachers
            const teacherRef = doc(firestore, 'classes', classId, 'teachers', userId);
            batch.delete(teacherRef);

            // Remover de teacherClasses del usuario
            const userClassRef = doc(firestore, 'users', userId, 'teacherClasses', classId);
            batch.delete(userClassRef);
        } else {
            // Remover de students
            const studentRef = doc(firestore, 'classes', classId, 'students', userId);
            batch.delete(studentRef);

            // Remover de studentClasses del usuario
            const userClassRef = doc(firestore, 'users', userId, 'studentClasses', classId);
            batch.delete(userClassRef);
        }

        await batch.commit();

        return {
            success: true,
            message: 'Miembro removido exitosamente',
        };
    } catch (error) {
        console.error('Error removing member:', error);
        return {
            success: false,
            message: 'Error al remover miembro',
            error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Obtiene información de una clase por código
 */
export async function getClassByCode(
    firestore: Firestore,
    code: string
): Promise<(Class & { id: string }) | null> {
    try {
        const classesRef = collection(firestore, 'classes');
        const q = query(classesRef, where('code', '==', code.toUpperCase()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data() as Class,
        };
    } catch (error) {
        console.error('Error getting class by code:', error);
        return null;
    }
}
