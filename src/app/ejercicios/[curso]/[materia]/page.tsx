'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { getSubjectById } from '@/data/curriculum';
import { getExercises, saveResult } from '@/app/actions/exercises';
import { useAuth } from '@/firebase';
import type { DragDropExercise as DragDropType, FillInBlanksExercise as FillInBlanksType } from '@/types/exercises';

// Importar componentes sin SSR
const DragDropExercise = dynamic(
    () => import('@/components/exercises/DragDropExercise'),
    { ssr: false }
);

const FillInBlanksExercise = dynamic(
    () => import('@/components/exercises/FillInBlanksExercise'),
    { ssr: false }
);

type Exercise = DragDropType | FillInBlanksType;

export default function MateriaExercisesPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const gradeId = params.curso as string;
    const subjectId = params.materia as string;

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);

    const subject = getSubjectById(gradeId, subjectId);

    useEffect(() => {
        loadExercises();
    }, [gradeId, subjectId]);

    async function loadExercises() {
        setLoading(true);
        try {
            const result = await getExercises(gradeId, subjectId, 20);
            if (result.success && result.exercises) {
                setExercises(result.exercises);
            } else {
                console.error('Error loading exercises:', result.error);
            }
        } catch (error) {
            console.error('Error loading exercises:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleComplete(isCorrect: boolean, attempts: number) {
        if (!user || !exercises[currentIndex]) return;

        const exercise = exercises[currentIndex];
        const pointsEarned = isCorrect ? exercise.points : 0;

        // Guardar resultado
        await saveResult(user.uid, {
            exerciseId: exercise.id,
            userId: user.uid,
            isCorrect,
            attempts,
            timeSpent: 0, // TODO: implementar timer
            pointsEarned,
            completedAt: new Date(),
        });

        if (isCorrect) {
            setCompletedCount(prev => prev + 1);
            setTotalPoints(prev => prev + pointsEarned);
        }
    }

    function handleNext() {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }

    function handlePrevious() {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }

    function handleReset() {
        setCurrentIndex(0);
        setCompletedCount(0);
        setTotalPoints(0);
    }

    if (!subject) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <p>Materia no encontrada</p>
                </main>
            </div>
        );
    }

    const currentExercise = exercises[currentIndex];
    const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/ejercicios')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Ejercicios
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span className="text-4xl">{subject.icon}</span>
                                {subject.name}
                            </h1>
                            <p className="text-muted-foreground">
                                {subject.description}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Progreso</p>
                            <p className="text-2xl font-bold">
                                {completedCount}/{exercises.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {totalPoints} puntos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                        Ejercicio {currentIndex + 1} de {exercises.length}
                    </p>
                </div>

                {/* Exercise Content */}
                {loading ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="ml-2">Generando ejercicios con IA...</span>
                        </CardContent>
                    </Card>
                ) : currentExercise ? (
                    <div className="space-y-4">
                        {currentExercise.type === 'drag-drop' ? (
                            <DragDropExercise
                                exercise={currentExercise as DragDropType}
                                onComplete={handleComplete}
                            />
                        ) : (
                            <FillInBlanksExercise
                                exercise={currentExercise as FillInBlanksType}
                                onComplete={handleComplete}
                            />
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between items-center">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Anterior
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleReset}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reiniciar
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={currentIndex === exercises.length - 1}
                            >
                                Siguiente
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-muted-foreground">No hay ejercicios disponibles</p>
                            <Button onClick={loadExercises} className="mt-4">
                                Generar Ejercicios
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
