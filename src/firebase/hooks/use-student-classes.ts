/**
 * Hook para gestionar las clases de un alumno
 */

'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Class, ClassWithStats } from '@/types/class-types';

export function useStudentClasses() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [classes, setClasses] = useState<ClassWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user || !firestore) {
            setClasses([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Escuchar cambios en studentClasses del usuario
        const studentClassesRef = collection(firestore, 'users', user.uid, 'studentClasses');

        const unsubscribe = onSnapshot(
            studentClassesRef,
            async (snapshot) => {
                try {
                    const classPromises = snapshot.docs.map(async (membershipDoc) => {
                        const classId = membershipDoc.id;
                        const membership = membershipDoc.data();

                        // Solo mostrar clases activas
                        if (membership.status !== 'active') {
                            return null;
                        }

                        // Obtener datos de la clase
                        const classRef = doc(firestore, 'classes', classId);
                        const classDoc = await getDoc(classRef);

                        if (!classDoc.exists()) {
                            return null;
                        }

                        const classData = classDoc.data() as Class;

                        // Obtener conteos de miembros
                        const teachersRef = collection(firestore, 'classes', classId, 'teachers');
                        const studentsRef = collection(firestore, 'classes', classId, 'students');

                        const [teachersSnap, studentsSnap] = await Promise.all([
                            getDoc(doc(teachersRef, '_count')),
                            getDoc(doc(studentsRef, '_count')),
                        ]);

                        const classWithStats: ClassWithStats = {
                            id: classId,
                            ...classData,
                            teacherCount: teachersSnap.exists() ? teachersSnap.data().count : 0,
                            studentCount: studentsSnap.exists() ? studentsSnap.data().count : 0,
                            userRole: 'student',
                        };

                        return classWithStats;
                    });

                    const resolvedClasses = (await Promise.all(classPromises)).filter(
                        (c): c is ClassWithStats => c !== null
                    );

                    setClasses(resolvedClasses);
                    setError(null);
                } catch (err) {
                    console.error('Error fetching student classes:', err);
                    setError(err as Error);
                } finally {
                    setIsLoading(false);
                }
            },
            (err) => {
                console.error('Error in student classes listener:', err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, firestore]);

    return {
        classes,
        isLoading,
        error,
    };
}
