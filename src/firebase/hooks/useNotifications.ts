// Hook para gestionar notificaciones en tiempo real

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Notification, NotificationCount } from '@/types/notification-types';

export function useNotifications(userId: string | null) {
    const firestore = useFirestore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [count, setCount] = useState<NotificationCount>({
        total: 0,
        unread: 0,
        byType: {} as any,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId || !firestore) {
            setNotifications([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const notificationsRef = collection(firestore, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const notifs: Notification[] = [];
                let unreadCount = 0;
                const byType: Record<string, number> = {};

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const notif: Notification = {
                        id: doc.id,
                        ...data,
                    } as Notification;

                    notifs.push(notif);

                    if (!notif.read) {
                        unreadCount++;
                    }

                    byType[notif.type] = (byType[notif.type] || 0) + 1;
                });

                setNotifications(notifs);
                setCount({
                    total: notifs.length,
                    unread: unreadCount,
                    byType: byType as any,
                });
                setIsLoading(false);
            },
            (err) => {
                console.error('Error in notifications listener:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId, firestore]);

    return {
        notifications,
        count,
        isLoading,
        error,
    };
}
