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
import HelpButton from './HelpButton';
import HintModal from './HintModal';
import { generateHintsForExercise, type ExerciseHint, type UserContext } from '@/ai/flows/hints-generator';
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
        setCurrentHintLevel(0);
        setHints([]);
        setTotalPenalty(0);
    }

    async function handleRequestHelp() {
        if (currentHintLevel >= 3) return;

        setIsLoadingHint(true);

        try {
            // Generate hints if not already generated
            if (hints.length === 0) {
                // Pass user context for contextual hints
                const userContext: UserContext = {
                    currentOrder: items.map(item => item.id),
                };

                const generatedHints = await generateHintsForExercise(exercise, userContext);
                setHints(generatedHints);
                setCurrentHintLevel(1);
                setTotalPenalty(generatedHints[0].pointsPenalty);
                setShowHintModal(true);
            } else {
                // Show next hint level
                const nextLevel = currentHintLevel + 1;
                if (nextLevel <= 3) {
                    setCurrentHintLevel(nextLevel);
                    setTotalPenalty(prev => prev + hints[nextLevel - 1].pointsPenalty);
                    setShowHintModal(true);
                }
            }
        } catch (error) {
            console.error('Error generating hints:', error);
        } finally {
            setIsLoadingHint(false);
        }
    }

    function handleShowSolution() {
        // Show correct order
        const sortedItems = [...exercise.items].sort((a, b) => a.correctPosition - b.correctPosition);
        setItems(sortedItems);
        setShowHintModal(false);
        setIsCorrect(false);
        setShowFeedback(true);
        </Card>
    );
}
