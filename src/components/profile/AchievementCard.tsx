'use client';

/**
 * Componente para mostrar una tarjeta de logro individual
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/types/user-profile';
import type { AchievementDefinition } from '@/lib/achievements-definitions';

interface AchievementCardProps {
    definition: AchievementDefinition;
    unlocked?: Achievement;
    className?: string;
}

export function AchievementCard({ definition, unlocked, className }: AchievementCardProps) {
    const isUnlocked = !!unlocked;

    return (
        <Card
            className={cn(
                'relative overflow-hidden transition-all duration-300 hover:scale-105',
                isUnlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-300 dark:border-yellow-700 shadow-lg'
                    : 'bg-muted/50 opacity-60 grayscale',
                className
            )}
        >
            <CardContent className="p-4">
                {/* Icono y Estado */}
                <div className="flex items-start justify-between mb-3">
                    <div
                        className={cn(
                            'text-4xl transition-all duration-300',
                            isUnlocked ? 'animate-bounce-subtle' : ''
                        )}
                    >
                        {definition.icon}
                    </div>
                    {!isUnlocked && (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    {isUnlocked && (
                        <Badge variant="secondary" className="bg-yellow-500 text-white">
                            ✓ Desbloqueado
                        </Badge>
                    )}
                </div>

                {/* Título y Descripción */}
                <div className="space-y-1">
                    <h3
                        className={cn(
                            'font-bold text-lg',
                            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                        )}
                    >
                        {definition.title}
                    </h3>
                    <p
                        className={cn(
                            'text-sm',
                            isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'
                        )}
                    >
                        {definition.description}
                    </p>
                </div>

                {/* Fecha de Desbloqueo */}
                {isUnlocked && unlocked.unlockedAt && (
                    <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-muted-foreground">
                            Desbloqueado el{' '}
                            {new Date(
                                unlocked.unlockedAt.seconds * 1000
                            ).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                )}

                {/* Efecto de brillo para logros desbloqueados */}
                {isUnlocked && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200/50 to-transparent dark:from-yellow-500/30 rounded-bl-full" />
                )}
            </CardContent>
        </Card>
    );
}

// Añadir animación sutil en el CSS global si no existe
