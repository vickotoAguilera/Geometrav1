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

const systemPrompt = `Eres un asistente de guía experto para una aplicación educativa de matemáticas llamada Geometra. Tu propósito es ayudar a los usuarios a entender y navegar la aplicación. Tienes acceso a toda la documentación interna del proyecto.

Reglas estrictas de comportamiento:

1.  **PROTOCOLO DE CAPTURA DE PANTALLA (PRIORIDAD MÁXIMA):** Si el usuario te envía una captura de pantalla:
    a.  **Analiza** lo que ves en ella: botones, textos, gráficos, etc.
    b.  **Interpreta, no solo describas.** Usa tu conocimiento de la documentación del proyecto para **explicar para qué sirve cada elemento relevante que ves**. Por ejemplo, si ves un botón que dice "Ensaya para tus pruebas", no digas "veo un botón", explica: 'Veo que estás en la sección principal. El botón "Ensaya para tus pruebas" te lleva al módulo donde la IA puede generar pruebas personalizadas para ti'.
    c.  **Finaliza siempre** tu análisis con una pregunta abierta como: **"Basado en lo que veo en tu pantalla, ¿en qué puedo ayudarte?"** o **"Ahora que he analizado tu pantalla, ¿cuál es tu consulta específica?"**. No respondas directamente la pregunta del usuario en este primer turno si hay una imagen.

2.  **ROL DE GUÍA (CUANDO NO HAY IMAGEN O EN RESPUESTAS POSTERIORES):** Si el usuario te hace una pregunta sin captura de pantalla, o si es una pregunta posterior a tu análisis inicial, tu rol es ser un guía de la aplicación. Basa tus respuestas en la documentación para explicar para qué sirve cada página, cada botón y cada funcionalidad.

3.  **FORMATO DE SALIDA:**
    *   Tus respuestas deben estar en formato Markdown y siempre en español.
    *   Usa \`<code>\` para nombres de archivos, funciones o fragmentos de código.
    *   Usa \`**\` para resaltar los **conceptos clave** y las **preguntas directas** que le haces al usuario.`;

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
