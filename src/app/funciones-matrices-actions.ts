'use server';

import { 
    funcionesMatricesAssistant, 
    type FuncionesMatricesAssistantInput, 
    type FuncionesMatricesAssistantOutput 
} from '@/ai/flows/funciones-matrices-assistant';
import { textToSpeech } from "@/ai/flows/tts-flow";
import { TextToSpeechOutput } from "@/ai/flows/schemas/tts-schemas";
import fs from 'fs';
import path from 'path';

export async function getFuncionesMatricesAiResponse(
  input: FuncionesMatricesAssistantInput
): Promise<FuncionesMatricesAssistantOutput> {
  return await funcionesMatricesAssistant(input);
}

export async function generateFuncionesMatricesSpeech(text: string): Promise<TextToSpeechOutput> {
    return await textToSpeech(text);
}

export async function getGuiaEjercicio(ejercicioId: string): Promise<{ content: string } | { error: string }> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'content', 'guias-geogebra', `${ejercicioId}.md`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return { content: fileContents };
  } catch (error) {
    console.error(`Error reading guide for ${ejercicioId}:`, error);
    return { error: 'No se pudo cargar el contenido de la guía.' };
  }
}
