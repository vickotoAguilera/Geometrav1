// Hook para obtener las aulas de un profesor en tiempo real

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
import type { ClassroomWithStats } from '@/types/classroom-types';

export function useTeacherClassrooms(userId: string | null) {
    const firestore = useFirestore();
    const [classrooms, setClassrooms] = useState<ClassroomWithStats[]>([]);
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

        // Escuchar cambios en las aulas del profesor
        const teacherClassroomsRef = collection(firestore, `users/${userId}/teacherClassrooms`);

        const unsubscribe = onSnapshot(
            teacherClassroomsRef,
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

                            // Contar profesores
                            const teachersRef = collection(firestore, `classrooms/${classroomId}/teachers`);
                            const teachersSnapshot = await getDocs(teachersRef);
                            const teacherCount = teachersSnapshot.size;

                            // Contar alumnos
                            const studentsRef = collection(firestore, `classrooms/${classroomId}/students`);
                            const studentsSnapshot = await getDocs(studentsRef);
                            const studentCount = studentsSnapshot.size;

                            // Contar alumnos activos
                            const activeStudentCount = studentsSnapshot.docs.filter(
                                doc => doc.data().status === 'active'
                            ).length;

                            return {
                                id: classroomDoc.id,
                                ...classroomDoc.data(),
                                teacherCount,
                                studentCount,
                                activeStudentCount,
                            } as ClassroomWithStats;
                        })
                    );

                    // Filtrar nulls y ordenar por fecha de creación
                    const validClassrooms = classroomsData
                        .filter((c): c is ClassroomWithStats => c !== null)
                        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

                    setClassrooms(validClassrooms);
                    setIsLoading(false);
                } catch (err) {
                    console.error('Error loading teacher classrooms:', err);
                    setError(err instanceof Error ? err : new Error('Error desconocido'));
                    setIsLoading(false);
                }
            },
            (err) => {
                console.error('Error in teacher classrooms listener:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId, firestore]);

    return { classrooms, isLoading, error };
}
