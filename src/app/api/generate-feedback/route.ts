// API Route para generar retroalimentación con IA

import { NextRequest, NextResponse } from 'next/server';
import { generateExerciseFeedback } from '@/ai/flows/feedback-generator';
import type { DragDropExercise, FillInBlanksExercise } from '@/types/exercises';

type Exercise = DragDropExercise | FillInBlanksExercise;

interface UserAnswer {
    exerciseId: string;
    answer: any;
    isCorrect: boolean;
    timeSpent?: number;
}

export async function POST(request: NextRequest) {
    try {
        const { exercises, userAnswers, subjectName, gradeName } = await request.json();

        if (!exercises || !userAnswers || !subjectName || !gradeName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const feedback = await generateExerciseFeedback(
            exercises as Exercise[],
            userAnswers as UserAnswer[],
            subjectName,
            gradeName
        );

        return NextResponse.json({ feedback });
    } catch (error) {
        console.error('Error generating feedback:', error);
        return NextResponse.json(
            { error: 'Failed to generate feedback' },
            { status: 500 }
        );
    }
}
