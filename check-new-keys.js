/**
 * Script para verificar nuevas API keys con gemini-2.0-flash
 */

const NEW_KEYS = [
    'AIzaSyAICRexJuyAt13JgYCEoRRY7_29AzdXZVs',
    'AIzaSyArhO-1FmzkAh50UkGeZdKMZmjQLQnTO94',
    'AIzaSyCnTWVfxbeHaSO47vshAjBTKiTfemmRnNo',
    'AIzaSyAlvfZA9lA0TpoRRkG2jd9TqVqyD8AmUf0',
    'AIzaSyB1OVYOHV7mExrcObddzzF2UYAiaCD5sIs',
    'AIzaSyAQEj7VTdoKdF5eROrrWGQjsW_bwt8R5GQ',
    'AIzaSyAICRexJuyAt13JgYCEoRRY7_29AzdXZVs', // Duplicada
    'AIzaSyC-jQnB_NldDFRy9lnywBoS22HtuNcAS_U'
];

async function testKeyWithModel(apiKey, index, model) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: 'Hola' }]
                    }]
                })
            }
        );

        if (response.ok) {
            const data = await response.json();
            return {
                index,
                status: 'FUNCIONA ✅',
                model,
                key: apiKey.substring(0, 15) + '...',
                response: data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50) || 'OK'
            };
        } else if (response.status === 429) {
            return {
                index,
                status: 'CUOTA AGOTADA ⚠️',
                model,
                key: apiKey.substring(0, 15) + '...'
            };
        } else {
            const errorData = await response.json().catch(() => ({}));
            return {
                index,
                status: `ERROR ${response.status} ❌`,
                model,
                key: apiKey.substring(0, 15) + '...',
                error: errorData.error?.message || response.statusText
            };
        }
    } catch (error) {
        return {
            index,
            status: 'ERROR ❌',
            model,
            key: apiKey.substring(0, 15) + '...',
            error: error.message
        };
    }
}

async function checkNewKeys() {
    console.log('🔍 Verificando nuevas API keys con gemini-2.0-flash...\n');
    console.log(`Total de keys a verificar: ${NEW_KEYS.length}\n`);

    const results = [];

    for (let i = 0; i < NEW_KEYS.length; i++) {
        console.log(`Verificando key #${i + 1}...`);
        const result = await testKeyWithModel(NEW_KEYS[i], i + 1, 'gemini-2.0-flash');
        results.push(result);

        // Pausa entre requests
        if (i < NEW_KEYS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTADOS CON gemini-2.0-flash:\n');

    results.forEach(r => {
        console.log(`Key #${r.index}: ${r.status}`);
        console.log(`   ${r.key}`);
        if (r.error) {
            console.log(`   Error: ${r.error}`);
        }
        if (r.response && r.status.includes('FUNCIONA')) {
            console.log(`   Respuesta: ${r.response}...`);
        }
        console.log('');
    });

    const funcionan = results.filter(r => r.status.includes('FUNCIONA'));
    const agotadas = results.filter(r => r.status.includes('AGOTADA'));
    const errores = results.filter(r => r.status.includes('ERROR'));

    console.log('='.repeat(80));
    console.log('\n📋 RESUMEN:');
    console.log(`   ✅ Funcionan: ${funcionan.length}`);
    console.log(`   ⚠️  Agotadas: ${agotadas.length}`);
    console.log(`   ❌ Con errores: ${errores.length}`);

    if (funcionan.length > 0) {
        console.log('\n✅ KEYS QUE FUNCIONAN:');
        funcionan.forEach(r => console.log(`   #${r.index}`));
    }

    console.log('\n' + '='.repeat(80));

    // Ahora verificar si las 50 keys antiguas funcionan con gemini-2.0-flash
    console.log('\n🔍 Verificando si las 50 keys antiguas funcionan con gemini-2.0-flash...\n');

    require('dotenv').config({ path: '.env.local' });

    const OLD_KEYS = [
        process.env.GOOGLE_GENAI_API_KEY,
        process.env.GOOGLE_GENAI_API_KEY_2,
        process.env.GOOGLE_GENAI_API_KEY_3,
    ].filter(Boolean);

    console.log(`Probando las primeras 3 keys antiguas como muestra...\n`);

    const oldResults = [];
    for (let i = 0; i < Math.min(3, OLD_KEYS.length); i++) {
        console.log(`Verificando key antigua #${i + 1}...`);
        const result = await testKeyWithModel(OLD_KEYS[i], i + 1, 'gemini-2.0-flash');
        oldResults.push(result);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 RESULTADOS KEYS ANTIGUAS:\n');
    oldResults.forEach(r => {
        console.log(`Key antigua #${r.index}: ${r.status}`);
        if (r.error) {
            console.log(`   Error: ${r.error}`);
        }
        console.log('');
    });

    console.log('='.repeat(80));
}

checkNewKeys().catch(console.error);
