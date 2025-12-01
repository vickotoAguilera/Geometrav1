'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Lock, Unlock } from 'lucide-react';
import type { ExerciseHint } from '@/types/exercises';

interface HintsPanelProps {
    hints: ExerciseHint[];
    onHintUsed: (level: number, pointsPenalty: number) => void;
}

export default function HintsPanel({ hints, onHintUsed }: HintsPanelProps) {
    const [unlockedHints, setUnlockedHints] = useState<Set<number>>(new Set());

    if (!hints || hints.length === 0) {
        return null;
    }

    const handleUnlockHint = (hint: ExerciseHint) => {
        if (unlockedHints.has(hint.level)) return;

        setUnlockedHints(prev => new Set([...prev, hint.level]));
        onHintUsed(hint.level, hint.pointsPenalty);
    };

    const getHintIcon = (level: number) => {
        if (unlockedHints.has(level)) {
            return <Unlock className="w-4 h-4" />;
        }
        return <Lock className="w-4 h-4" />;
    };

    const getHintColor = (level: number) => {
        if (level === 1) return 'text-green-600 dark:text-green-500';
        if (level === 2) return 'text-yellow-600 dark:text-yellow-500';
        return 'text-orange-600 dark:text-orange-500';
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    ¿Necesitas ayuda?
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {hints.map((hint) => (
                    <div key={hint.level} className="space-y-2">
                        {!unlockedHints.has(hint.level) ? (
                            <Button
                                variant="outline"
                                className="w-full justify-between"
                                onClick={() => handleUnlockHint(hint)}
                            >
                                <span className="flex items-center gap-2">
                                    {getHintIcon(hint.level)}
                                    <span className={getHintColor(hint.level)}>
                                        Pista {hint.level}
                                    </span>
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    -{hint.pointsPenalty} puntos
                                </span>
                            </Button>
                        ) : (
                            <div className="p-4 rounded-lg bg-muted/50 border">
                                <div className="flex items-start gap-2">
                                    <Lightbulb className={`w-4 h-4 mt-0.5 ${getHintColor(hint.level)}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium mb-1">
                                            Pista {hint.level}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {hint.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {unlockedHints.size > 0 && (
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground text-center">
                            Puntos descontados: -{hints
                                .filter(h => unlockedHints.has(h.level))
                                .reduce((sum, h) => sum + h.pointsPenalty, 0)}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
