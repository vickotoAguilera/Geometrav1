#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { GoogleGenerativeAI } from '@google/generative-ai';

const newKeys = [51, 52, 53, 54, 55, 56];

async function testNewKeys() {
    console.log('🧪 Probando las 6 nuevas API keys...\n');

    let working = 0;
    let failed = 0;

    for (const keyNum of newKeys) {
        const apiKey = process.env[`GOOGLE_GENAI_API_KEY_${keyNum}`];

        if (!apiKey) {
            console.log(`❌ Key #${keyNum}: No encontrada`);
            failed++;
            continue;
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const result = await model.generateContent('Di solo "OK"');
            await result.response.text();

            console.log(`✅ Key #${keyNum}: Funciona correctamente`);
            working++;
        } catch (error: any) {
            if (error.message?.includes('429') || error.message?.includes('quota')) {
                console.log(`⚠️  Key #${keyNum}: Cuota excedida`);
            } else {
                console.log(`❌ Key #${keyNum}: Error - ${error.message?.substring(0, 50)}`);
            }
            failed++;
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Funcionando: ${working}/6`);
    console.log(`   ❌ Con problemas: ${failed}/6`);
}

testNewKeys()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
