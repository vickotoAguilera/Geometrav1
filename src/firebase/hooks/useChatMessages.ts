// Hook para gestionar mensajes del chat en tiempo real

'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { ChatMessage } from '@/types/chat-types';

export function useChatMessages(classroomId: string | null, messageLimit: number = 100) {
    const firestore = useFirestore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!classroomId || !firestore) {
            setMessages([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const messagesRef = collection(firestore, `classrooms/${classroomId}/messages`);
        const q = query(
            messagesRef,
            orderBy('timestamp', 'desc'),
            limit(messageLimit)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const msgs: ChatMessage[] = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    msgs.push({
                        id: doc.id,
                        ...data,
                    } as ChatMessage);
                });

                // Ordenar de más antiguo a más reciente para mostrar
                msgs.reverse();

                setMessages(msgs);
                setIsLoading(false);
            },
            (err) => {
                console.error('Error in chat messages listener:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [classroomId, firestore, messageLimit]);

    return {
        messages,
        isLoading,
        error,
    };
}
