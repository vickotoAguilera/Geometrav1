'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { getGradeById } from '@/data/curriculum';
import { getMixedExercisesAction, saveResult } from '@/app/actions/exercises';
import { useAuth } from '@/firebase';
import MixedExerciseCard from '@/components/exercises/MixedExerciseCard';
import ExerciseTimer, { useExerciseTimer } from '@/components/exercises/ExerciseTimer';
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

type Exercise = (DragDropType | FillInBlanksType) & {
    subjectId?: string;
    subjectName?: string;
    subjectIcon?: string;
};

export default function MixtoExercisesPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const gradeId = params.curso as string;
    const grade = getGradeById(gradeId);

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const { timeSpent, handleTimeUpdate, handleComplete: handleTimerComplete, resetTime } = useExerciseTimer();

    useEffect(() => {
        loadExercises();
    }, [gradeId]);

    async function loadExercises() {
        setLoading(true);
        try {
            const result = await getMixedExercisesAction(gradeId, 50);
            if (result.success && result.exercises) {
                setExercises(result.exercises);
            } else {
                console.error('Error loading mixed exercises:', result.error);
            }
        } catch (error) {
            console.error('Error loading mixed exercises:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleComplete(isCorrect: boolean, attempts: number) {
        if (!user || !exercises[currentIndex]) return;

        const exercise = exercises[currentIndex];
        const pointsEarned = isCorrect ? exercise.points : 0;
        const finalTime = handleTimerComplete(timeSpent);

        // Guardar resultado con tiempo
        await saveResult(user.uid, {
            exerciseId: exercise.id,
            userId: user.uid,
            isCorrect,
            attempts,
            timeSpent: finalTime,
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
            resetTime();
        }
    }

    function handlePrevious() {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            resetTime();
        }
    }

    function handleReset() {
        setCurrentIndex(0);
        setCompletedCount(0);
        setTotalPoints(0);
        resetTime();
    }

    if (!grade) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <p>Curso no encontrado</p>
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
                                <Sparkles className="w-8 h-8 text-primary" />
                                Ejercicios Mixtos - {grade.name}
                            </h1>
                            <p className="text-muted-foreground">
                                50 ejercicios combinando todas las materias
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
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">
                            Ejercicio {currentIndex + 1} de {exercises.length}
                        </p>
                        {!loading && exercises.length > 0 && (
                            <ExerciseTimer
                                onTimeUpdate={handleTimeUpdate}
                                autoStart={true}
                                showControls={true}
                            />
                        )}
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Exercise Content */}
                {loading ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                            <span className="text-lg font-medium">Generando ejercicios mixtos con IA...</span>
                            <span className="text-sm text-muted-foreground mt-2">
                                Esto puede tomar unos momentos
                            </span>
                        </CardContent>
                    </Card>
                ) : currentExercise ? (
                    <div className="space-y-4">
                        {/* Subject and Difficulty Badge */}
                        {currentExercise.subjectName && (
                            <MixedExerciseCard
                                subjectName={currentExercise.subjectName}
                                subjectIcon={currentExercise.subjectIcon || '📚'}
                                difficulty={currentExercise.difficulty}
                            />
                        )}

                        {/* Exercise Component */}
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
