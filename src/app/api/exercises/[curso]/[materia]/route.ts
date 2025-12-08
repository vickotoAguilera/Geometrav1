import { NextRequest, NextResponse } from 'next/server';
import { getExercisesFromR2 } from '@/app/actions/exercises-r2';

export async function POST(
    request: NextRequest,
    { params }: { params: { curso: string; materia: string } }
) {
    try {
        const { count = 20 } = await request.json();
        const { curso, materia } = params;

        const result = await getExercisesFromR2(curso, materia, count);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in exercises API:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load exercises' },
            { status: 500 }
        );
    }
}
