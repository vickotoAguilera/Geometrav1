'use server';

import {
  generarPruebaPaes,
  type GeneradorPaesInput,
  type GeneradorPaesOutput,
} from '@/ai/flows/generador-paes-flow';

import {
  retroalimentacionPaes,
  type RetroalimentacionPaesInput,
  type RetroalimentacionPaesOutput,
} from '@/ai/flows/retroalimentacion-paes-flow';

/**
 * Llama al flujo de Genkit para generar una nueva prueba PAES.
 * @param input - Los parámetros para generar la prueba (tipo M1 o M2).
 * @returns Un objeto con la lista de 50 preguntas generadas.
 */
export async function generarPruebaPaesAction(
  input: GeneradorPaesInput
): Promise<GeneradorPaesOutput> {
  return await generarPruebaPaes(input);
}

/**
 * Llama al flujo de Genkit para obtener retroalimentación sobre la respuesta PAES de un usuario.
 * @param input - El contexto de la respuesta (pregunta, respuesta del usuario, etc.).
 * @returns Un objeto con la evaluación de la IA (si es correcta, feedback, etc.).
 */
export async function retroalimentacionPaesAction(
  input: RetroalimentacionPaesInput
): Promise<RetroalimentacionPaesOutput> {
  return await retroalimentacionPaes(input);
}
