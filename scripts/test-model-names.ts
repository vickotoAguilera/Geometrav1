#!/usr/bin/env tsx

/**
 * Test con nombres correctos de modelos Gemini 2.0
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY_2 = process.env.GOOGLE_GENAI_API_KEY_2 || '';

// Nombres correctos para Gemini 2.0 Flash (según documentación oficial)
const MODELS_TO_TEST = [
    'gemini-2.0-flash-001',  // Nombre oficial
    'gemini-2.0-flash-exp',  // Experimental
    'gemini-2.0-flash',      // Sin versión
    'models/gemini-2.0-flash-001',
];

async function testModel(modelName: string) {
    try {
        console.log(`🧪 Probando: ${modelName}`);

        const genAI = new GoogleGenerativeAI(API_KEY_2);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent('Di solo "OK"');
        const response = result.response.text();

        console.log(`✅ FUNCIONA! Respuesta: "${response.trim()}"\n`);
        return true;
    } catch (error: any) {
        const msg = error.message || String(error);

        if (msg.includes('429') || msg.includes('quota')) {
            console.log(`⚠️ RATE LIMIT\n`);
        } else if (msg.includes('404') || msg.includes('not found')) {
            console.log(`❌ NO EXISTE\n`);
        } else {
            console.log(`❌ ERROR: ${msg.substring(0, 100)}\n`);
        }
        return false;
    }
}

async function run() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 BUSCANDO MODELO CORRECTO DE GEMINI 2.0 FLASH');
    console.log('='.repeat(60) + '\n');
    console.log('Usando API Key 2 (la nueva)\n');

    for (const model of MODELS_TO_TEST) {
        const works = await testModel(model);
        if (works) {
            console.log('='.repeat(60));
            console.log(`🎯 MODELO CORRECTO: ${model}`);
            console.log('='.repeat(60) + '\n');
            return;
        }
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('='.repeat(60));
    console.log('❌ Ningún nombre funcionó');
    console.log('='.repeat(60) + '\n');
}

run().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
