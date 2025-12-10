/**
 * Sistema centralizado de rotación de API keys para Google Gemini
 * Usado por todos los procesadores (PDF, imágenes, etc.)
 */

import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Pool de API keys disponibles (hasta 50 keys)
export const API_KEYS = [
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
    // Agrega más según necesites...
    process.env.GOOGLE_GENAI_API_KEY_30,
    process.env.GOOGLE_GENAI_API_KEY_40,
    process.env.GOOGLE_GENAI_API_KEY_50,
].filter(Boolean) as string[]; // Filtra automáticamente las que no existen

let currentKeyIndex = 0;

/**
 * Obtiene la siguiente API key disponible (rotación circular)
 */
function getNextApiKey(): string {
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
}

/**
 * Obtiene una API key (para usar directamente con fetch)
 */
export async function getApiKey(): Promise<string> {
    return getNextApiKey();
}

/**
 * Procesa una operación con fallback automático a otras API keys si falla por cuota
 * @param operation - Función que recibe fileManager y genAI y retorna una Promise
 * @returns Resultado de la operación
 */
export async function processWithApiKeyFallback<T>(
    operation: (fileManager: GoogleAIFileManager, genAI: GoogleGenerativeAI) => Promise<T>
): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < API_KEYS.length; i++) {
        const apiKey = getNextApiKey();
        const fileManager = new GoogleAIFileManager(apiKey);
        const genAI = new GoogleGenerativeAI(apiKey);

        try {
            console.log(`🔑 Procesando con API key ${i + 1}/${API_KEYS.length}`);
            return await operation(fileManager, genAI);
        } catch (error) {
            lastError = error as Error;
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Si es error de cuota (429) o sobrecarga (503), probar con la siguiente key
            if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exhausted') || 
                errorMessage.includes('503') || errorMessage.includes('overloaded')) {
                console.log(`⚠️ API Key ${i + 1} falló (cuota o sobrecarga), probando con la siguiente...`);
                continue;
            }

            // Si es otro tipo de error, lanzarlo inmediatamente
            throw error;
        }
    }

    // Si llegamos aquí, todas las keys fallaron
    throw new Error(`Todas las API keys agotadas. Último error: ${lastError?.message}`);
}

/**
 * Obtiene una instancia de GoogleGenerativeAI con la siguiente API key disponible
 */
function getGeminiInstance(): GoogleGenerativeAI {
    return new GoogleGenerativeAI(getNextApiKey());
}

/**
 * Resetea el índice de API keys (útil para testing)
 */
function resetKeyIndex(): void {
    currentKeyIndex = 0;
}

/**
 * Obtiene estadísticas de uso de API keys
 */
function getKeyStats() {
    return {
        totalKeys: API_KEYS.length,
        currentKeyIndex: currentKeyIndex + 1,
    };
}
