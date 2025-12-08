'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';
import { formatPoints } from '@/lib/points-utils';
import Link from 'next/link';

export function PointsBadge() {
    const { user } = useUser();
    const [points, setPoints] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        loadPoints();
    }, [user]);

    async function loadPoints() {
        if (!user) return;

        try {
            const { getUserTotalPoints } = await import('@/app/actions/points');
            const totalPoints = await getUserTotalPoints(user.uid);
            setPoints(totalPoints);
        } catch (error) {
            console.error('Error loading points:', error);
        } finally {
            setLoading(false);
        }
    }

    if (!user || loading) {
        return null;
    }

    return (
        <Link href="/perfil" title="Ver mi perfil">
            <Badge
                variant="secondary"
                className="gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-secondary/80 transition-colors"
            >
                <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                <span className="font-semibold tabular-nums">{formatPoints(points)}</span>
            </Badge>
        </Link>
    );
}
