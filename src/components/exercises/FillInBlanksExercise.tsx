'use client';

<<<<<<< HEAD
import { useState, useMemo } from 'react';
=======
import { useState, useMemo, useEffect } from 'react';
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import type { FillInBlanksExercise as FillInBlanksExerciseType } from '@/types/exercises';
import { validateFillInBlanks, calculateScore } from '@/lib/exercise-validator';
<<<<<<< HEAD
import { FeedbackPopup } from './FeedbackPopup';
=======
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636

interface ParsedSegment {
    type: 'text' | 'blank';
    content: string;
    blankId?: string;
}

function parseTemplate(template: string, blanks: FillInBlanksExerciseType['blanks']): ParsedSegment[] {
    const segments: ParsedSegment[] = [];
    const parts = template.split(/(\[___\])/g);

    let blankIndex = 0;
    for (const part of parts) {
        if (part === '[___]') {
            if (blankIndex < blanks.length) {
                segments.push({
                    type: 'blank',
                    content: '',
                    blankId: blanks[blankIndex].id,
                });
                blankIndex++;
            }
        } else if (part) {
            segments.push({
                type: 'text',
                content: part,
            });
        }
    }

    return segments;
}

interface FillInBlanksExerciseProps {
    exercise: FillInBlanksExerciseType;
    onComplete?: (isCorrect: boolean, attempts: number) => void;
}

export default function FillInBlanksExercise({ exercise, onComplete }: FillInBlanksExerciseProps) {
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});
    const [isCorrect, setIsCorrect] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const segments = useMemo(
        () => parseTemplate(exercise.template, exercise.blanks),
        [exercise.template, exercise.blanks]
    );

<<<<<<< HEAD
=======
    // Reset state when exercise changes
    useEffect(() => {
        setUserAnswers({});
        setShowFeedback(false);
        setValidationResults({});
        setIsCorrect(false);
        setAttempts(0);
    }, [exercise.id]);

>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
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

<<<<<<< HEAD


=======
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
    const score = showFeedback
        ? calculateScore(
            Object.values(validationResults).filter(Boolean).length,
            exercise.blanks.length
        )
        : null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                        Dificultad: <span className="font-medium capitalize">{exercise.difficulty}</span>
                    </span>
                    <span className="text-muted-foreground">
                        Puntos: <span className="font-medium">{exercise.points}</span>
                    </span>
                    {attempts > 0 && (
                        <span className="text-muted-foreground">
                            Intentos: <span className="font-medium">{attempts}</span>
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Completa los espacios en blanco con las respuestas correctas
                </p>

                <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm leading-relaxed">
                    {segments.map((segment, index) => {
                        if (segment.type === 'text') {
                            return (
                                <span key={index} className="whitespace-pre-wrap">
                                    {segment.content}
                                </span>
                            );
                        } else {
                            const blankId = segment.blankId!;
                            const isCorrectAnswer = validationResults[blankId];
                            const value = userAnswers[blankId] || '';

                            return (
                                <span key={index} className="inline-flex items-center gap-1">
                                    <Input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleInputChange(blankId, e.target.value)}
                                        className={`
                      inline-block w-24 h-8 px-2 text-center font-mono
                      ${showFeedback
                                                ? isCorrectAnswer
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                                    : 'border-red-500 bg-red-50 dark:bg-red-950'
                                                : ''
                                            }
                    `}
                                        placeholder="___"
                                    />
                                    {showFeedback && (
                                        isCorrectAnswer ? (
                                            <Check className="w-4 h-4 text-green-600 inline-block" />
                                        ) : (
<<<<<<< HEAD
                                            <div className="inline-flex items-center gap-1">
                                                <X className="w-4 h-4 text-red-600 inline-block" />
                                                <FeedbackPopup
                                                    blankId={blankId}
                                                    userAnswer={value}
                                                    correctAnswer={exercise.blanks.find(b => b.id === blankId)?.correctAnswer || ''}
                                                    isCorrect={isCorrectAnswer}
                                                />
                                            </div>
=======
                                            <X className="w-4 h-4 text-red-600 inline-block" />
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
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

<<<<<<< HEAD
                <div className="flex gap-2 flex-wrap">
=======
                <div className="flex gap-2">
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
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
