'use server';

import {
  generarPrueba,
  type GeneradorPruebasInput,
  type GeneradorPruebasOutput,
} from '@/ai/flows/generador-pruebas-flow';

import {
  retroalimentacion,
  type RetroalimentacionInput,
  type RetroalimentacionOutput,
} from '@/ai/flows/retroalimentacion-ia-flow';

/**
 * Llama al flujo de Genkit para generar una nueva prueba.
 * @param input - Los parámetros para generar la prueba (tema, cantidad de preguntas, tipo).
 * @returns Un objeto con la lista de preguntas generadas.
 */
export async function generarPruebaAction(
  input: GeneradorPruebasInput
): Promise<GeneradorPruebasOutput> {
  return await generarPrueba(input);
}

/**
 * Llama al flujo de Genkit para obtener retroalimentación sobre la respuesta de un usuario.
 * @param input - El contexto de la respuesta (pregunta, respuesta del usuario, etc.).
 * @returns Un objeto con la evaluación de la IA (si es correcta, feedback, etc.).
 */
export async function retroalimentacionAction(
  input: RetroalimentacionInput
): Promise<RetroalimentacionOutput> {
  return await retroalimentacion(input);
}
