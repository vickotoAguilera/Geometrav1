/**
 * @fileOverview Define los esquemas de Zod para la generación de pruebas.
 * Esto evita errores de 'use server' al separar los objetos de esquema de los flujos.
 */
import { z } from 'genkit';

// Esquema para las preguntas de Selección Múltiple
const PreguntaSeleccionMultipleSchema = z.object({
  tipo: z.literal('seleccion-multiple'),
  pregunta: z.string().describe('El enunciado claro y conciso de la pregunta.'),
  alternativas: z.array(z.string()).length(5).describe('Un arreglo de 5 alternativas, donde una es la correcta y las otras cuatro son distractores plausibles.'),
  respuestaCorrecta: z.string().describe('El texto exacto de la alternativa correcta.'),
  justificacion: z.string().describe('Una explicación clara y paso a paso de por qué esa es la respuesta correcta.'),
});

// Esquema para las preguntas de Respuesta Corta
const PreguntaRespuestaCortaSchema = z.object({
  tipo: z.literal('respuesta-corta'),
  pregunta: z.string().describe('El enunciado claro y conciso de la pregunta, que solicita una respuesta numérica o textual breve.'),
  respuestaCorrecta: z.string().describe('La respuesta exacta y precisa a la pregunta.'),
});

// Unión de ambos tipos de preguntas
export const PreguntaSchema = z.union([
  PreguntaSeleccionMultipleSchema,
  PreguntaRespuestaCortaSchema,
]);
export type Pregunta = z.infer<typeof PreguntaSchema>;

// Esquema para la entrada del flujo
export const GeneradorPruebasInputSchema = z.object({
  tema: z.string().describe('El tema central de la prueba. Ejemplo: "Teorema de Pitágoras".'),
  cantidadPreguntas: z.number().int().positive().describe('El número de preguntas que debe contener la prueba.'),
  tipoPrueba: z.enum(['seleccion-multiple', 'respuesta-corta']).describe('El formato de las preguntas a generar.'),
});
export type GeneradorPruebasInput = z.infer<typeof GeneradorPruebasInputSchema>;

// Esquema para la salida del flujo
export const GeneradorPruebasOutputSchema = z.object({
  preguntas: z.array(PreguntaSchema),
});
export type GeneradorPruebasOutput = z.infer<typeof GeneradorPruebasOutputSchema>;