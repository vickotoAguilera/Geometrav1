/**
 * Hook personalizado para gestionar el perfil del usuario en Firestore
 */

'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { UserProfile } from '@/types/user-profile';

export function useUserProfile() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user || !firestore) {
            setProfile(null);
            setIsLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const profileRef = doc(firestore, 'users', user.uid, 'profile', 'data');
                const profileSnap = await getDoc(profileRef);

                if (profileSnap.exists()) {
                    setProfile(profileSnap.data() as UserProfile);
                } else {
                    // Crear perfil inicial si no existe
                    const initialProfile: UserProfile = {
                        displayName: user.displayName || 'Usuario',
                        photoURL: user.photoURL || null,
                        bio: '',
                        grade: '',
                        goals: [],
                        preferences: {
                            theme: 'system',
                            notifications: true,
                            emailUpdates: false,
                            learningReminders: true,
                        },
                        role: 'student', // Rol por defecto
                        createdAt: serverTimestamp() as any,
                        updatedAt: serverTimestamp() as any,
                    };

                    await setDoc(profileRef, initialProfile);
                    setProfile(initialProfile);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user, firestore]);

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user || !firestore) {
            throw new Error('Usuario no autenticado');
        }

        try {
            const profileRef = doc(firestore, 'users', user.uid, 'profile', 'data');
            await updateDoc(profileRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });

            // Actualizar estado local
            setProfile(prev => prev ? { ...prev, ...data } : null);
        } catch (err) {
            console.error('Error updating profile:', err);
            throw err;
        }
    };

    return {
        profile,
        isLoading,
        error,
        updateProfile,
    };
}
