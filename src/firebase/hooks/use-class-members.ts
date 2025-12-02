/**
 * Hook para obtener los miembros de una clase
 */

'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { ClassMember } from '@/types/class-types';

export function useClassMembers(classId: string | null) {
    const firestore = useFirestore();
    const [teachers, setTeachers] = useState<ClassMember[]>([]);
    const [students, setStudents] = useState<ClassMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!classId || !firestore) {
            setTeachers([]);
            setStudents([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Listener para profesores
        const teachersRef = collection(firestore, 'classes', classId, 'teachers');
        const unsubscribeTeachers = onSnapshot(
            teachersRef,
            async (snapshot) => {
                try {
                    const teacherPromises = snapshot.docs.map(async (memberDoc) => {
                        const userId = memberDoc.id;
                        const memberData = memberDoc.data();

                        // Obtener datos del usuario
                        const userRef = doc(firestore, 'users', userId);
                        const userDoc = await getDoc(userRef);

                        if (!userDoc.exists()) {
                            return null;
                        }

                        const userData = userDoc.data();
                        const profileRef = doc(firestore, 'users', userId, 'profile', 'data');
                        const profileDoc = await getDoc(profileRef);
                        const profileData = profileDoc.exists() ? profileDoc.data() : {};

                        const member: ClassMember = {
                            userId,
                            displayName: profileData.displayName || userData.displayName || 'Usuario',
                            photoURL: profileData.photoURL || userData.photoURL || null,
                            email: userData.email || '',
                            role: memberData.role,
                            joinedAt: memberData.addedAt,
                        };

                        return member;
                    });

                    const resolvedTeachers = (await Promise.all(teacherPromises)).filter(
                        (t): t is ClassMember => t !== null
                    );

                    setTeachers(resolvedTeachers);
                } catch (err) {
                    console.error('Error fetching teachers:', err);
                    setError(err as Error);
                }
            },
            (err) => {
                console.error('Error in teachers listener:', err);
                setError(err as Error);
            }
        );

        // Listener para estudiantes
        const studentsRef = collection(firestore, 'classes', classId, 'students');
        const unsubscribeStudents = onSnapshot(
            studentsRef,
            async (snapshot) => {
                try {
                    const studentPromises = snapshot.docs.map(async (memberDoc) => {
                        const userId = memberDoc.id;
                        const memberData = memberDoc.data();

                        // Obtener datos del usuario
                        const userRef = doc(firestore, 'users', userId);
                        const userDoc = await getDoc(userRef);

                        if (!userDoc.exists()) {
                            return null;
                        }

                        const userData = userDoc.data();
                        const profileRef = doc(firestore, 'users', userId, 'profile', 'data');
                        const profileDoc = await getDoc(profileRef);
                        const profileData = profileDoc.exists() ? profileDoc.data() : {};

                        const member: ClassMember = {
                            userId,
                            displayName: profileData.displayName || userData.displayName || 'Usuario',
                            photoURL: profileData.photoURL || userData.photoURL || null,
                            email: userData.email || '',
                            role: 'student',
                            joinedAt: memberData.enrolledAt,
                            status: memberData.status,
                        };

                        return member;
                    });

                    const resolvedStudents = (await Promise.all(studentPromises)).filter(
                        (s): s is ClassMember => s !== null
                    );

                    setStudents(resolvedStudents);
                    setError(null);
                } catch (err) {
                    console.error('Error fetching students:', err);
                    setError(err as Error);
                } finally {
                    setIsLoading(false);
                }
            },
            (err) => {
                console.error('Error in students listener:', err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => {
            unsubscribeTeachers();
            unsubscribeStudents();
        };
    }, [classId, firestore]);

    return {
        teachers,
        students,
        allMembers: [...teachers, ...students],
        isLoading,
        error,
    };
}
