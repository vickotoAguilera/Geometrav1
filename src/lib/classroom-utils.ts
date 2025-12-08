// Utilidades para el sistema de aulas

'use server';

import { getFirestore } from '@/firebase/server';
import type {
    CreateClassroomData,
    CreateClassroomResult,
    JoinClassroomResult,
    Classroom
} from '@/types/classroom-types';

const firestore = getFirestore();

/**
 * Genera una contraseña única para el aula
 * Formato: 6 caracteres alfanuméricos (sin I, O, 0, 1)
 */
export async function generateClassroomPassword(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let password = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
}

/**
 * Verifica si una contraseña ya existe
 */
async function passwordExists(password: string): Promise<boolean> {
    const snapshot = await firestore
        .collection('classrooms')
        .where('password', '==', password)
        .get();
    return !snapshot.empty;
}

/**
 * Genera una contraseña única (verifica que no exista)
 */
async function generateUniquePassword(): Promise<string> {
    let password = await generateClassroomPassword();
    let attempts = 0;
    const maxAttempts = 10;

    while (await passwordExists(password) && attempts < maxAttempts) {
        password = await generateClassroomPassword();
        attempts++;
    }

    if (attempts >= maxAttempts) {
        throw new Error('No se pudo generar una contraseña única');
    }

    return password;
}

/**
 * Crea un aula nueva
 */
export async function createClassroom(
    data: CreateClassroomData,
    userId: string
): Promise<CreateClassroomResult> {
    try {
        // Generar contraseña única
        const password = await generateUniquePassword();

        // Crear documento del aula
        const classroomRef = firestore.collection('classrooms').doc();
        const classroomId = classroomRef.id;

        const classroomData = {
            name: data.name,
            description: data.description,
            password,
            subject: data.subject,
            grade: data.grade,
            createdBy: userId,
            createdAt: new Date(),
            maxStudents: data.maxStudents || null,
            isActive: true,
        };

        // Usar batch para crear relaciones bidireccionales
        const batch = firestore.batch();

        // 1. Crear aula
        batch.set(classroomRef, classroomData);

        // 2. Agregar profesor como owner en la subcolección del aula
        const teacherInClassroomRef = firestore
            .collection('classrooms')
            .doc(classroomId)
            .collection('teachers')
            .doc(userId);
        batch.set(teacherInClassroomRef, {
            role: 'owner',
            addedAt: new Date(),
            addedBy: userId,
        });

        // 3. Agregar aula en la colección del profesor
        const classroomInTeacherRef = firestore
            .collection('users')
            .doc(userId)
            .collection('teacherClassrooms')
            .doc(classroomId);
        batch.set(classroomInTeacherRef, {
            role: 'owner',
            joinedAt: new Date(),
        });

        await batch.commit();

        return {
            success: true,
            message: 'Aula creada exitosamente',
            classroomId,
            password,
        };
    } catch (error) {
        console.error('Error creating classroom:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al crear el aula',
        };
    }
}

/**
 * Busca un aula por contraseña
 */
export async function getClassroomByPassword(password: string): Promise<Classroom | null> {
    try {
        const snapshot = await firestore
            .collection('classrooms')
            .where('password', '==', password)
            .where('isActive', '==', true)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Classroom;
    } catch (error) {
        console.error('Error finding classroom:', error);
        return null;
    }
}

/**
 * Alumno se une a un aula con contraseña
 */
export async function joinClassroom(
    password: string,
    userId: string
): Promise<JoinClassroomResult> {
    try {
        // Buscar aula por contraseña
        const classroom = await getClassroomByPassword(password);

        if (!classroom) {
            return {
                success: false,
                message: 'Contraseña incorrecta o aula no encontrada',
            };
        }

        const classroomId = classroom.id;

        // Verificar si ya está inscrito
        const studentDoc = await firestore
            .collection('classrooms')
            .doc(classroomId)
            .collection('students')
            .doc(userId)
            .get();

        if (studentDoc.exists) {
            return {
                success: false,
                message: 'Ya estás inscrito en esta aula',
            };
        }

        // Verificar límite de estudiantes
        if (classroom.maxStudents) {
            const studentsSnapshot = await firestore
                .collection('classrooms')
                .doc(classroomId)
                .collection('students')
                .get();

            if (studentsSnapshot.size >= classroom.maxStudents) {
                return {
                    success: false,
                    message: 'El aula ha alcanzado el límite de estudiantes',
                };
            }
        }

        // Usar batch para crear relaciones bidireccionales
        const batch = firestore.batch();

        // 1. Agregar alumno en la subcolección del aula
        const studentRef = firestore
            .collection('classrooms')
            .doc(classroomId)
            .collection('students')
            .doc(userId);
        batch.set(studentRef, {
            enrolledAt: new Date(),
            status: 'active',
            lastActivity: new Date(),
        });

        // 2. Agregar aula en la colección del alumno
        const classroomInStudentRef = firestore
            .collection('users')
            .doc(userId)
            .collection('studentClassrooms')
            .doc(classroomId);
        batch.set(classroomInStudentRef, {
            enrolledAt: new Date(),
            status: 'active',
        });

        await batch.commit();

        return {
            success: true,
            message: 'Te has unido al aula exitosamente',
            classroomId,
        };
    } catch (error) {
        console.error('Error joining classroom:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al unirse al aula',
        };
    }
}

/**
 * Remueve un alumno de un aula
 */
export async function removeStudentFromClassroom(
    classroomId: string,
    studentId: string,
    removedBy: string
): Promise<{ success: boolean; message: string }> {
    try {
        // Verificar que quien remueve sea owner del aula
        const teacherDoc = await firestore
            .collection('classrooms')
            .doc(classroomId)
            .collection('teachers')
            .doc(removedBy)
            .get();

        if (!teacherDoc.exists || teacherDoc.data()?.role !== 'owner') {
            return {
                success: false,
                message: 'No tienes permisos para remover estudiantes',
            };
        }

        // Usar batch para eliminar relaciones bidireccionales
        const batch = firestore.batch();

        // 1. Eliminar de la subcolección del aula
        const studentInClassroomRef = firestore
            .collection('classrooms')
            .doc(classroomId)
            .collection('students')
            .doc(studentId);
        batch.delete(studentInClassroomRef);

        // 2. Eliminar de la colección del alumno
        const classroomInStudentRef = firestore
            .collection('users')
            .doc(studentId)
            .collection('studentClassrooms')
            .doc(classroomId);
        batch.delete(classroomInStudentRef);

        await batch.commit();

        return {
            success: true,
            message: 'Estudiante removido exitosamente',
        };
    } catch (error) {
        console.error('Error removing student:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al remover estudiante',
        };
    }
}

/**
 * Cambia la contraseña de un aula
 */
export async function changeClassroomPassword(
    classroomId: string,
    userId: string
): Promise<{ success: boolean; message: string; newPassword?: string }> {
    try {
        // Verificar que sea owner
        const teacherDoc = await firestore
            .collection('classrooms')
            .doc(classroomId)
            .collection('teachers')
            .doc(userId)
            .get();

        if (!teacherDoc.exists || teacherDoc.data()?.role !== 'owner') {
            return {
                success: false,
                message: 'No tienes permisos para cambiar la contraseña',
            };
        }

        // Generar nueva contraseña
        const newPassword = await generateUniquePassword();

        // Actualizar contraseña
        await firestore
            .collection('classrooms')
            .doc(classroomId)
            .update({ password: newPassword });

        return {
            success: true,
            message: 'Contraseña actualizada exitosamente',
            newPassword,
        };
    } catch (error) {
        console.error('Error changing password:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al cambiar contraseña',
        };
    }
}
