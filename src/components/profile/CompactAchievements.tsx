'use client';

/**
 * Componente compacto para mostrar logros como iconos en el perfil
 * Al hacer clic en un icono, se muestra un diálogo con los detalles
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllAchievementDefinitions, getAchievementDefinition } from '@/lib/achievements-definitions';
import type { Achievement } from '@/types/user-profile';
import type { AchievementDefinition } from '@/lib/achievements-definitions';

interface CompactAchievementsProps {
    achievements: Achievement[];
    maxDisplay?: number; // Máximo de logros a mostrar antes de "..."
}

export function CompactAchievements({ achievements, maxDisplay = 8 }: CompactAchievementsProps) {
    const [selectedAchievement, setSelectedAchievement] = useState<{
        definition: AchievementDefinition;
        unlocked?: Achievement;
    } | null>(null);

    const allDefinitions = getAllAchievementDefinitions();
    const unlockedMap = new Map(achievements.map(achievement => [achievement.id, achievement]));

    // Ordenar: primero los desbloqueados, luego los bloqueados
    const sortedDefinitions = [...allDefinitions].sort((a, b) => {
        const aUnlocked = unlockedMap.has(a.id);
        const bUnlocked = unlockedMap.has(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
    });

    const displayedAchievements = sortedDefinitions.slice(0, maxDisplay);
    const remainingCount = sortedDefinitions.length - maxDisplay;
    const unlockedCount = achievements.length;
    const totalCount = allDefinitions.length;

    const handleAchievementClick = (definition: AchievementDefinition) => {
        setSelectedAchievement({
            definition,
            unlocked: unlockedMap.get(definition.id),
        });
    };

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Logros
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                {unlockedCount}/{totalCount} desbloqueados
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {Math.round((unlockedCount / totalCount) * 100)}%
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {displayedAchievements.map(definition => {
                            const isUnlocked = unlockedMap.has(definition.id);
                            return (
                                <button
                                    key={definition.id}
                                    onClick={() => handleAchievementClick(definition)}
                                    className={cn(
                                        'relative w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary',
                                        isUnlocked
                                            ? 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 shadow-md hover:shadow-lg'
                                            : 'bg-muted/50 opacity-40 grayscale hover:opacity-60'
                                    )}
                                    title={definition.title}
                                >
                                    {definition.icon}
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                            <Lock className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    {isUnlocked && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                                            <span className="text-[8px] text-white">✓</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                        {remainingCount > 0 && (
                            <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center text-xs text-muted-foreground font-medium">
                                +{remainingCount}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Detalles */}
            <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
                <DialogContent className="sm:max-w-md">
                    {selectedAchievement && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div
                                        className={cn(
                                            'w-16 h-16 rounded-xl flex items-center justify-center text-4xl',
                                            selectedAchievement.unlocked
                                                ? 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 shadow-lg'
                                                : 'bg-muted/50 opacity-60 grayscale'
                                        )}
                                    >
                                        {selectedAchievement.definition.icon}
                                    </div>
                                    <div className="flex-1">
                                        <DialogTitle className="text-xl">
                                            {selectedAchievement.definition.title}
                                        </DialogTitle>
                                        <Badge
                                            variant={selectedAchievement.unlocked ? 'default' : 'secondary'}
                                            className={cn(
                                                'mt-1',
                                                selectedAchievement.unlocked &&
                                                'bg-green-500 hover:bg-green-600'
                                            )}
                                        >
                                            {selectedAchievement.unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
                                        </Badge>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                        Descripción
                                    </h4>
                                    <DialogDescription className="text-base">
                                        {selectedAchievement.definition.description}
                                    </DialogDescription>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                        Categoría
                                    </h4>
                                    <Badge variant="outline" className="capitalize">
                                        {selectedAchievement.definition.category}
                                    </Badge>
                                </div>

                                {selectedAchievement.unlocked && selectedAchievement.unlocked.unlockedAt && (
                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                            Fecha de desbloqueo
                                        </h4>
                                        <p className="text-sm">
                                            {new Date(
                                                selectedAchievement.unlocked.unlockedAt.seconds * 1000
                                            ).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                )}

                                {!selectedAchievement.unlocked && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-muted-foreground italic">
                                            Sigue practicando para desbloquear este logro
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
