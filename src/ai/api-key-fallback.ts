// Sistema de enrutamiento de IA híbrido (Groq -> Gemini)
import { ai } from '@/ai/genkit';

/**
 * Genera contenido con IA priorizando Groq Llama 3.3, 
 * con fallback a Gemini 2.5 Flash si ocurre un error (rate limit, etc).
 */
export async function generateWithFallback(params: {
    model: string;
    prompt?: string;
    system?: string;
    messages?: any[];
    output?: any;
    config?: any;
    tools?: any[];
    [key: string]: any; // Allow any other standard Genkit parameters
}) {
    const { model, ...restParams } = params;
    
    // Si el flow pide explícitamente Gemini TTS, no hacemos fallback a Groq porque Groq no tiene voces.
    if (model.includes('tts')) {
        return await ai.generate({
            model: 'googleai/gemini-2.5-flash-preview-tts',
            ...restParams,
        });
    }

    try {
        console.log(`🤖 Intentando generar con Groq (Llama 3.3)`);
        
        // Forzamos Groq como primera opción en lugar de Gemini
        const groqModel = 'groq/llama-3.3-70b-versatile';
        const result = await ai.generate({
            model: groqModel,
            ...restParams,
        });

        return result;

    } catch (error: any) {
        console.warn(`⚠️ Error con Groq. Fallback de emergencia a Gemini 2.5 Flash...`);
        console.error(error.message);

        // Fallback a Gemini
        return await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            ...restParams,
        });
    }
}
