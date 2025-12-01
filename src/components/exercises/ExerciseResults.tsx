'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, CheckCircle2, XCircle } from 'lucide-react';
import type { DragDropExercise, FillInBlanksExercise } from '@/types/exercises';
import type { UserAnswer } from '@/ai/flows/feedback-generator';

type Exercise = DragDropExercise | FillInBlanksExercise;

interface ExerciseResultsProps {
    exercises: Exercise[];
    userAnswers: UserAnswer[];
    subjectName: string;
    gradeName: string;
    onRestart: () => void;
}

export default function ExerciseResults({
    exercises,
    userAnswers,
    subjectName,
    gradeName,
    onRestart
}: ExerciseResultsProps) {
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const totalCount = exercises.length;
    const successRate = Math.round((correctCount / totalCount) * 100);

    async function generateFeedback() {
        setGenerating(true);
        try {
            const { generateExerciseFeedback } = await import('@/ai/flows/feedback-generator');
            const feedbackText = await generateExerciseFeedback(
                exercises,
                userAnswers,
                subjectName,
                gradeName
            );
            setFeedback(feedbackText);
        } catch (error) {
            console.error('Error generating feedback:', error);
            setFeedback('No se pudo generar la retroalimentación. Por favor, intenta nuevamente.');
        } finally {
            setGenerating(false);
        }
    }

    async function downloadPDF() {
        if (!feedback) return;

        setLoading(true);
        try {
            const { generateFeedbackPDF } = await import('@/lib/pdf-generator');
            generateFeedbackPDF(
                feedback,
                exercises,
                userAnswers,
                {
                    subjectName,
                    gradeName,
                }
            );
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('No se pudo generar el PDF. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Resumen de Resultados */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">🎉 ¡Ejercicios Completados!</CardTitle>
                    <CardDescription>
                        Has terminado todos los ejercicios de {subjectName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-3xl font-bold">{totalCount}</p>
                            <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {correctCount}
                            </p>
                            <p className="text-sm text-muted-foreground">Correctas</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {successRate}%
                            </p>
                            <p className="text-sm text-muted-foreground">Éxito</p>
                        </div>
                    </div>

                    {/* Lista de Ejercicios */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">Detalle por Ejercicio:</h3>
                        <div className="space-y-1">
                            {exercises.map((ex, i) => (
                                <div
                                    key={ex.id}
                                    className="flex items-center justify-between p-2 rounded bg-muted/50"
                                >
                                    <span className="text-sm">
                                        {i + 1}. {ex.title || ex.description}
                                    </span>
                                    {userAnswers[i]?.isCorrect ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Retroalimentación con IA */}
            <Card>
                <CardHeader>
                    <CardTitle>📊 Retroalimentación Personalizada</CardTitle>
                    <CardDescription>
                        Análisis generado por IA sobre tu desempeño
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!feedback ? (
                        <Button
                            onClick={generateFeedback}
                            disabled={generating}
                            className="w-full"
                            size="lg"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generando retroalimentación...
                                </>
                            ) : (
                                'Generar Retroalimentación con IA'
                            )}
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                                    {feedback}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={downloadPDF}
                                    disabled={loading}
                                    variant="default"
                                    className="flex-1"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generando PDF...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Descargar PDF
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => generateFeedback()}
                                    variant="outline"
                                    disabled={generating}
                                >
                                    Regenerar
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex gap-4">
                <Button onClick={onRestart} variant="outline" className="flex-1">
                    Reiniciar Ejercicios
                </Button>
            </div>
        </div>
    );
}
