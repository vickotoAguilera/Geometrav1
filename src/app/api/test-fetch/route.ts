// Test simple para verificar si el problema es con fetch en el servidor
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    console.log('🧪 Testing fetch availability in server...');

    try {
        // Test 1: Check if fetch exists
        console.log('1. fetch exists:', typeof fetch !== 'undefined');

        // Test 2: Check environment variables
        const apiKey = process.env.GOOGLE_GENAI_API_KEY;
        console.log('2. API key exists:', !!apiKey);
        console.log('3. API key length:', apiKey?.length || 0);

        // Test 3: Try a simple fetch
        if (apiKey) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Say hello'
                        }]
                    }]
                })
            });

            console.log('4. Fetch response status:', response.status);

            const data = await response.json();
            console.log('5. Response data:', JSON.stringify(data).substring(0, 200));

            return NextResponse.json({
                success: true,
                status: response.status,
                hasResponse: !!data.candidates
            });
        }

        return NextResponse.json({ error: 'No API key' }, { status: 500 });
    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
