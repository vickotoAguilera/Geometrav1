'use client';

/**
 * Página de evaluación de nivel matemático
 */

import { useState } from 'react';
import { useUser } from '@/firebase';
import { useMathLevel } from '@/firebase/hooks/use-math-level';
import { useProgress } from '@/firebase/hooks/use-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { generateEvaluation, evaluateAnswers } from '@/app/evaluacion-actions';
import type { EvaluationQuestion, UserAnswer } from '@/ai/flows/evaluacion-nivel-flow';
import { getPointsForActivity } from '@/lib/points-system';

export default function EvaluacionPage() {
    const { user } = useUser();
    const { updateMathLevel } = useMathLevel();
    const { addPoints } = useProgress();
    const { toast } = useToast();

    const [isGenerating, setIsGenerating] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<UserAnswer[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleStartEvaluation = async () => {
        if (!user) return;

        try {
            setIsGenerating(true);
            const { test } = await generateEvaluation();
            setQuestions(test.questions);
            setIsGenerating(false);
        } catch (error) {
            console.error('Error generating test:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo generar el test. Inténtalo de nuevo.',
            });
            setIsGenerating(false);
        }
    };

    const handleNext = () => {
        if (!currentAnswer) {
            toast({
                variant: 'destructive',
                title: 'Selecciona una respuesta',
                description: 'Debes seleccionar una opción antes de continuar.',
            });
            return;
        }

        const newAnswers = [
            ...answers,
            {
                questionId: questions[currentQuestion].id,
                userAnswer: currentAnswer,
            },
        ];
        setAnswers(newAnswers);
        setCurrentAnswer('');

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleFinishEvaluation(newAnswers);
        }
    };

    const handleFinishEvaluation = async (finalAnswers: UserAnswer[]) => {
        if (!user) return;

        try {
            setIsEvaluating(true);
            const { result: evalResult } = await evaluateAnswers(questions, finalAnswers);

            // Actualizar nivel matemático en Firestore
            await updateMathLevel({
                overall: evalResult.overall,
                algebra: evalResult.algebra,
                geometry: evalResult.geometry,
                calculus: evalResult.calculus,
                trigonometry: evalResult.trigonometry,
                statistics: evalResult.statistics,
                functions: evalResult.functions,
                evaluationHistory: [],
            });

            // Otorgar puntos por completar evaluación
            const points = getPointsForActivity('evaluacion_inicial');
            await addPoints(points);

            setResult(evalResult);
            setIsComplete(true);
            setIsEvaluating(false);

            toast({
                title: '¡Evaluación completada!',
                description: `Has ganado ${points} puntos.`,
            });
        } catch (error) {
            console.error('Error evaluating:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo evaluar el test. Inténtalo de nuevo.',
            });
            setIsEvaluating(false);
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Evaluación de Nivel</CardTitle>
                        <CardDescription>Inicia sesión para realizar la evaluación</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (isComplete && result) {
        return (
            <div className="container mx-auto p-6 max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/perfil">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Resultados de tu Evaluación</h1>
                        <p className="text-muted-foreground">¡Felicitaciones por completar el test!</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                            Nivel General: {result.overall}/100
                        </CardTitle>
                        <CardDescription>
                            Respondiste correctamente {result.correctAnswers} de {result.questionsAnswered} preguntas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Álgebra</p>
                                <p className="text-2xl font-bold">{result.algebra}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Geometría</p>
                                <p className="text-2xl font-bold">{result.geometry}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cálculo</p>
                                <p className="text-2xl font-bold">{result.calculus}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Trigonometría</p>
                                <p className="text-2xl font-bold">{result.trigonometry}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Estadística</p>
                                <p className="text-2xl font-bold">{result.statistics}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Funciones</p>
                                <p className="text-2xl font-bold">{result.functions}/100</p>
                            </div>
                        </div>

                        {result.strengths.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Tus Fortalezas:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {result.strengths.map((strength: string, idx: number) => (
                                        <li key={idx} className="text-sm">{strength}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.weaknesses.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Áreas a Reforzar:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {result.weaknesses.map((weakness: string, idx: number) => (
                                        <li key={idx} className="text-sm">{weakness}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.recommendations.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Recomendaciones:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {result.recommendations.map((rec: string, idx: number) => (
                                        <li key={idx} className="text-sm">{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Link href="/perfil" className="flex-1">
                                <Button className="w-full">Volver al Perfil</Button>
                            </Link>
                            <Link href="/perfil/mi-tutor" className="flex-1">
                                <Button variant="outline" className="w-full">Ir a Mi Tutor Personal</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (questions.length > 0) {
        const question = questions[currentQuestion];
        const progress = ((currentQuestion + 1) / questions.length) * 100;

        return (
            <div className="container mx-auto p-6 max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/perfil">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Evaluación de Nivel Matemático</h1>
                        <p className="text-sm text-muted-foreground">
                            Pregunta {currentQuestion + 1} de {questions.length}
                        </p>
                    </div>
                </div>

                <Progress value={progress} className="h-2" />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {question.area.charAt(0).toUpperCase() + question.area.slice(1)} - Dificultad {question.difficulty}/10
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-lg">{question.question}</p>

                        <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                            {question.options.map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
                                    <RadioGroupItem value={option} id={`option-${idx}`} />
                                    <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        <Button onClick={handleNext} className="w-full" disabled={isEvaluating}>
                            {isEvaluating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Evaluando...
                                </>
                            ) : currentQuestion < questions.length - 1 ? (
                                'Siguiente Pregunta'
                            ) : (
                                'Finalizar Evaluación'
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/perfil">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Evaluación de Nivel Matemático</h1>
                    <p className="text-muted-foreground">Descubre tu nivel en diferentes áreas de las matemáticas</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>¿Cómo funciona?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        Esta evaluación te ayudará a conocer tu nivel actual en 6 áreas matemáticas:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Álgebra</li>
                        <li>Geometría</li>
                        <li>Cálculo</li>
                        <li>Trigonometría</li>
                        <li>Estadística</li>
                        <li>Funciones</li>
                    </ul>
                    <p>
                        Responderás 24 preguntas (4 por área) con dificultad progresiva. Al finalizar, recibirás:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Tu nivel en cada área (0-100)</li>
                        <li>Identificación de fortalezas y debilidades</li>
                        <li>Recomendaciones personalizadas de estudio</li>
                        <li>30 puntos de experiencia</li>
                    </ul>

                    <Button onClick={handleStartEvaluation} className="w-full" size="lg" disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generando evaluación...
                            </>
                        ) : (
                            'Comenzar Evaluación'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
