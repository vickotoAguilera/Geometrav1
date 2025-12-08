// Hook para obtener las aulas de un alumno en tiempo real

'use client';

import { useEffect, useState } from 'react';
import {
    collection,
    query,
    onSnapshot,
    doc,
    getDoc,
    getDocs
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Classroom } from '@/types/classroom-types';

interface StudentClassroom extends Classroom {
    teacherName: string;
    teacherEmail: string;
    studentCount: number;
}

export function useStudentClassrooms(userId: string | null) {
    const firestore = useFirestore();
    const [classrooms, setClassrooms] = useState<StudentClassroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId || !firestore) {
            setClassrooms([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Escuchar cambios en las aulas del alumno
        const studentClassroomsRef = collection(firestore, `users/${userId}/studentClassrooms`);

        const unsubscribe = onSnapshot(
            studentClassroomsRef,
            async (snapshot) => {
                try {
                    const classroomIds = snapshot.docs.map(doc => doc.id);

                    if (classroomIds.length === 0) {
                        setClassrooms([]);
                        setIsLoading(false);
                        return;
                    }

                    // Obtener datos completos de cada aula
                    const classroomsData = await Promise.all(
                        classroomIds.map(async (classroomId) => {
                            // Obtener datos del aula
                            const classroomRef = doc(firestore, `classrooms/${classroomId}`);
                            const classroomDoc = await getDoc(classroomRef);

                            if (!classroomDoc.exists()) return null;

                            const classroomData = classroomDoc.data();

                            // Obtener datos del profesor creador
                            const teacherRef = doc(firestore, `users/${classroomData.createdBy}`);
                            const teacherDoc = await getDoc(teacherRef);
                            const teacherData = teacherDoc.exists() ? teacherDoc.data() : null;

                            // Contar alumnos
                            const studentsRef = collection(firestore, `classrooms/${classroomId}/students`);
                            const studentsSnapshot = await getDocs(studentsRef);
                            const studentCount = studentsSnapshot.size;

                            return {
                                id: classroomDoc.id,
                                ...classroomData,
                                teacherName: teacherData?.displayName || 'Profesor',
                                teacherEmail: teacherData?.email || '',
                                studentCount,
                            } as StudentClassroom;
                        })
                    );

                    // Filtrar nulls y ordenar por fecha de inscripción
                    const validClassrooms = classroomsData
                        .filter((c): c is StudentClassroom => c !== null)
                        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

                    setClassrooms(validClassrooms);
                    setIsLoading(false);
                } catch (err) {
                    console.error('Error loading student classrooms:', err);
                    setError(err instanceof Error ? err : new Error('Error desconocido'));
                    setIsLoading(false);
                }
            },
            (err) => {
                console.error('Error in student classrooms listener:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId, firestore]);

    return { classrooms, isLoading, error };
}
