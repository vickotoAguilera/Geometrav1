'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ExerciseResults from '@/components/exercises/ExerciseResults';
import type { UserAnswer } from '@/ai/flows/feedback-generator';

export default function TestFeedbackPage() {
    const router = useRouter();
    const [showResults, setShowResults] = useState(false);

    // Datos de prueba
    const testExercises = [
        {
            id: 'test-1',
            type: 'fill-in-blanks' as const,
            title: 'Teorema de Pitágoras',
            description: 'En un triángulo rectángulo, a² + b² = __',
            template: 'En un triángulo rectángulo, a² + b² = __',
            points: 10,
            difficulty: 'medium' as const,
            blanks: [{ id: 'b1', correctAnswer: 'c²', position: 0 }]
        },
        {
            id: 'test-2',
            type: 'drag-drop' as const,
            title: 'Propiedades de los ángulos',
            description: 'Clasifica los siguientes ángulos',
            points: 10,
            difficulty: 'easy' as const,
            items: [
                { id: 'item-1', content: 'Ángulo agudo', category: 'agudo' },
                { id: 'item-2', content: 'Ángulo obtuso', category: 'obtuso' }
            ],
            dropZones: [
                { id: 'zone-1', label: 'Agudos', acceptsCategory: 'agudo' },
                { id: 'zone-2', label: 'Obtusos', acceptsCategory: 'obtuso' }
            ]
        },
        {
            id: 'test-3',
            type: 'fill-in-blanks' as const,
            title: 'Área del círculo',
            description: 'El área de un círculo es __',
            template: 'El área de un círculo es __',
            points: 10,
            difficulty: 'medium' as const,
            blanks: [{ id: 'b1', correctAnswer: 'πr²', position: 0 }]
        }
    ];

    const testUserAnswers: UserAnswer[] = [
        { exerciseId: 'test-1', answer: 'c²', isCorrect: true, timeSpent: 45 },
        { exerciseId: 'test-2', answer: null, isCorrect: false, timeSpent: 30 },
        { exerciseId: 'test-3', answer: 'πr²', isCorrect: true, timeSpent: 25 }
    ];

    function handleRestart() {
        setShowResults(false);
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Inicio
                </Button>

                {!showResults ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>🧪 Test de Retroalimentación con IA</CardTitle>
                            <CardDescription>
                                Prueba el sistema completo de retroalimentación con ejercicios de ejemplo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold">Datos de prueba:</h3>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>3 ejercicios de Geometría (Primero Medio)</li>
                                    <li>2 respuestas correctas, 1 incorrecta</li>
                                    <li>Tasa de éxito: 67%</li>
                                    <li>Incluye retroalimentación con IA</li>
                                    <li>Opción de descargar PDF</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    <strong>📚 Características:</strong>
                                </p>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                                    <li>✅ Resumen de desempeño</li>
                                    <li>✅ Retroalimentación personalizada con IA</li>
                                    <li>✅ Referencias a sección "Estudia"</li>
                                    <li>✅ Mención del Asistente Geometra</li>
                                    <li>✅ Descarga en PDF</li>
                                </ul>
                            </div>

                            <Button
                                onClick={() => setShowResults(true)}
                                className="w-full"
                                size="lg"
                            >
                                Ver Pantalla de Resultados
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <ExerciseResults
                        exercises={testExercises}
                        userAnswers={testUserAnswers}
                        subjectName="Geometría"
                        gradeName="Primero Medio"
                        onRestart={handleRestart}
                    />
                )}
            </main>
        </div>
    );
}
