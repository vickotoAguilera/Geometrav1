#!/usr/bin/env tsx

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyC9NoNtYPp75_VWIZblshGbQu_6qZigqII';

async function testApiKey16() {
    console.log('🔍 Probando API Key #16...\n');

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    try {
        // Pregunta 1
        console.log('📝 Pregunta 1: ¿Cuál es la capital de Francia?');
        const result1 = await model.generateContent('¿Cuál es la capital de Francia? Responde en una sola palabra.');
        const response1 = result1.response.text();
        console.log('✅ Respuesta:', response1.trim());
        console.log();

        // Pregunta 2
        console.log('📝 Pregunta 2: ¿Cuánto es 25 + 33?');
        const result2 = await model.generateContent('¿Cuánto es 25 + 33? Responde solo con el número.');
        const response2 = result2.response.text();
        console.log('✅ Respuesta:', response2.trim());
        console.log();

        console.log('✅ API Key #16 funciona correctamente!\n');
        return true;
    } catch (error: any) {
        console.error('❌ Error al usar API Key #16:');
        console.error('   Mensaje:', error.message);
        if (error.status) {
            console.error('   Status:', error.status);
        }
        console.log();
        return false;
    }
}

testApiKey16()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
