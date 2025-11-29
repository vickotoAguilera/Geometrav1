'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/header';
import type { DragDropExercise as DragDropType, FillInBlanksExercise as FillInBlanksType } from '@/types/exercises';

// Importar componentes sin SSR para evitar errores de hidratación con @dnd-kit
const DragDropExercise = dynamic(
    () => import('@/components/exercises/DragDropExercise'),
    { ssr: false }
);

const FillInBlanksExercise = dynamic(
    () => import('@/components/exercises/FillInBlanksExercise'),
    { ssr: false }
);

// Ejemplo 1: Drag & Drop - Ordenar pasos de una ecuación
const dragDropEjemplo: DragDropType = {
    id: 'ordenar-pasos-2x-5',
    type: 'drag-drop',
    title: 'Ordenar pasos: Resolver 2x + 5 = 13',
    description: 'Arrastra los pasos en el orden correcto para resolver la ecuación',
    points: 10,
    difficulty: 'facil',
    items: [
        { id: '1', content: '2x + 5 = 13 (ecuación original)', correctPosition: 0 },
        { id: '2', content: '2x = 13 - 5 (restar 5 a ambos lados)', correctPosition: 1 },
        { id: '3', content: '2x = 8 (simplificar)', correctPosition: 2 },
        { id: '4', content: 'x = 8/2 (dividir por 2)', correctPosition: 3 },
        { id: '5', content: 'x = 4 (solución)', correctPosition: 4 },
    ],
};

// Ejemplo 2: Fill in Blanks - Teorema de Pitágoras
const fillInBlanksEjemplo: FillInBlanksType = {
    id: 'pitagoras-completar',
    type: 'fill-in-blanks',
    title: 'Teorema de Pitágoras',
    description: 'Completa los pasos para calcular la hipotenusa',
    points: 15,
    difficulty: 'medio',
    template: `En un triángulo rectángulo con catetos a=3 y b=4:

a² + b² = c²
[___]² + [___]² = c²
[___] + [___] = c²
[___] = c²
c = [___]`,
    blanks: [
        { id: 'b1', correctAnswer: '3' },
        { id: 'b2', correctAnswer: '4' },
        { id: 'b3', correctAnswer: '9' },
        { id: 'b4', correctAnswer: '16' },
        { id: 'b5', correctAnswer: '25' },
        { id: 'b6', correctAnswer: '5' },
    ],
};

// Ejemplo 3: Drag & Drop - Ordenar operaciones
const dragDropEjemplo2: DragDropType = {
    id: 'orden-operaciones',
    type: 'drag-drop',
    title: 'Orden de Operaciones',
    description: 'Ordena las operaciones según la jerarquía matemática',
    points: 10,
    difficulty: 'facil',
    items: [
        { id: '1', content: 'Paréntesis ( )', correctPosition: 0 },
        { id: '2', content: 'Exponentes x²', correctPosition: 1 },
        { id: '3', content: 'Multiplicación y División ×÷', correctPosition: 2 },
        { id: '4', content: 'Suma y Resta +-', correctPosition: 3 },
    ],
};

export default function EjerciciosEjemplo() {
    function handleComplete(exerciseId: string, isCorrect: boolean, attempts: number) {
        console.log(`Ejercicio ${exerciseId}: ${isCorrect ? 'Correcto' : 'Incorrecto'} en ${attempts} intentos`);
        // Aquí se integraría con el sistema de puntos
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Ejercicios Interactivos</h1>
                    <p className="text-muted-foreground">
                        Ejemplos de ejercicios con verificación automática
                    </p>
                </div>

                <div className="space-y-8">
                    <DragDropExercise
                        exercise={dragDropEjemplo}
                        onComplete={(isCorrect, attempts) => handleComplete(dragDropEjemplo.id, isCorrect, attempts)}
                    />

                    <FillInBlanksExercise
                        exercise={fillInBlanksEjemplo}
                        onComplete={(isCorrect, attempts) => handleComplete(fillInBlanksEjemplo.id, isCorrect, attempts)}
                    />

                    <DragDropExercise
                        exercise={dragDropEjemplo2}
                        onComplete={(isCorrect, attempts) => handleComplete(dragDropEjemplo2.id, isCorrect, attempts)}
                    />
                </div>
            </main>
        </div>
    );
}
