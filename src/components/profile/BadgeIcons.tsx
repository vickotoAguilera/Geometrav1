'use client';

/**
 * Componente para mostrar insignias/badges como iconos con tooltip
 */

import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface BadgeInfo {
    id: string;
    icon: string;
    title: string;
    description: string;
    earnedDate?: Date | { seconds: number };
    color: string; // Clase de color de Tailwind
}

interface BadgeIconsProps {
    badges: BadgeInfo[];
    maxPerRow?: number;
}

export function BadgeIcons({ badges, maxPerRow = 6 }: BadgeIconsProps) {
    const formatDate = (date: Date | { seconds: number } | undefined) => {
        if (!date) return 'Fecha desconocida';

        const dateObj = date instanceof Date ? date : new Date(date.seconds * 1000);

        return dateObj.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <TooltipProvider>
            <div className="flex flex-wrap gap-2 items-center">
                {badges.map((badge) => (
                    <Tooltip key={badge.id} delayDuration={200}>
                        <TooltipTrigger asChild>
                            <button
                                className={cn(
                                    'w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary shadow-md hover:shadow-lg',
                                    badge.color
                                )}
                            >
                                {badge.icon}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent
                            side="bottom"
                            className="max-w-xs p-3"
                            sideOffset={5}
                        >
                            <div className="space-y-1">
                                <p className="font-semibold text-sm">{badge.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {badge.description}
                                </p>
                                {badge.earnedDate && (
                                    <p className="text-xs text-muted-foreground italic pt-1 border-t">
                                        Obtenido: {formatDate(badge.earnedDate)}
                                    </p>
                                )}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}
