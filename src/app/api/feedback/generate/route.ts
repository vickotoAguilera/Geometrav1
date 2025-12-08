import { NextRequest, NextResponse } from 'next/server';
import { generateExerciseFeedback } from '@/ai/flows/retroalimentacion-ejercicios';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { answers, subject, grade } = body;

        const feedback = await generateExerciseFeedback({
            answers,
            subject,
            grade
        });

        return NextResponse.json(feedback);
    } catch (error) {
        console.error('Error generating feedback:', error);
        return NextResponse.json(
            { error: 'Failed to generate feedback' },
            { status: 500 }
        );
    }
}
