
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function verifyKeys() {
    console.log('--- Verificando API Keys ---');
    
    // Find all env vars that look like API keys
    const allKeys = Object.keys(process.env).filter(k => k.startsWith('GOOGLE_GENAI_API_KEY'));
    
    if (allKeys.length === 0) {
        console.log('Totalmente vacío. No hay keys para probar.');
        return;
    }

    const results = [];

    for (const keyName of allKeys) {
        const apiKey = process.env[keyName];
        if (!apiKey) continue;

        try {
            // Stronger test: Try to generate content
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Hello' }] }]
                })
            });
            
            if (response.ok) {
                console.log(`✅ ${keyName}: VIVA (Generación exitosa)`);
                results.push({ name: keyName, status: 'ALIVE', key: apiKey });
            } else {
                const data = await response.json().catch(() => ({}));
                console.log(`❌ ${keyName}: MUERTA (${response.status} - ${data.error?.message || 'Error'})`);
                results.push({ name: keyName, status: 'DEAD', key: apiKey });
            }
        } catch (e: any) {
            console.log(`❌ ${keyName}: ERROR DE RED (${e.message})`);
            results.push({ name: keyName, status: 'DEAD', key: apiKey });
        }
    }
}

verifyKeys();
