/**
 * Hook para gestionar las clases de un profesor
 */

'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Class, ClassWithStats } from '@/types/class-types';

export function useTeacherClasses() {
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

        // Escuchar cambios en teacherClasses del usuario
        const teacherClassesRef = collection(firestore, 'users', user.uid, 'teacherClasses');

        const unsubscribe = onSnapshot(
            teacherClassesRef,
            async (snapshot) => {
                try {
                    const classPromises = snapshot.docs.map(async (membershipDoc) => {
                        const classId = membershipDoc.id;
                        const membership = membershipDoc.data();

                        // Obtener datos de la clase
                        const classRef = doc(firestore, 'classes', classId);
                        const classDoc = await getDoc(classRef);

                        if (!classDoc.exists()) {
                            return null;
                        }

                        const classData = classDoc.data() as Class;

                        // Contar profesores y alumnos
                        const teachersSnapshot = await getDoc(
                            doc(firestore, 'classes', classId, 'teachers', 'count')
                        );
                        const studentsSnapshot = await getDoc(
                            doc(firestore, 'classes', classId, 'students', 'count')
                        );

                        // Obtener conteos reales
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
                            isOwner: membership.role === 'owner',
                            userRole: membership.role,
                        };

                        return classWithStats;
                    });

                    const resolvedClasses = (await Promise.all(classPromises)).filter(
                        (c): c is ClassWithStats => c !== null
                    );

                    setClasses(resolvedClasses);
                    setError(null);
                } catch (err) {
                    console.error('Error fetching teacher classes:', err);
                    setError(err as Error);
                } finally {
                    setIsLoading(false);
                }
            },
            (err) => {
                console.error('Error in teacher classes listener:', err);
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
