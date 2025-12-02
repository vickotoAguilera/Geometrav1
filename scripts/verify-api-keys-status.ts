#!/usr/bin/env tsx

/**
 * Script para verificar el estado de todas las API keys de Gemini
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

interface KeyStatus {
    keyNumber: number;
    status: 'working' | 'quota_exceeded' | 'banned' | 'error';
    error?: string;
}

async function testApiKey(keyNumber: number, apiKey: string): Promise<KeyStatus> {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: 'Test' }]
                    }]
                }),
            }
        );

        if (response.ok) {
            return { keyNumber, status: 'working' };
        }

        const errorText = await response.text();

        // Verificar diferentes tipos de errores
        if (response.status === 429 || errorText.includes('RESOURCE_EXHAUSTED')) {
            return { keyNumber, status: 'quota_exceeded', error: 'Quota exceeded' };
        }

        if (response.status === 403 || errorText.includes('API_KEY_INVALID')) {
            return { keyNumber, status: 'banned', error: 'API key invalid or banned' };
        }

        return { keyNumber, status: 'error', error: `HTTP ${response.status}` };
    } catch (error) {
        return { keyNumber, status: 'error', error: String(error) };
    }
}

async function verifyAllKeys() {
    console.log('🔍 Verificando API keys de Gemini...\n');

    const results: KeyStatus[] = [];
    const apiKeys: { num: number; key: string }[] = [];

    // Recolectar todas las API keys
    for (let i = 1; i <= 100; i++) {
        const key = process.env[`GOOGLE_GENAI_API_KEY_${i}`];
        if (key) {
            apiKeys.push({ num: i, key });
        }
    }

    console.log(`📊 Total de API keys encontradas: ${apiKeys.length}\n`);

    // Probar cada key
    for (const { num, key } of apiKeys) {
        process.stdout.write(`Probando key #${num}... `);
        const result = await testApiKey(num, key);
        results.push(result);

        // Mostrar resultado inmediato
        if (result.status === 'working') {
            console.log('✅ Funcionando');
        } else if (result.status === 'quota_exceeded') {
            console.log('⚠️  Cuota excedida');
        } else if (result.status === 'banned') {
            console.log('❌ Baneada/Inválida');
        } else {
            console.log(`❌ Error: ${result.error}`);
        }

        // Pequeño delay para no saturar
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN');
    console.log('='.repeat(60));

    const working = results.filter(r => r.status === 'working');
    const quotaExceeded = results.filter(r => r.status === 'quota_exceeded');
    const banned = results.filter(r => r.status === 'banned');
    const errors = results.filter(r => r.status === 'error');

    console.log(`\n✅ Funcionando: ${working.length}`);
    if (working.length > 0) {
        console.log(`   Keys: ${working.map(r => `#${r.keyNumber}`).join(', ')}`);
    }

    console.log(`\n⚠️  Cuota excedida: ${quotaExceeded.length}`);
    if (quotaExceeded.length > 0) {
        console.log(`   Keys: ${quotaExceeded.map(r => `#${r.keyNumber}`).join(', ')}`);
    }

    console.log(`\n❌ Baneadas/Inválidas: ${banned.length}`);
    if (banned.length > 0) {
        console.log(`   Keys: ${banned.map(r => `#${r.keyNumber}`).join(', ')}`);
        console.log('\n   ⚠️  ACCIÓN REQUERIDA: Estas keys deben ser reemplazadas');
    }

    console.log(`\n❌ Errores: ${errors.length}`);
    if (errors.length > 0) {
        console.log(`   Keys: ${errors.map(r => `#${r.keyNumber}`).join(', ')}`);
    }

    console.log('\n' + '='.repeat(60));

    // Recomendaciones
    if (banned.length > 0) {
        console.log('\n⚠️  RECOMENDACIONES:');
        console.log('1. Eliminar las keys baneadas del .env.local');
        console.log('2. Generar nuevas API keys en https://aistudio.google.com/apikey');
        console.log('3. Agregar las nuevas keys al .env.local');
    }

    if (working.length === 0) {
        console.log('\n❌ CRÍTICO: No hay API keys funcionando!');
        console.log('   El sistema no podrá generar contenido con IA.');
    } else if (working.length < 5) {
        console.log('\n⚠️  ADVERTENCIA: Pocas API keys disponibles.');
        console.log(`   Solo ${working.length} key(s) funcionando. Considera agregar más.`);
    } else {
        console.log(`\n✅ Sistema saludable: ${working.length} API keys disponibles.`);
    }

    console.log('');
}

verifyAllKeys()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
