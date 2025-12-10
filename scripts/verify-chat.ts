
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const result = dotenv.config({ path: envPath });

console.log(`📂 CWD: ${process.cwd()}`);
console.log(`📄 Intentando cargar: ${envPath}`);

if (result.error) {
    console.error('❌ Error cargando .env.local:', result.error);
} else {
    console.log('✅ .env.local cargado sin errores de parseo.');
}

console.log('🔑 Keys encontradas en process.env:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('FIREBASE') || k.includes('API_KEY')));


// Mock Next.js headers/cookies if needed (likely not for this function logic)
// Import the function to test
import { getAiResponse } from '../src/app/actions';

async function testChat() {
    console.log('--- Iniciando Prueba de Chat Local ---');
    console.log('1. Verificando variables de entorno...');
    
    if (!process.env.GOOGLE_GENAI_API_KEY) console.warn('⚠️ Faltan GOOGLE_GENAI_API_KEY');
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) console.warn('⚠️ Faltan FIREBASE_SERVICE_ACCOUNT');
    
    console.log('2. Enviando mensaje de prueba "Hola"...');

    try {
        const response = await getAiResponse(
            "Hola, ¿puedes leerme?", 
            [], 
            'math', 
            undefined, 
            undefined // No files
        );

        console.log('\n✅ ¡ÉXITO! Respuesta recibida:');
        console.log('---------------------------------------------------');
        console.log(response.response);
        console.log('---------------------------------------------------');

    } catch (error: any) {
        console.error('\n❌ ERROR CRÍTICO DETECTADO:');
        console.error(error);
        
        if (error.cause) {
            console.error('Causa:', error.cause);
        }
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
    }
}

testChat();
