'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import type { FillInBlanksExercise as FillInBlanksExerciseType } from '@/types/exercises';
import { validateFillInBlanks, calculateScore } from '@/lib/exercise-validator';
import { FeedbackPopup } from './FeedbackPopup';
    function handleInputChange(blankId: string, value: string) {
        setUserAnswers(prev => ({
            ...prev,
            [blankId]: value,
        }));
        // Ocultar feedback al escribir
        if (showFeedback) {
            setShowFeedback(false);
        }
    }

    function handleVerify() {
        const result = validateFillInBlanks(exercise.blanks, userAnswers);

        setValidationResults(result.results);
        setShowFeedback(true);
        setIsCorrect(result.isCorrect);
        setAttempts(prev => prev + 1);

        if (onComplete) {
            onComplete(result.isCorrect, attempts + 1);
        }
    }

    function handleReset() {
        setUserAnswers({});
        setShowFeedback(false);
        setValidationResults({});
    }



                                        )
                                    )}
                                </span>
                            );
                        }
                    })}
                </div>

                {showFeedback && score !== null && (
                    <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-950' : 'bg-yellow-100 dark:bg-yellow-950'}`}>
                        <p className="font-medium">
                            {isCorrect ? (
                                <span className="text-green-700 dark:text-green-300">
                                    ¡Perfecto! Todas las respuestas son correctas 🎉
                                </span>
                            ) : (
                                <span className="text-yellow-700 dark:text-yellow-300">
                                    Puntuación: {score}% - Revisa las respuestas marcadas en rojo
                                </span>
                            )}
                        </p>
                    </div>
                )}

                <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleVerify} disabled={showFeedback && isCorrect}>
                        Verificar Respuestas
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                        Reiniciar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
