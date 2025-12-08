/**
 * Script para verificar el estado de las API keys de Gemini
 * Verifica cuáles tienen cuota disponible y cuáles están agotadas
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

// Pool de API keys
const API_KEYS = [
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY_2,
    process.env.GOOGLE_GENAI_API_KEY_3,
    process.env.GOOGLE_GENAI_API_KEY_4,
    process.env.GOOGLE_GENAI_API_KEY_5,
    process.env.GOOGLE_GENAI_API_KEY_6,
    process.env.GOOGLE_GENAI_API_KEY_7,
    process.env.GOOGLE_GENAI_API_KEY_8,
    process.env.GOOGLE_GENAI_API_KEY_9,
    process.env.GOOGLE_GENAI_API_KEY_10,
    process.env.GOOGLE_GENAI_API_KEY_11,
    process.env.GOOGLE_GENAI_API_KEY_12,
    process.env.GOOGLE_GENAI_API_KEY_13,
    process.env.GOOGLE_GENAI_API_KEY_14,
    process.env.GOOGLE_GENAI_API_KEY_15,
    process.env.GOOGLE_GENAI_API_KEY_16,
    process.env.GOOGLE_GENAI_API_KEY_17,
    process.env.GOOGLE_GENAI_API_KEY_18,
    process.env.GOOGLE_GENAI_API_KEY_19,
    process.env.GOOGLE_GENAI_API_KEY_20,
    process.env.GOOGLE_GENAI_API_KEY_21,
    process.env.GOOGLE_GENAI_API_KEY_22,
    process.env.GOOGLE_GENAI_API_KEY_23,
    process.env.GOOGLE_GENAI_API_KEY_24,
    process.env.GOOGLE_GENAI_API_KEY_25,
    process.env.GOOGLE_GENAI_API_KEY_26,
    process.env.GOOGLE_GENAI_API_KEY_27,
    process.env.GOOGLE_GENAI_API_KEY_28,
    process.env.GOOGLE_GENAI_API_KEY_29,
    process.env.GOOGLE_GENAI_API_KEY_30,
    process.env.GOOGLE_GENAI_API_KEY_31,
    process.env.GOOGLE_GENAI_API_KEY_32,
    process.env.GOOGLE_GENAI_API_KEY_33,
    process.env.GOOGLE_GENAI_API_KEY_34,
    process.env.GOOGLE_GENAI_API_KEY_35,
    process.env.GOOGLE_GENAI_API_KEY_36,
    process.env.GOOGLE_GENAI_API_KEY_37,
    process.env.GOOGLE_GENAI_API_KEY_38,
    process.env.GOOGLE_GENAI_API_KEY_39,
    process.env.GOOGLE_GENAI_API_KEY_40,
    process.env.GOOGLE_GENAI_API_KEY_41,
    process.env.GOOGLE_GENAI_API_KEY_42,
    process.env.GOOGLE_GENAI_API_KEY_43,
    process.env.GOOGLE_GENAI_API_KEY_44,
    process.env.GOOGLE_GENAI_API_KEY_45,
    process.env.GOOGLE_GENAI_API_KEY_46,
    process.env.GOOGLE_GENAI_API_KEY_47,
    process.env.GOOGLE_GENAI_API_KEY_48,
    process.env.GOOGLE_GENAI_API_KEY_49,
    process.env.GOOGLE_GENAI_API_KEY_50,
].filter(Boolean);

async function testApiKey(apiKey, index) {
    try {
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: 'test' }]
                    }]
                })
            }
        );

        if (response.ok) {
            return { index, status: 'DISPONIBLE', key: apiKey.substring(0, 10) + '...' };
        } else if (response.status === 429) {
            const errorData = await response.json();
            return {
                index,
                status: 'CUOTA AGOTADA',
                key: apiKey.substring(0, 10) + '...',
                error: errorData.error?.message || 'Rate limit exceeded'
            };
        } else {
            return {
                index,
                status: 'ERROR',
                key: apiKey.substring(0, 10) + '...',
                error: `HTTP ${response.status}`
            };
        }
    } catch (error) {
        return {
            index,
            status: 'ERROR',
            key: apiKey.substring(0, 10) + '...',
            error: error.message
        };
    }
}

async function checkAllKeys() {
    console.log('🔍 Verificando estado de las API keys...\n');
    console.log(`Total de keys configuradas: ${API_KEYS.length}\n`);

    const results = [];

    // Verificar keys en lotes de 5 para no saturar
    for (let i = 0; i < API_KEYS.length; i += 5) {
        const batch = API_KEYS.slice(i, i + 5);
        const batchResults = await Promise.all(
            batch.map((key, batchIndex) => testApiKey(key, i + batchIndex + 1))
        );
        results.push(...batchResults);

        // Mostrar progreso
        console.log(`Verificadas ${Math.min(i + 5, API_KEYS.length)}/${API_KEYS.length} keys...`);

        // Pausa entre lotes
        if (i + 5 < API_KEYS.length) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTADOS:\n');

    const disponibles = results.filter(r => r.status === 'DISPONIBLE');
    const agotadas = results.filter(r => r.status === 'CUOTA AGOTADA');
    const errores = results.filter(r => r.status === 'ERROR');

    console.log('✅ KEYS DISPONIBLES:');
    if (disponibles.length > 0) {
        disponibles.forEach(r => {
            console.log(`   Key #${r.index}: ${r.key}`);
        });
        console.log(`\n   Total: ${disponibles.length} keys disponibles`);
    } else {
        console.log('   ❌ No hay keys disponibles');
    }

    console.log('\n⚠️  KEYS CON CUOTA AGOTADA:');
    if (agotadas.length > 0) {
        agotadas.forEach(r => {
            console.log(`   Key #${r.index}: ${r.key}`);
        });
        console.log(`\n   Total: ${agotadas.length} keys agotadas`);
    } else {
        console.log('   ✅ Ninguna key agotada');
    }

    if (errores.length > 0) {
        console.log('\n❌ KEYS CON ERRORES:');
        errores.forEach(r => {
            console.log(`   Key #${r.index}: ${r.key} - ${r.error}`);
        });
        console.log(`\n   Total: ${errores.length} keys con errores`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📋 RESUMEN:');
    console.log(`   Total configuradas: ${API_KEYS.length}`);
    console.log(`   ✅ Disponibles: ${disponibles.length}`);
    console.log(`   ⚠️  Agotadas: ${agotadas.length}`);
    console.log(`   ❌ Con errores: ${errores.length}`);
    console.log('\n' + '='.repeat(80));

    // Guardar resultado en archivo
    const fs = require('fs');
    const reportPath = './api-keys-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        total: API_KEYS.length,
        disponibles: disponibles.map(r => r.index),
        agotadas: agotadas.map(r => r.index),
        errores: errores.map(r => ({ index: r.index, error: r.error })),
        results
    }, null, 2));

    console.log(`\n💾 Reporte guardado en: ${reportPath}\n`);
}

// Ejecutar
checkAllKeys().catch(console.error);
