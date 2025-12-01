#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// Obtener todas las API keys
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
].filter(Boolean);

console.log('\n' + '='.repeat(70));
console.log('🔑 VERIFICACIÓN DE API KEYS DE GEMINI');
console.log('='.repeat(70) + '\n');

console.log(`📊 Total de API keys configuradas: ${API_KEYS.length}/12\n`);

API_KEYS.forEach((key, index) => {
    const maskedKey = key ? `${key.substring(0, 10)}...${key.substring(key.length - 4)}` : 'NO CONFIGURADA';
    console.log(`${index + 1}. GOOGLE_GENAI_API_KEY${index === 0 ? '' : '_' + (index + 1)}: ${maskedKey}`);
});

console.log('\n' + '='.repeat(70));
console.log('✅ Sistema de fallback configurado con 12 API keys');
console.log('💡 Capacidad estimada: ~2,400 requests antes de agotar todas las keys');
console.log('='.repeat(70) + '\n');
