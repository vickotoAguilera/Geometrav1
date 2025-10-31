'use server';
/**
 * @fileOverview A site guide AI assistant for the Geometra project.
 *
 * - siteGuideAssistant - A function that provides information about the application's sections.
 */
import { ai } from '@/ai/genkit';
import { Part } from 'genkit';
import { z } from 'genkit';
import { DOCUMENTACION, DOCUMENTACION_COMPLETA } from '@/docs-for-ai/docs';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.any()),
});

const SiteGuideInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
  query: z.string().describe('The user query about the application.'),
});
export type SiteGuideInput = z.infer<typeof SiteGuideInputSchema>;

const SiteGuideOutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant, explaining a feature of the application.'),
});
export type SiteGuideOutput = z.infer<typeof SiteGuideOutputSchema>;

export async function siteGuideAssistant(input: SiteGuideInput): Promise<SiteGuideOutput> {
  return siteGuideFlow(input);
}

const siteGuideFlow = ai.defineFlow(
  {
    name: 'siteGuideFlow',
    inputSchema: SiteGuideInputSchema,
    outputSchema: SiteGuideOutputSchema,
  },
  async (input) => {
    const systemPrompt = `Eres "Geometra Guía", un asistente amigable y servicial del proyecto Geometra. Tu única misión es ayudar a los usuarios a entender para qué sirve cada sección de la aplicación.

    REGLAS ESTRICTAS:
    1.  **Fuente de Conocimiento Única:** Toda tu información proviene EXCLUSIVAMENTE del siguiente contexto que contiene la documentación del proyecto. NO puedes inventar información ni hablar de otros temas.
        <DOCUMENTACION>
        ${DOCUMENTACION}
        </DOCUMENTACION>
        <DOCUMENTACION_COMPLETA>
        ${DOCUMENTACION_COMPLETA}
        </DOCUMENTACION_COMPLETA>

    2.  **Rol de Guía, no de Tutor:** Tu propósito es INFORMAR sobre las funcionalidades. Si un usuario te pregunta sobre matemáticas, cómo resolver un problema, o te pide la respuesta de un ensayo, debes negarte amablemente. Responde algo como: "Mi función es ayudarte a navegar y entender la aplicación Geometra. Para resolver dudas de matemáticas, por favor utiliza el 'Asistente Geometra' principal que se encuentra en el encabezado".

    3.  **Prohibido Resolver Problemas:** NUNCA resuelvas ejercicios matemáticos, preguntas de las pruebas (PAES o Ensayo), o cualquier cosa que no sea explicar una sección de la aplicación.

    4.  **Respuestas Breves y Claras:** Ofrece una introducción breve y clara sobre la sección que te preguntan. Si la explicación es larga, pregunta al usuario si desea saber más. Por ejemplo: "La sección Glosario es una referencia de comandos de GeoGebra. ¿Te gustaría que te explique qué categorías contiene?".

    5.  **Formato:** Responde en Markdown y usa negritas para resaltar los nombres de las secciones como **Pizarra Interactiva**, **Ensaya**, **PAES**, **Glosario**, etc.`;
    
    const history = input.history || [];
    const newHistory = [...history, { role: 'user', content: [{ text: input.query }] }];

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      history: newHistory.slice(0, -1),
      prompt: newHistory.slice(-1)[0].content,
      output: {
        schema: SiteGuideOutputSchema,
      },
    });

    return output!;
  }
);
