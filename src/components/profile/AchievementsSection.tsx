'use client';

/**
 * Sección completa de logros para el perfil del usuario
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award } from 'lucide-react';
import { AchievementCard } from './AchievementCard';
import { getAllAchievementDefinitions, getAchievementsByCategory } from '@/lib/achievements-definitions';
import type { Achievement } from '@/types/user-profile';

interface AchievementsSectionProps {
    achievements: Achievement[];
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
    const allDefinitions = getAllAchievementDefinitions();
    const unlockedCount = achievements.length;
    const totalCount = allDefinitions.length;
    const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

    // Crear un mapa de logros desbloqueados por ID
    const unlockedMap = new Map(achievements.map(achievement => [achievement.id, achievement]));

    const categories = [
        { id: 'all', label: 'Todos', icon: '🏆' },
        { id: 'ejercicios', label: 'Ejercicios', icon: '📚' },
        { id: 'pruebas', label: 'Pruebas', icon: '📝' },
        { id: 'racha', label: 'Racha', icon: '🔥' },
        { id: 'nivel', label: 'Nivel', icon: '⭐' },
        { id: 'especial', label: 'Especial', icon: '💎' },
    ] as const;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Logros
                        </CardTitle>
                        <CardDescription>
                            Desbloquea logros completando desafíos y alcanzando metas
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">
                            {unlockedCount}/{totalCount}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                            {progressPercentage}% completado
                        </Badge>
                    </div>
                </div>

                {/* Barra de Progreso */}
                <div className="mt-4">
                    <div className="w-full bg-secondary rounded-full h-2">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-6 mb-6">
                        {categories.map(category => (
                            <TabsTrigger key={category.id} value={category.id} className="text-xs">
                                <span className="mr-1">{category.icon}</span>
                                <span className="hidden sm:inline">{category.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Todos los logros */}
                    <TabsContent value="all" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allDefinitions.map(definition => (
                                <AchievementCard
                                    key={definition.id}
                                    definition={definition}
                                    unlocked={unlockedMap.get(definition.id)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    {/* Logros por categoría */}
                    {categories.slice(1).map(category => (
                        <TabsContent key={category.id} value={category.id} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {getAchievementsByCategory(category.id as any).map(definition => (
                                    <AchievementCard
                                        key={definition.id}
                                        definition={definition}
                                        unlocked={unlockedMap.get(definition.id)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
