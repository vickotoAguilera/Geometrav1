// Sistema de enrutamiento de IA híbrido (Groq para texto -> Gemini para visión/fotos y fallback)
import { ai } from '@/ai/genkit';
import Groq from 'groq-sdk';

/**
 * Detecta recursivamente si hay contenido multimedia (imágenes, fotos, capturas) en los parámetros.
 */
function containsMedia(obj: any, depth = 0): boolean {
    if (!obj || depth > 6) return false;
    
    if (typeof obj === 'string') {
        return obj.startsWith('data:image/') || (obj.includes('data:image/') && obj.includes(';base64,'));
    }
    
    if (Array.isArray(obj)) {
        return obj.some(item => containsMedia(item, depth + 1));
    }
    
    if (typeof obj === 'object') {
        if ('media' in obj || 'inlineData' in obj || 'fileData' in obj) {
            return true;
        }
        return Object.values(obj).some(val => containsMedia(val, depth + 1));
    }
    
    return false;
}

/**
 * Extrae texto plano de strings, arrays de partes de Genkit o estructuras anidadas.
 */
function extractTextFromContent(content: any): string {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.map(part => {
            if (typeof part === 'string') return part;
            if (part && typeof part === 'object' && part.text) return part.text;
            return '';
        }).join('\n');
    }
    if (typeof content === 'object' && content.text) return content.text;
    return String(content);
}

/**
 * Convierte los parámetros de Genkit a mensajes estándar compatibles con Groq / OpenAI.
 */
function buildGroqMessages(params: {
    system?: string;
    messages?: any[];
    history?: any[];
    prompt?: string | any[];
}): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const groqMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // 1. Mensaje de Sistema
    if (params.system) {
        groqMessages.push({ role: 'system', content: params.system });
    }

    // 2. Historial previo
    if (params.history && Array.isArray(params.history)) {
        for (const msg of params.history) {
            const role = msg.role === 'model' ? 'assistant' : (msg.role === 'system' ? 'system' : 'user');
            const text = extractTextFromContent(msg.content);
            if (text.trim()) {
                groqMessages.push({ role, content: text });
            }
        }
    }

    // 3. Mensajes en formato conversacional
    if (params.messages && Array.isArray(params.messages)) {
        for (const msg of params.messages) {
            const role = msg.role === 'model' ? 'assistant' : (msg.role === 'system' ? 'system' : 'user');
            const text = extractTextFromContent(msg.content);
            if (text.trim()) {
                groqMessages.push({ role, content: text });
            }
        }
    }

    // 4. Prompt actual del usuario
    if (params.prompt) {
        const text = extractTextFromContent(params.prompt);
        if (text.trim()) {
            groqMessages.push({ role: 'user', content: text });
        }
    }

    return groqMessages;
}

/**
 * Genera contenido con IA:
 * - Si contiene fotos/imágenes: usa directamente Gemini 2.5 Flash (Visión).
 * - Si es texto puro: usa Groq (openai/gpt-oss-120b) con fallback automático a Gemini si falla.
 */
export async function generateWithFallback(params: {
    model?: string;
    prompt?: string | any[];
    system?: string;
    messages?: any[];
    history?: any[];
    output?: any;
    config?: any;
    tools?: any[];
    [key: string]: any; // Permite parámetros adicionales
}) {
    const { model = 'openai/gpt-oss-120b', ...restParams } = params;
    
    // 1. Si el flow pide explícitamente Gemini TTS, enviarlo a Gemini (Groq no genera audio)
    if (model.includes('tts')) {
        return await ai.generate({
            model: 'googleai/gemini-2.5-flash-preview-tts',
            ...restParams,
        });
    }

    // 2. Si la petición incluye fotos / imágenes / capturas, enrutar directamente a Gemini (Groq no soporta visión)
    const hasImages = containsMedia(restParams.prompt) || 
                      containsMedia(restParams.messages) || 
                      containsMedia(restParams.history) || 
                      containsMedia(restParams);

    if (hasImages) {
        console.log('📸 [AI Router] Imagen/Foto detectada -> Enrutando directamente a Gemini Vision (Gemini 3.6 Flash)');
        return await ai.generate({
            model: 'googleai/gemini-3.6-flash',
            ...restParams,
        });
    }

    // 3. Para texto puro: Si GROQ_API_KEY está configurada, usar Groq SDK con gpt-oss-120b
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
        try {
            console.log(`🤖 [AI Router] Generando con Groq (openai/gpt-oss-120b)...`);

            const groq = new Groq({ apiKey: groqKey });
            const isJsonRequired = !!restParams.output?.schema || restParams.output?.format === 'json';
            
            let systemText = restParams.system || '';
            if (isJsonRequired) {
                systemText += "\n\nCRITICAL STRICT INSTRUCTION: You MUST return ONLY a valid raw JSON object matching the requested schema. Do NOT wrap in markdown code blocks like ```json. Do NOT add conversational preamble or postscript.";
            }

            const groqMessages = buildGroqMessages({
                system: systemText,
                history: restParams.history,
                messages: restParams.messages,
                prompt: restParams.prompt,
            });

            // Si por alguna razón no hay mensajes de usuario, añadir un fallback
            if (groqMessages.length === 0) {
                groqMessages.push({ role: 'user', content: 'Continuar' });
            }

            const response = await groq.chat.completions.create({
                model: 'openai/gpt-oss-120b',
                messages: groqMessages,
                temperature: restParams.config?.temperature ?? 0.7,
                max_tokens: restParams.config?.maxOutputTokens ?? 4096,
                response_format: isJsonRequired ? { type: 'json_object' } : undefined,
            });

            const textOutput = response.choices[0]?.message?.content || '';

            // Si se requería JSON, parsearlo para satisfacer el campo .output que esperan los flujos
            let parsedOutput: any = textOutput;
            if (isJsonRequired) {
                try {
                    parsedOutput = JSON.parse(textOutput);
                } catch {
                    // Intentar extraer el bloque JSON con regex
                    const jsonMatch = textOutput.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                    if (jsonMatch) {
                        try {
                            parsedOutput = JSON.parse(jsonMatch[0]);
                        } catch {
                            parsedOutput = { response: textOutput };
                        }
                    } else {
                        parsedOutput = { response: textOutput };
                    }
                }
            }

            return {
                text: textOutput,
                output: parsedOutput,
                rawResponse: response,
            };

        } catch (error: any) {
            console.warn(`⚠️ [AI Router] Fallo en Groq: ${error.message}. Ejecutando fallback automático a Gemini 3.6 Flash...`);
        }
    }

    // 4. Fallback a Gemini (o si no hay GROQ_API_KEY)
    console.log(`📡 [AI Router] Procesando con Gemini 3.6 Flash...`);
    return await ai.generate({
        model: 'googleai/gemini-3.6-flash',
        ...restParams,
    });
}
