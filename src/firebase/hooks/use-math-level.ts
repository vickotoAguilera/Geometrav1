/**
 * Hook personalizado para gestionar el nivel matemático del usuario
 */

'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { MathLevel } from '@/types/user-profile';

export function useMathLevel() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [mathLevel, setMathLevel] = useState<MathLevel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user || !firestore) {
            setMathLevel(null);
            setIsLoading(false);
            return;
        }

        const fetchMathLevel = async () => {
            try {
                setIsLoading(true);
                const mathLevelRef = doc(firestore, 'users', user.uid, 'mathLevel', 'data');
                const mathLevelSnap = await getDoc(mathLevelRef);

                if (mathLevelSnap.exists()) {
                    setMathLevel(mathLevelSnap.data() as MathLevel);
                } else {
                    // Crear nivel inicial (sin evaluar)
                    const initialMathLevel: MathLevel = {
                        overall: 0,
                        algebra: 0,
                        geometry: 0,
                        calculus: 0,
                        trigonometry: 0,
                        statistics: 0,
                        functions: 0,
                        lastEvaluated: serverTimestamp() as any,
                        evaluationHistory: [],
                    };

                    await setDoc(mathLevelRef, initialMathLevel);
                    setMathLevel(initialMathLevel);
                }
            } catch (err) {
                console.error('Error fetching math level:', err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMathLevel();
    }, [user, firestore]);

    const updateMathLevel = async (data: Partial<MathLevel>) => {
        if (!user || !firestore) {
            throw new Error('Usuario no autenticado');
        }

        try {
            const mathLevelRef = doc(firestore, 'users', user.uid, 'mathLevel', 'data');
            await updateDoc(mathLevelRef, {
                ...data,
                lastEvaluated: serverTimestamp(),
            });

            // Actualizar estado local
            setMathLevel(prev => prev ? { ...prev, ...data } : null);
        } catch (err) {
            console.error('Error updating math level:', err);
            throw err;
        }
    };

    return {
        mathLevel,
        isLoading,
        error,
        updateMathLevel,
    };
}
