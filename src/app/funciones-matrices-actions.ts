'use server';

import { 
    funcionesMatricesAssistant, 
    type FuncionesMatricesAssistantInput, 
    type FuncionesMatricesAssistantOutput 
} from '@/ai/flows/funciones-matrices-assistant';
import { textToSpeech } from "@/ai/flows/tts-flow";
import { TextToSpeechOutput } from "@/ai/flows/schemas/tts-schemas";
import { 
    teoriaCalculadoraAssistant, 
    type TeoriaCalculadoraAssistantInput, 
    type TeoriaCalculadoraAssistantOutput 
} from '@/ai/flows/teoria-calculadora-assistant';


import * as LaRampaTutorCalculadora from '@/content/guias-geogebra/la-rampa/tutor-calculadora/consolidado';
import * as LaRampaTutorGeogebra from '@/content/guias-geogebra/la-rampa/tutor-geogebra/consolidado';
import * as PlazaSkateTutorCalculadora from '@/content/guias-geogebra/plaza-skate/tutor-calculadora/consolidado';
import * as PlazaSkateTutorGeogebra from '@/content/guias-geogebra/plaza-skate/tutor-geogebra/consolidado';
import * as LaRampaActividad1 from '@/content/guias-geogebra/la-rampa/tutor-calculadora/actividad-1';
import * as LaRampaActividad2 from '@/content/guias-geogebra/la-rampa/tutor-geogebra/actividad-2';
import * as LaRampaActividad3 from '@/content/guias-geogebra/la-rampa/tutor-geogebra/actividad-3';
import * as LaRampaActividad4 from '@/content/guias-geogebra/la-rampa/tutor-calculadora/actividad-4';
import * as LaRampaActividad5 from '@/content/guias-geogebra/la-rampa/tutor-calculadora/actividad-5';


export async function getFuncionesMatricesAiResponse(
  input: FuncionesMatricesAssistantInput
): Promise<FuncionesMatricesAssistantOutput> {
  return await funcionesMatricesAssistant(input);
}

export async function getTeoriaCalculadoraAiResponse(
  input: TeoriaCalculadoraAssistantInput
): Promise<TeoriaCalculadoraAssistantOutput> {
  return await teoriaCalculadoraAssistant(input);
}


export async function generateFuncionesMatricesSpeech(text: string): Promise<TextToSpeechOutput> {
    return await textToSpeech(text);
}

const contextMap: Record<string, { content: string }> = {
    // Contextos consolidados (usados por varias actividades)
    'la-rampa/tutor-calculadora/consolidado': { content: LaRampaTutorCalculadora.contexto },
    'la-rampa/tutor-geogebra/consolidado': { content: LaRampaTutorGeogebra.contexto },
    'plaza-skate/tutor-calculadora/consolidado': { content: PlazaSkateTutorCalculadora.contexto },
    'plaza-skate/tutor-geogebra/consolidado': { content: PlazaSkateTutorGeogebra.contexto },
    
    // Contextos específicos por actividad
    'la-rampa/tutor-calculadora/actividad-1': { content: LaRampaActividad1.contexto },
    'la-rampa/tutor-geogebra/actividad-2': { content: LaRampaActividad2.contexto },
    'la-rampa/tutor-geogebra/actividad-3': { content: LaRampaActividad3.contexto },
    'la-rampa/tutor-calculadora/actividad-4': { content: LaRampaActividad4.contexto },
    'la-rampa/tutor-calculadora/actividad-5': { content: LaRampaActividad5.contexto },
};

export async function getGuiaEjercicio(ejercicioId: string | string[]): Promise<{ content: string; } | { error: string }> {
  try {
    const ids = Array.isArray(ejercicioId) ? ejercicioId : [ejercicioId];
    let combinedContent = '';

    for (const id of ids) {
      const data = contextMap[id];
      if (!data) {
        return { error: `La guía '${id}' no fue encontrada.` };
      }
      // Añadimos un encabezado para que la IA sepa qué archivo está leyendo
      combinedContent += `--- GUÍA: ${id}.ts ---\n${data.content}\n\n`;
    }
    
    return { content: combinedContent };
  } catch (error) {
    console.error(`Error loading guide for ${ejercicioId}:`, error);
    return { error: 'No se pudo cargar el contenido de la guía.' };
  }
}
