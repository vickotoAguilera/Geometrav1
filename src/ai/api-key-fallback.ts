// Sistema de fallback de API keys para Gemini

import { ai } from '@/ai/genkit';

// Pool de API keys (52 claves disponibles)
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
].filter(Boolean); // Filtrar claves undefined

let currentKeyIndex = 0;
let failedAttempts = 0;
const MAX_RETRIES = API_KEYS.length;

/**
 * Genera contenido con IA usando fallback de API keys
 */
export async function generateWithFallback(params: {
    model: string;
    prompt: string;
    config?: any;
}) {
    const { model, prompt, config } = params;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            console.log(`🔑 Intentando con API key ${currentKeyIndex + 1}/${API_KEYS.length}`);

            const result = await ai.generate({
                model,
                prompt,
                config: {
                    ...config,
                    // Usar la clave actual
                    apiKey: API_KEYS[currentKeyIndex],
                },
            });

            // Si funciona, resetear contador de fallos
            failedAttempts = 0;
            return result;

        } catch (error: any) {
            const errorMessage = error.message || String(error);

            // Detectar rate limit
            if (errorMessage.includes('429') ||
                errorMessage.includes('quota') ||
                errorMessage.includes('RESOURCE_EXHAUSTED')) {

                console.warn(`⚠️ Rate limit en API key ${currentKeyIndex + 1}`);

                // Cambiar a la siguiente clave
                currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                failedAttempts++;

                if (failedAttempts >= MAX_RETRIES) {
                    console.error('❌ Todas las API keys alcanzaron el límite');
                    throw new Error('All API keys exhausted. Please try again later.');
                }

                // Pequeña pausa antes de reintentar
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            // Si es otro tipo de error, lanzarlo
            throw error;
        }
    }

    throw new Error('Failed to generate content after all retries');
}

/**
 * Obtiene la clave actual en uso
 */
export function getCurrentKeyIndex(): number {
    return currentKeyIndex;
}

/**
 * Resetea manualmente el índice de clave
 */
export function resetKeyIndex(): void {
    currentKeyIndex = 0;
    failedAttempts = 0;
    console.log('🔄 API key index reset');
}

/**
 * Obtiene estadísticas de uso
 */
export function getKeyStats() {
    return {
        totalKeys: API_KEYS.length,
        currentKey: currentKeyIndex + 1,
        failedAttempts,
        availableKeys: API_KEYS.length - failedAttempts,
    };
}
