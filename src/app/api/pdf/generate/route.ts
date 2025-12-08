import { NextRequest, NextResponse } from 'next/server';
import { generateFeedbackPDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { studentName, subject, grade, date, answers, feedback } = body;

        const pdf = generateFeedbackPDF({
            studentName,
            subject,
            grade,
            date: new Date(date),
            answers,
            feedback
        });

        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="retroalimentacion_${subject}_${new Date().toISOString().split('T')[0]}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
