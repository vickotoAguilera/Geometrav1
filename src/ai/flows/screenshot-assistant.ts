'use server';
/**
 * @fileOverview An AI assistant that can analyze screenshots.
 *
 * - screenshotAssistant - A function that provides assistance based on text and an optional screenshot.
 * - ScreenshotAssistantInput - The input type for the screenshotAssistant function.
 * - ScreenshotAssistantOutput - The return type for the screenshotAssistant function.
 */

import {ai} from '@/ai/genkit';
import {Part} from 'genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.any()),
});

const ScreenshotAssistantInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
  query: z.string().describe('The user query.'),
  screenshotDataUri: z.string().optional().describe("A screenshot of the current page, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ScreenshotAssistantInput = z.infer<typeof ScreenshotAssistantInputSchema>;

const ScreenshotAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant. This response should be formatted using Markdown. Use <code> for code/formulas and ** for emphasis.'),
});
export type ScreenshotAssistantOutput = z.infer<typeof ScreenshotAssistantOutputSchema>;

export async function screenshotAssistant(input: ScreenshotAssistantInput): Promise<ScreenshotAssistantOutput> {
  return screenshotAssistantFlow(input);
}

const systemPrompt = `Eres un asistente de guía experto para una aplicación educativa de matemáticas llamada Geometra. Tu propósito es ayudar a los usuarios a entender y navegar la aplicación.

Reglas estrictas de comportamiento:
1.  **PROTOCOLO DE CAPTURA DE PANTALLA (PRIORIDAD MÁXIMA):** Si el usuario adjunta una imagen (una captura de pantalla de la aplicación), tu primera y única tarea en esa respuesta es actuar como un sistema de reconocimiento y visión. Describe de manera objetiva y detallada todo lo que ves en la captura: textos, botones, figuras geométricas, gráficos, etc.
    - **Sé un descriptor, no un solucionador:** No intentes resolver problemas matemáticos o responder preguntas directamente en este primer análisis. Solo describe lo que hay en la imagen.
    - **Finaliza preguntando:** Una vez que hayas descrito todo, siempre debes terminar tu respuesta con una pregunta abierta como: **"Basado en lo que veo en tu pantalla, ¿en qué puedo ayudarte?"** o **"Ahora que he analizado tu pantalla, ¿cuál es tu consulta específica?"**.

2.  **ROL DE GUÍA (CUANDO NO HAY IMAGEN O EN RESPUESTAS POSTERIORES):** Si el usuario te hace una pregunta sin captura de pantalla, o si es una pregunta posterior al análisis de una captura, tu rol es ser un guía de la aplicación.
    - **Usa la documentación:** Tienes acceso a la documentación completa del proyecto. Basa tus respuestas en esa información para explicar para qué sirve cada página, cada botón y cada funcionalidad.
    - **Sé conciso y claro:** Da respuestas directas y fáciles de entender.

3.  **FORMATO DE SALIDA:**
    - Tus respuestas deben estar en formato Markdown y siempre en español.
    - Usa \`<code>\` para nombres de archivos, funciones o fragmentos de código.
    - Usa \`**\` para resaltar los **conceptos clave** y las **preguntas directas** que le haces al usuario.`;

const screenshotAssistantFlow = ai.defineFlow(
  {
    name: 'screenshotAssistantFlow',
    inputSchema: ScreenshotAssistantInputSchema,
    outputSchema: ScreenshotAssistantOutputSchema,
  },
  async input => {
    const prompt: Part[] = [];

    // Add the screenshot to the prompt if it exists
    if (input.screenshotDataUri) {
      prompt.push({ media: { url: input.screenshotDataUri } });
    }

    // Add the user's text query
    prompt.push({ text: input.query });
    
    const history = input.history || [];
    const newHistory = [...history, { role: 'user', content: prompt }];
    
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      history: newHistory.slice(0, -1),
      prompt: newHistory.slice(-1)[0].content,
      output: {
        schema: ScreenshotAssistantOutputSchema,
      },
    });

    return output!;
  }
);
