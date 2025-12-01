#!/usr/bin/env tsx

/**
 * Script para testear todos los modelos de Gemini disponibles
 * Verifica cuáles funcionan y cuáles tienen rate limit
 */

// Cargar variables de entorno
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { ai } from '../src/ai/genkit';

// Modelos a testear
const MODELS_TO_TEST = [
    'googleai/gemini-2.0-flash-exp',
    'googleai/gemini-1.5-flash',
    'googleai/gemini-1.5-flash-8b',
    'googleai/gemini-1.5-pro',
    'googleai/gemini-pro',
];

// API Keys disponibles
const API_KEYS = [
    { name: 'Key 1 (Principal)', key: process.env.GOOGLE_GENAI_API_KEY },
    { name: 'Key 2 (Respaldo)', key: process.env.GOOGLE_GENAI_API_KEY_2 },
];

async function testModel(modelName: string, apiKey: string, keyName: string) {
    const testPrompt = 'Responde solo con "OK" si puedes leer esto.';

    try {
        console.log(`  🧪 Testing ${modelName} con ${keyName}...`);

        const result = await ai.generate({
            model: modelName,
            prompt: testPrompt,
            config: {
                temperature: 0.1,
                apiKey: apiKey,
            },
        });

        const response = result.text.trim();
        console.log(`  ✅ FUNCIONA - Respuesta: "${response}"`);
        return { success: true, response };
    } catch (error: any) {
        const errorMsg = error.message || String(error);

        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
            console.log(`  ⚠️ RATE LIMIT - Cuota excedida`);
            return { success: false, error: 'RATE_LIMIT' };
        } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            console.log(`  ❌ NO EXISTE - Modelo no disponible`);
            return { success: false, error: 'NOT_FOUND' };
        } else {
            console.log(`  ❌ ERROR - ${errorMsg.substring(0, 100)}`);
            return { success: false, error: errorMsg.substring(0, 100) };
        }
    }
}

async function runTests() {
    console.log('\n' + '='.repeat(70));
    console.log('🧪 TEST DE MODELOS GEMINI Y API KEYS');
    console.log('='.repeat(70) + '\n');

    // Verificar API keys
    console.log('🔑 API Keys Configuradas:');
    API_KEYS.forEach((apiKey, index) => {
        if (apiKey.key) {
            const masked = apiKey.key.substring(0, 10) + '...' + apiKey.key.substring(apiKey.key.length - 4);
            console.log(`  ${index + 1}. ${apiKey.name}: ${masked}`);
        } else {
            console.log(`  ${index + 1}. ${apiKey.name}: ❌ NO CONFIGURADA`);
        }
    });

    console.log('\n' + '-'.repeat(70) + '\n');

    const results: any = {};

    // Testear cada combinación de modelo + API key
    for (const apiKeyInfo of API_KEYS) {
        if (!apiKeyInfo.key) continue;

        console.log(`\n📋 Testeando con ${apiKeyInfo.name}:\n`);

        for (const model of MODELS_TO_TEST) {
            const result = await testModel(model, apiKeyInfo.key, apiKeyInfo.name);

            if (!results[model]) {
                results[model] = {};
            }
            results[model][apiKeyInfo.name] = result;

            // Pausa entre tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Resumen
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE RESULTADOS');
    console.log('='.repeat(70) + '\n');

    const workingModels: string[] = [];
    const rateLimitedModels: string[] = [];
    const notFoundModels: string[] = [];

    for (const model of MODELS_TO_TEST) {
        console.log(`\n🔹 ${model}:`);

        let hasWorking = false;
        let allRateLimit = true;
        let allNotFound = true;

        for (const apiKeyInfo of API_KEYS) {
            if (!apiKeyInfo.key) continue;

            const result = results[model]?.[apiKeyInfo.name];
            if (result) {
                console.log(`   ${apiKeyInfo.name}: ${result.success ? '✅ OK' : '❌ ' + result.error}`);

                if (result.success) {
                    hasWorking = true;
                    allRateLimit = false;
                    allNotFound = false;
                } else if (result.error !== 'RATE_LIMIT') {
                    allRateLimit = false;
                    if (result.error !== 'NOT_FOUND') {
                        allNotFound = false;
                    }
                } else {
                    allNotFound = false;
                }
            }
        }

        if (hasWorking) {
            workingModels.push(model);
        } else if (allNotFound) {
            notFoundModels.push(model);
        } else if (allRateLimit) {
            rateLimitedModels.push(model);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎯 RECOMENDACIONES');
    console.log('='.repeat(70) + '\n');

    if (workingModels.length > 0) {
        console.log('✅ Modelos que FUNCIONAN:');
        workingModels.forEach(model => console.log(`   - ${model}`));
    } else {
        console.log('❌ Ningún modelo funcionó');
    }

    if (rateLimitedModels.length > 0) {
        console.log('\n⚠️ Modelos con RATE LIMIT (esperar ~30 min):');
        rateLimitedModels.forEach(model => console.log(`   - ${model}`));
    }

    if (notFoundModels.length > 0) {
        console.log('\n❌ Modelos NO DISPONIBLES:');
        notFoundModels.forEach(model => console.log(`   - ${model}`));
    }

    if (workingModels.length > 0) {
        console.log('\n💡 USAR: ' + workingModels[0]);
    }

    console.log('\n' + '='.repeat(70) + '\n');
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
