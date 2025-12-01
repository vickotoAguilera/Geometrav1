#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testApiKey(keyNumber: number, apiKey: string): Promise<{ number: number; working: boolean; error?: string }> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    try {
        const result = await model.generateContent('Di solo "OK"');
        await result.response.text();
        return { number: keyNumber, working: true };
    } catch (error: any) {
        return {
            number: keyNumber,
            working: false,
            error: error.status === 429 ? 'QUOTA_EXCEEDED' : error.message
        };
    }
}

async function testAllApiKeys() {
    console.log('🔍 Verificando todas las API keys...\n');

    const apiKeys: { number: number; key: string }[] = [];

    // Recopilar todas las API keys del .env.local
    for (let i = 1; i <= 100; i++) {
        const key = process.env[`GOOGLE_GENAI_API_KEY_${i}`];
        if (key) {
            apiKeys.push({ number: i, key });
        }
    }

    console.log(`📊 Total de API keys encontradas: ${apiKeys.length}\n`);
    console.log('━'.repeat(70));
    console.log('Probando cada key (esto puede tardar un poco)...\n');

    const results = [];
    const working = [];
    const quotaExceeded = [];
    const errors = [];

    for (const { number, key } of apiKeys) {
        process.stdout.write(`Testing key #${number}... `);

        const result = await testApiKey(number, key);
        results.push(result);

        if (result.working) {
            console.log('✅ FUNCIONA');
            working.push(number);
        } else if (result.error === 'QUOTA_EXCEEDED') {
            console.log('⚠️  CUOTA EXCEDIDA');
            quotaExceeded.push(number);
        } else {
            console.log('❌ ERROR');
            errors.push({ number, error: result.error });
        }

        // Pequeña pausa entre requests para no saturar
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n' + '━'.repeat(70));
    console.log('\n📊 RESUMEN:\n');

    console.log(`✅ API Keys funcionando: ${working.length}`);
    if (working.length > 0) {
        console.log(`   Keys: ${working.join(', ')}`);
    }
    console.log();

    console.log(`⚠️  API Keys con cuota excedida: ${quotaExceeded.length}`);
    if (quotaExceeded.length > 0) {
        console.log(`   Keys: ${quotaExceeded.join(', ')}`);
    }
    console.log();

    console.log(`❌ API Keys con error: ${errors.length}`);
    if (errors.length > 0) {
        errors.forEach(({ number, error }) => {
            console.log(`   Key #${number}: ${error?.substring(0, 100)}`);
        });
    }
    console.log();

    console.log('━'.repeat(70));

    if (working.length > 0) {
        console.log(`\n💡 Puedes usar las siguientes keys: ${working.join(', ')}`);
    } else {
        console.log('\n⚠️  No hay API keys disponibles en este momento.');
        console.log('   Las cuotas se reinician cada 24 horas.');
    }
    console.log();
}

testAllApiKeys()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
