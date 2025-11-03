/**
 * @fileOverview Define los esquemas de Zod para el flujo de verificación de respuestas abiertas.
 */
import { z } from 'genkit';

// Esquema para la entrada del flujo de verificación.
export const VerificadorRespuestaInputSchema = z.object({
  preguntaId: z.string().describe('El identificador único de la pregunta que se está verificando (ej: "angulo-central", "conversion-radianes").'),
  respuestaUsuario: z.string().describe('La respuesta proporcionada por el usuario.'),
  respuestaCorrecta: z.string().describe('La respuesta ideal o matemáticamente correcta para la pregunta (ej: "40", "2*pi/9").')
});
export type VerificadorRespuestaInput = z.infer<typeof VerificadorRespuestaInputSchema>;

// Esquema para la salida del flujo.
export const VerificadorRespuestaOutputSchema = z.object({
  esCorrecta: z.boolean().describe("Un booleano donde 'true' significa que la respuesta es correcta y 'false' que es incorrecta."),
  feedback: z.string().describe('Una breve explicación sobre la corrección. Si es correcta, un mensaje de felicitación. Si es incorrecta, una pista sutil sin dar la respuesta.')
});
export type VerificadorRespuestaOutput = z.infer<typeof VerificadorRespuestaOutputSchema>;
