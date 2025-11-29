'use client';

import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, GripVertical } from 'lucide-react';
import type { DragDropExercise as DragDropExerciseType } from '@/types/exercises';
import { validateDragDropOrder, calculateScore } from '@/lib/exercise-validator';

interface SortableItemProps {
    id: string;
    content: string;
    isCorrect?: boolean;
    showFeedback: boolean;
}

function SortableItem({ id, content, isCorrect, showFeedback }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        flex items-center gap-3 p-4 rounded-lg border-2 bg-card
        ${isDragging ? 'shadow-lg cursor-grabbing' : 'cursor-grab'}
        ${showFeedback && isCorrect !== undefined
                    ? isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'border-border hover:border-primary'
                }
      `}
            {...attributes}
            {...listeners}
        >
            <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="flex-1">{content}</span>
            {showFeedback && isCorrect !== undefined && (
                isCorrect ? (
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                    <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                )
            )}
        </div>
    );
}

interface DragDropExerciseProps {
    exercise: DragDropExerciseType;
    onComplete?: (isCorrect: boolean, attempts: number) => void;
}

export default function DragDropExercise({ exercise, onComplete }: DragDropExerciseProps) {
    // Inicializar con items en orden original para evitar error de hidratación
    const [items, setItems] = useState(exercise.items);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [itemFeedback, setItemFeedback] = useState<Record<string, boolean>>({});

    // Mezclar items solo en el cliente después del primer render
    useEffect(() => {
        const shuffled = [...exercise.items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setItems(shuffled);
    }, [exercise.items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            // Ocultar feedback al mover items
            setShowFeedback(false);
        }
    }

    function handleVerify() {
        const userOrder = items.map(item => item.id);
        const result = validateDragDropOrder(exercise.items, userOrder);

        // Crear feedback por item
        const feedback: Record<string, boolean> = {};
        items.forEach((item, index) => {
            feedback[item.id] = item.correctPosition === index;
        });

        setItemFeedback(feedback);
        setShowFeedback(true);
        setIsCorrect(result.isCorrect);
        setAttempts(prev => prev + 1);

        if (onComplete) {
            onComplete(result.isCorrect, attempts + 1);
        }
    }

    function handleReset() {
        // Mezclar de nuevo
        const shuffled = [...exercise.items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setItems(shuffled);
        setShowFeedback(false);
        setItemFeedback({});
    }

    const score = showFeedback
        ? calculateScore(
            Object.values(itemFeedback).filter(Boolean).length,
            items.length
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
                    Arrastra los elementos para ordenarlos correctamente
                </p>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {items.map((item) => (
                                <SortableItem
                                    key={item.id}
                                    id={item.id}
                                    content={item.content}
                                    isCorrect={itemFeedback[item.id]}
                                    showFeedback={showFeedback}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {showFeedback && score !== null && (
                    <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-950' : 'bg-yellow-100 dark:bg-yellow-950'}`}>
                        <p className="font-medium">
                            {isCorrect ? (
                                <span className="text-green-700 dark:text-green-300">
                                    ¡Excelente! Orden correcto 🎉
                                </span>
                            ) : (
                                <span className="text-yellow-700 dark:text-yellow-300">
                                    Puntuación: {score}% - Sigue intentando
                                </span>
                            )}
                        </p>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button onClick={handleVerify} disabled={showFeedback && isCorrect}>
                        Verificar Orden
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                        Reiniciar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
