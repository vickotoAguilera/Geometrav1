// Sistema de enrutamiento de IA híbrido (Groq -> Gemini)
import { ai } from '@/ai/genkit';

/**
 * Genera contenido con IA priorizando Groq Llama 3.3, 
 * con fallback a Gemini 2.5 Flash si ocurre un error (rate limit, etc).
 */
export async function generateWithFallback(params: {
    model: string;
    prompt?: string | any[];
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
        
        // Forzamos Groq como primera opción
        const groqModel = 'groq/llama-3.3-70b-versatile';
        
        // Llama 3.3 necesita instrucciones EXPLÍCITAS para devolver JSON si hay un schema
        let groqParams = { ...restParams };
        if (groqParams.output?.schema) {
            groqParams.output.format = 'json'; // Forzar modo JSON en Genkit
            groqParams.system = (groqParams.system || '') + 
                "\n\nCRITICAL STRICT INSTRUCTION: You MUST return ONLY a valid raw JSON object that strictly matches the requested schema. Do not use markdown wrappers like ```json. Do not add any conversational text outside the JSON object.";
        }

        const result = await ai.generate({
            model: groqModel,
            ...groqParams,
        });

        return result;

    } catch (error: any) {
        console.warn(`⚠️ Error con Groq al devolver JSON o límite excedido. Fallback de emergencia a Gemini 2.5 Flash...`);
        console.error(error.message);

        // Fallback a Gemini (Gemini es nativamente excelente con schemas sin prompt extra)
        return await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            ...restParams,
        });
    }
}
