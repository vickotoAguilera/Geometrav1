'use server';

import { 
    funcionesMatricesAssistant, 
    type FuncionesMatricesAssistantInput, 
    type FuncionesMatricesAssistantOutput 
} from '@/ai/flows/funciones-matrices-assistant';
import { textToSpeech } from "@/ai/flows/tts-flow";
import { TextToSpeechOutput } from "@/ai/flows/schemas/tts-schemas";

import * as LaRampaTutorCalculadora from '@/content/guias-geogebra/la-rampa/tutor-calculadora/consolidado';
import * as LaRampaTutorGeogebra from '@/content/guias-geogebra/la-rampa/tutor-geogebra/consolidado';
import * as PlazaSkateTutorCalculadora from '@/content/guias-geogebra/plaza-skate/tutor-calculadora/consolidado';
import * as PlazaSkateTutorGeogebra from '@/content/guias-geogebra/plaza-skate/tutor-geogebra/consolidado';


export async function getFuncionesMatricesAiResponse(
  input: FuncionesMatricesAssistantInput
): Promise<FuncionesMatricesAssistantOutput> {
  return await funcionesMatricesAssistant(input);
}

export async function generateFuncionesMatricesSpeech(text: string): Promise<TextToSpeechOutput> {
    return await textToSpeech(text);
}

const contextMap: Record<string, { content: string }> = {
    'la-rampa/tutor-calculadora/consolidado': { content: LaRampaTutorCalculadora.contexto },
    'la-rampa/tutor-geogebra/consolidado': { content: LaRampaTutorGeogebra.contexto },
    'plaza-skate/tutor-calculadora/consolidado': { content: PlazaSkateTutorCalculadora.contexto },
    'plaza-skate/tutor-geogebra/consolidado': { content: PlazaSkateTutorGeogebra.contexto },
};

export async function getGuiaEjercicio(ejercicioId: string): Promise<{ content: string; } | { error: string }> {
  try {
    const data = contextMap[ejercicioId];
    if (!data) {
      return { error: `La guía '${ejercicioId}' no fue encontrada.` };
    }
    return { content: data.content };
  } catch (error) {
    console.error(`Error loading guide for ${ejercicioId}:`, error);
    return { error: 'No se pudo cargar el contenido de la guía.' };
  }
}
