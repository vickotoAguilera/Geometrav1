import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { message, fileContext } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Mensaje requerido' },
                { status: 400 }
            );
        }

        // Llamar a Gemini API
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = fileContext
            ? `Contexto del archivo:\n${fileContext}\n\nPregunta del usuario: ${message}\n\nResponde basándote en el contexto del archivo.`
            : message;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        return NextResponse.json({
            success: true,
            response,
        });

    } catch (error) {
        console.error('❌ Error en test-ai-chat:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Error desconocido',
            },
            { status: 500 }
        );
    }
}
