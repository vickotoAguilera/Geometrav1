/**
 * @fileOverview Define los esquemas de Zod para la generación y evaluación de pruebas PAES.
 */
import { z } from 'genkit';

// Esquema para una única pregunta de la prueba PAES.
export const PaesPreguntaSchema = z.object({
  pregunta: z.string().describe('El enunciado claro y conciso de la pregunta, formulado al estilo DEMRE.'),
  alternativas: z.array(z.string()).length(4).describe('Un arreglo de 4 alternativas de selección múltiple (A, B, C, D). Una debe ser correcta y las otras tres deben ser distractores plausibles basados en errores comunes.'),
  respuestaCorrecta: z.string().describe('El texto exacto de la alternativa correcta.'),
});
export type PaesPregunta = z.infer<typeof PaesPreguntaSchema>;

// Esquema para la entrada del flujo generador de pruebas PAES.
export const GeneradorPaesInputSchema = z.object({
  tipoPrueba: z.enum(['M1', 'M2']).describe('El tipo de prueba a generar, M1 (obligatoria) o M2 (electiva).'),
});
export type GeneradorPaesInput = z.infer<typeof GeneradorPaesInputSchema>;

// Esquema para la salida del flujo generador de pruebas PAES.
export const GeneradorPaesOutputSchema = z.object({
  preguntas: z.array(PaesPreguntaSchema).length(50).describe('Un array que contiene exactamente 50 preguntas para la prueba.'),
});
export type GeneradorPaesOutput = z.infer<typeof GeneradorPaesOutputSchema>;

// Esquema de entrada para el flujo de retroalimentación PAES.
export const RetroalimentacionPaesInputSchema = z.object({
  pregunta: PaesPreguntaSchema.describe('La pregunta completa que se está evaluando.'),
  respuestaUsuario: z.string().describe('La alternativa seleccionada por el usuario.'),
});
export type RetroalimentacionPaesInput = z.infer<typeof RetroalimentacionPaesInputSchema>;

// Esquema de salida para el flujo de retroalimentación PAES.
export const RetroalimentacionPaesOutputSchema = z.object({
  esCorrecta: z.boolean().describe('Indica si la respuesta del usuario es correcta.'),
  feedback: z.string().describe('La explicación detallada y pedagógica, estilo DEMRE, que justifica la respuesta correcta y/o explica el error conceptual del alumno.'),
});
export type RetroalimentacionPaesOutput = z.infer<typeof RetroalimentacionPaesOutputSchema>;