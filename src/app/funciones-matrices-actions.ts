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
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

export async function getFuncionesMatricesAiResponse(
  input: FuncionesMatricesAssistantInput
): Promise<FuncionesMatricesAssistantOutput> {
  return await funcionesMatricesAssistant(input);
}

export async function generateFuncionesMatricesSpeech(text: string): Promise<TextToSpeechOutput> {
    return await textToSpeech(text);
}

export async function getGuiaEjercicio(ejercicioId: string): Promise<{ content: string; htmlContent: string } | { error: string }> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'content', 'guias-geogebra', `${ejercicioId}.md`);
    if (!fs.existsSync(filePath)) {
      return { error: `La guía '${ejercicioId}.md' no fue encontrada.` };
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { content } = matter(fileContents);
    
    const processedContent = await remark().use(remarkHtml).process(content);
    const htmlContent = processedContent.toString();

    return { content, htmlContent };
  } catch (error) {
    console.error(`Error reading or processing guide for ${ejercicioId}:`, error);
    return { error: 'No se pudo cargar el contenido de la guía.' };
  }
}
