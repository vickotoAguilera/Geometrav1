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
        console.log('📥 Received feedback generation request');
        const { exercises, userAnswers, subjectName, gradeName } = await request.json();

        console.log('📊 Request data:', {
            exercisesCount: exercises?.length,
            answersCount: userAnswers?.length,
            subjectName,
            gradeName
        });

        if (!exercises || !userAnswers || !subjectName || !gradeName) {
            console.error('❌ Missing required fields');
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        console.log('🤖 Calling generateExerciseFeedback...');
        const feedback = await generateExerciseFeedback(
            exercises as Exercise[],
            userAnswers as UserAnswer[],
            subjectName,
            gradeName
        );

        console.log('✅ Feedback generated successfully');
        return NextResponse.json({ feedback });
    } catch (error) {
        console.error('❌ Error generating feedback:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { error: 'Failed to generate feedback', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
