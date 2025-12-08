// Hook para obtener los miembros de un aula en tiempo real

'use client';

import { useEffect, useState } from 'react';
import {
    collection,
    onSnapshot,
    doc,
    getDoc
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { ClassroomMember } from '@/types/classroom-types';

interface ClassroomMembers {
    teachers: ClassroomMember[];
    students: ClassroomMember[];
}

export function useClassroomMembers(classroomId: string | null) {
    const firestore = useFirestore();
    const [members, setMembers] = useState<ClassroomMembers>({ teachers: [], students: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!classroomId || !firestore) {
            setMembers({ teachers: [], students: [] });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Escuchar cambios en profesores
        const teachersRef = collection(firestore, `classrooms/${classroomId}/teachers`);
        const unsubscribeTeachers = onSnapshot(
            teachersRef,
            async (snapshot) => {
                try {
                    const teachersData = await Promise.all(
                        snapshot.docs.map(async (teacherDoc) => {
                            const userId = teacherDoc.id;
                            const membershipData = teacherDoc.data();

                            // Obtener datos del usuario
                            const userRef = doc(firestore, `users/${userId}`);
                            const userDoc = await getDoc(userRef);
                            const userData = userDoc.exists() ? userDoc.data() : null;

                            return {
                                userId,
                                displayName: userData?.displayName || 'Usuario',
                                email: userData?.email || '',
                                photoURL: userData?.photoURL,
                                role: membershipData.role,
                                joinedAt: membershipData.addedAt,
                            } as ClassroomMember;
                        })
                    );

                    setMembers(prev => ({ ...prev, teachers: teachersData }));
                } catch (err) {
                    console.error('Error loading teachers:', err);
                    setError(err instanceof Error ? err : new Error('Error desconocido'));
                }
            },
            (err) => {
                console.error('Error in teachers listener:', err);
                setError(err);
            }
        );

        // Escuchar cambios en alumnos
        const studentsRef = collection(firestore, `classrooms/${classroomId}/students`);
        const unsubscribeStudents = onSnapshot(
            studentsRef,
            async (snapshot) => {
                try {
                    const studentsData = await Promise.all(
                        snapshot.docs.map(async (studentDoc) => {
                            const userId = studentDoc.id;
                            const membershipData = studentDoc.data();

                            // Obtener datos del usuario
                            const userRef = doc(firestore, `users/${userId}`);
                            const userDoc = await getDoc(userRef);
                            const userData = userDoc.exists() ? userDoc.data() : null;

                            return {
                                userId,
                                displayName: userData?.displayName || 'Estudiante',
                                email: userData?.email || '',
                                photoURL: userData?.photoURL,
                                role: 'student' as const,
                                joinedAt: membershipData.enrolledAt,
                                lastActivity: membershipData.lastActivity,
                            } as ClassroomMember;
                        })
                    );

                    setMembers(prev => ({ ...prev, students: studentsData }));
                    setIsLoading(false);
                } catch (err) {
                    console.error('Error loading students:', err);
                    setError(err instanceof Error ? err : new Error('Error desconocido'));
                    setIsLoading(false);
                }
            },
            (err) => {
                console.error('Error in students listener:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        return () => {
            unsubscribeTeachers();
            unsubscribeStudents();
        };
    }, [classroomId, firestore]);

    return { members, isLoading, error };
}
