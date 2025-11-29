// Ejercicios de ejemplo estáticos (fallback cuando la IA falla)

import type { DragDropExercise, FillInBlanksExercise } from '@/types/exercises';

type Exercise = DragDropExercise | FillInBlanksExercise;

export function getFallbackExercises(subjectId: string, count: number = 20): Exercise[] {
    const exercises: Exercise[] = [];

    // Generar ejercicios de ejemplo basados en la materia
    for (let i = 0; i < count; i++) {
        const exerciseType = i % 2 === 0 ? 'drag-drop' : 'fill-in-blanks';

        if (exerciseType === 'drag-drop') {
            exercises.push({
                id: `${subjectId}-drag-${i}-${Date.now()}`,
                type: 'drag-drop',
                title: `Ordenar pasos - ${subjectId} (${i + 1})`,
                description: 'Ordena los pasos en el orden correcto',
                points: 10,
                difficulty: 'medio',
                items: [
                    { id: '1', content: 'Paso 1: Identificar el problema', correctPosition: 0 },
                    { id: '2', content: 'Paso 2: Aplicar la fórmula', correctPosition: 1 },
                    { id: '3', content: 'Paso 3: Simplificar', correctPosition: 2 },
                    { id: '4', content: 'Paso 4: Verificar resultado', correctPosition: 3 },
                ],
            });
        } else {
            exercises.push({
                id: `${subjectId}-fill-${i}-${Date.now()}`,
                type: 'fill-in-blanks',
                title: `Completar espacios - ${subjectId} (${i + 1})`,
                description: 'Completa los espacios en blanco',
                points: 15,
                difficulty: 'medio',
                template: `Ejercicio de ${subjectId}:\n\nPaso 1: [___]\nPaso 2: [___]\nResultado: [___]`,
                blanks: [
                    { id: 'b1', correctAnswer: 'dato1' },
                    { id: 'b2', correctAnswer: 'dato2' },
                    { id: 'b3', correctAnswer: 'resultado' },
                ],
            });
        }
    }

    return exercises;
}
