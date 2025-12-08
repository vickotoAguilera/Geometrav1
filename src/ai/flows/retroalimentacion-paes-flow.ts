'use server';
/**
 * @fileOverview Flujo de Genkit para el tutor de IA que proporciona retroalimentación para la prueba PAES.
 *
 * - retroalimentacionPaes - Evalúa la respuesta de un alumno y proporciona feedback detallado estilo DEMRE.
 * - RetroalimentacionPaesInput - El tipo de entrada para el flujo.
 * - RetroalimentacionPaesOutput - El tipo de salida del flujo.
 */

import { ai } from '@/ai/genkit';
import {
  RetroalimentacionPaesInputSchema,
  RetroalimentacionPaesOutputSchema,
  type RetroalimentacionPaesInput,
  type RetroalimentacionPaesOutput,
} from './schemas/generador-paes-schemas';


// Función exportada que se llamará desde la aplicación
export async function retroalimentacionPaes(input: RetroalimentacionPaesInput): Promise<RetroalimentacionPaesOutput> {
  return retroalimentacionPaesFlow(input);
}


const retroalimentacionPaesPrompt = ai.definePrompt({
  name: 'retroalimentacionPaesPrompt',
  input: { schema: RetroalimentacionPaesInputSchema },
  output: { schema: RetroalimentacionPaesOutputSchema },
  prompt: `
    Actúas como un experto del DEMRE y un tutor de matemáticas de excelencia. Tu misión es evaluar la respuesta de un estudiante a una pregunta de la PAES y proporcionar una retroalimentación clara, precisa y pedagógica.

    CONTEXTO:
    - Pregunta Original: {{{pregunta.pregunta}}}
    - Alternativas: {{{JSON.stringify pregunta.alternativas}}}
    - Respuesta Correcta: {{{pregunta.respuestaCorrecta}}}
    - Respuesta del Alumno: {{{respuestaUsuario}}}

    PASOS A SEGUIR:

    1.  **Evaluación:** Compara la 'Respuesta del Alumno' con la 'Respuesta Correcta'. Determina si es correcta o no.

    2.  **Generación de Feedback (La parte más importante):**
        - **Si la respuesta es CORRECTA:** Genera un mensaje de felicitación breve y reafirma el concepto clave evaluado.
        - **Si la respuesta es INCORRECTA:** Tu explicación debe ser excepcional, al estilo de las resoluciones oficiales del DEMRE.
            a.  **Análisis del Error:** Primero, identifica el error conceptual más probable que cometió el estudiante al elegir su alternativa incorrecta.
            b.  **Explicación Paso a Paso:** Proporciona una explicación detallada y metódica para llegar a la respuesta correcta. Desglosa el problema en pasos lógicos.
            c.  **Justificación de la Correcta:** Explica por qué la alternativa correcta es, de hecho, la correcta, conectando el resultado final con el desarrollo.
            d.  **Análisis de Distractores:** Si es relevante, explica brevemente por qué las otras alternativas son incorrectas.

    El tono debe ser alentador pero riguroso. El objetivo es que el estudiante no solo sepa la respuesta, sino que **entienda profundamente** el concepto y el proceso para resolver problemas similares en el futuro.

    Genera el resultado en el formato JSON especificado.
  `,
});

// Definición del flujo de Genkit
const retroalimentacionPaesFlow = ai.defineFlow(
  {
    name: 'retroalimentacionPaesFlow',
    inputSchema: RetroalimentacionPaesInputSchema,
    outputSchema: RetroalimentacionPaesOutputSchema,
  },
  async (input) => {
    const { output } = await retroalimentacionPaesPrompt(input);
    if (!output) {
      throw new Error('La IA de retroalimentación no pudo generar una respuesta.');
    }
    return output;
  }
);
