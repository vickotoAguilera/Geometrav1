#!/usr/bin/env tsx

/**
 * Test de modelos Gemini con nombres alternativos
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY_1 = process.env.GOOGLE_GENAI_API_KEY || '';
const API_KEY_2 = process.env.GOOGLE_GENAI_API_KEY_2 || '';

// Modelos a testear (nombres directos de Google AI)
const MODELS = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
];

async function testWithDirectAPI(modelName: string, apiKey: string, keyName: string) {
    try {
        console.log(`  🧪 ${modelName} con ${keyName}...`);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent('Responde solo "OK"');
        const response = result.response.text();

        console.log(`  ✅ FUNCIONA - "${response.trim()}"`);
        return true;
    } catch (error: any) {
        const msg = error.message || String(error);

        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
            console.log(`  ⚠️ RATE LIMIT`);
        } else if (msg.includes('404') || msg.includes('not found') || msg.includes('models/')) {
            console.log(`  ❌ NO EXISTE`);
        } else {
            console.log(`  ❌ ERROR: ${msg.substring(0, 80)}`);
        }
        return false;
    }
}

async function run() {
    console.log('\n' + '='.repeat(70));
    console.log('🧪 TEST DIRECTO DE MODELOS GEMINI');
    console.log('='.repeat(70) + '\n');

    const workingModels: string[] = [];

    console.log('📋 Testeando con API Key 1:\n');
    for (const model of MODELS) {
        const works = await testWithDirectAPI(model, API_KEY_1, 'Key 1');
        if (works) workingModels.push(model);
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n📋 Testeando con API Key 2:\n');
    for (const model of MODELS) {
        const works = await testWithDirectAPI(model, API_KEY_2, 'Key 2');
        if (works && !workingModels.includes(model)) {
            workingModels.push(model + ' (solo Key 2)');
        }
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎯 MODELOS QUE FUNCIONAN:');
    console.log('='.repeat(70) + '\n');

    if (workingModels.length > 0) {
        workingModels.forEach(m => console.log(`  ✅ ${m}`));
        console.log(`\n💡 RECOMENDACIÓN: Usar "${workingModels[0]}"`);
    } else {
        console.log('  ❌ Ningún modelo disponible en este momento');
        console.log('  ⏳ Esperar ~30-60 minutos para que se resetee el rate limit');
    }

    console.log('\n' + '='.repeat(70) + '\n');
}

run().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
