#!/usr/bin/env tsx

/**
 * Script para probar TODAS las API keys con diferentes modelos de Gemini
 * Identifica qué keys funcionan y con qué modelos
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { ai } from '../src/ai/genkit';

// Modelos a testear
const MODELS_TO_TEST = [
    'googleai/gemini-2.0-flash',
    'googleai/gemini-2.0-flash-exp',
    'googleai/gemini-1.5-flash',
    'googleai/gemini-1.5-flash-8b',
    'googleai/gemini-1.5-pro',
];

// Cargar todas las API keys del .env.local
const API_KEYS: { index: number; key: string }[] = [];

for (let i = 1; i <= 50; i++) {
    const envVar = i === 1 ? 'GOOGLE_GENAI_API_KEY' : `GOOGLE_GENAI_API_KEY_${i}`;
    const key = process.env[envVar];
    if (key) {
        API_KEYS.push({ index: i, key });
    }
}

interface TestResult {
    keyIndex: number;
    model: string;
    status: 'OK' | 'RATE_LIMIT' | 'NOT_FOUND' | 'ERROR';
    error?: string;
    response?: string;
}

async function testKeyWithModel(keyIndex: number, apiKey: string, model: string): Promise<TestResult> {
    const testPrompt = 'Responde solo con "OK"';

    try {
        const result = await ai.generate({
            model,
            prompt: testPrompt,
            config: {
                temperature: 0.1,
                apiKey: apiKey,
            },
        });

        const response = result.text.trim();
        return {
            keyIndex,
            model,
            status: 'OK',
            response,
        };
    } catch (error: any) {
        const errorMsg = error.message || String(error);

        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
            return { keyIndex, model, status: 'RATE_LIMIT' };
        } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            return { keyIndex, model, status: 'NOT_FOUND' };
        } else {
            return { keyIndex, model, status: 'ERROR', error: errorMsg.substring(0, 100) };
        }
    }
}

async function runTests() {
    console.log('\n' + '='.repeat(70));
    console.log('🧪 TEST COMPLETO DE API KEYS Y MODELOS GEMINI');
    console.log('='.repeat(70) + '\n');

    console.log(`🔑 API Keys cargadas: ${API_KEYS.length}`);
    console.log(`🤖 Modelos a probar: ${MODELS_TO_TEST.length}`);
    console.log(`📊 Total de tests: ${API_KEYS.length * MODELS_TO_TEST.length}\n`);

    const results: TestResult[] = [];
    let testsCompleted = 0;
    const totalTests = API_KEYS.length * MODELS_TO_TEST.length;

    // Probar cada key con cada modelo
    for (const { index, key } of API_KEYS) {
        console.log(`\n${'─'.repeat(70)}`);
        console.log(`🔑 API Key ${index}/${API_KEYS.length}: ...${key.substring(key.length - 8)}`);
        console.log(`${'─'.repeat(70)}\n`);

        for (const model of MODELS_TO_TEST) {
            const result = await testKeyWithModel(index, key, model);
            results.push(result);
            testsCompleted++;

            const statusIcon = {
                'OK': '✅',
                'RATE_LIMIT': '⚠️',
                'NOT_FOUND': '❌',
                'ERROR': '🔴',
            }[result.status];

            console.log(`  ${statusIcon} ${model.padEnd(35)} → ${result.status}`);

            // Pausa entre tests para no saturar
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Mostrar progreso
        const progress = ((testsCompleted / totalTests) * 100).toFixed(1);
        console.log(`\n  📊 Progreso: ${testsCompleted}/${totalTests} (${progress}%)`);
    }

    // Análisis de resultados
    console.log('\n' + '='.repeat(70));
    console.log('📊 ANÁLISIS DE RESULTADOS');
    console.log('='.repeat(70) + '\n');

    // Agrupar por modelo
    for (const model of MODELS_TO_TEST) {
        const modelResults = results.filter(r => r.model === model);
        const okCount = modelResults.filter(r => r.status === 'OK').length;
        const rateLimitCount = modelResults.filter(r => r.status === 'RATE_LIMIT').length;
        const notFoundCount = modelResults.filter(r => r.status === 'NOT_FOUND').length;
        const errorCount = modelResults.filter(r => r.status === 'ERROR').length;

        console.log(`\n🤖 ${model}:`);
        console.log(`   ✅ Funcionando: ${okCount}/${API_KEYS.length} keys`);
        console.log(`   ⚠️ Rate Limit: ${rateLimitCount}/${API_KEYS.length} keys`);
        console.log(`   ❌ No encontrado: ${notFoundCount}/${API_KEYS.length} keys`);
        console.log(`   🔴 Error: ${errorCount}/${API_KEYS.length} keys`);
    }

    // Keys que funcionan
    console.log('\n' + '='.repeat(70));
    console.log('✅ API KEYS FUNCIONALES');
    console.log('='.repeat(70) + '\n');

    const workingKeys = new Set<number>();
    results.filter(r => r.status === 'OK').forEach(r => workingKeys.add(r.keyIndex));

    if (workingKeys.size > 0) {
        console.log(`Total de keys funcionales: ${workingKeys.size}/${API_KEYS.length}\n`);
        Array.from(workingKeys).sort((a, b) => a - b).forEach(keyIndex => {
            const keyResults = results.filter(r => r.keyIndex === keyIndex && r.status === 'OK');
            const models = keyResults.map(r => r.model.replace('googleai/', '')).join(', ');
            console.log(`  🔑 Key ${keyIndex}: ${models}`);
        });
    } else {
        console.log('❌ No hay keys funcionales en este momento');
    }

    // Keys con rate limit
    console.log('\n' + '='.repeat(70));
    console.log('⚠️ API KEYS CON RATE LIMIT');
    console.log('='.repeat(70) + '\n');

    const rateLimitKeys = new Set<number>();
    results.filter(r => r.status === 'RATE_LIMIT').forEach(r => rateLimitKeys.add(r.keyIndex));

    if (rateLimitKeys.size > 0) {
        console.log(`Total de keys con rate limit: ${rateLimitKeys.size}/${API_KEYS.length}\n`);
        Array.from(rateLimitKeys).sort((a, b) => a - b).forEach(keyIndex => {
            console.log(`  ⚠️ Key ${keyIndex}`);
        });
        console.log('\n💡 Estas keys pueden funcionar después de ~30 minutos');
    } else {
        console.log('✅ No hay keys con rate limit');
    }

    // Recomendación
    console.log('\n' + '='.repeat(70));
    console.log('💡 RECOMENDACIÓN');
    console.log('='.repeat(70) + '\n');

    // Encontrar el mejor modelo
    const modelScores = MODELS_TO_TEST.map(model => {
        const okCount = results.filter(r => r.model === model && r.status === 'OK').length;
        return { model, okCount };
    }).sort((a, b) => b.okCount - a.okCount);

    if (modelScores[0].okCount > 0) {
        console.log(`🎯 Mejor modelo: ${modelScores[0].model}`);
        console.log(`   ${modelScores[0].okCount} keys funcionales\n`);
    } else {
        console.log('❌ Ningún modelo tiene keys funcionales en este momento');
        console.log('⏰ Espera ~30 minutos y vuelve a intentar\n');
    }

    console.log('='.repeat(70) + '\n');
}

runTests()
    .then(() => {
        console.log('✅ Test completado\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
