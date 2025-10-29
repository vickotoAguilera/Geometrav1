'use server';
/**
 * @fileOverview An AI assistant for mathematics and Geogebra questions.
 *
 * - mathAssistant - A function that provides assistance with math problems and Geogebra questions.
 * - MathAssistantInput - The input type for the mathAssistant function.
 * - MathAssistantOutput - The return type for the mathAssistant function.
 */

import {ai} from '@/ai/genkit';
import {Part} from 'genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.any()),
});

const MathAssistantInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
  query: z.string().describe('The user query related to math or Geogebra. This query may contain context from a user-provided file.'),
});
export type MathAssistantInput = z.infer<typeof MathAssistantInputSchema>;

const MathAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant.'),
});
export type MathAssistantOutput = z.infer<typeof MathAssistantOutputSchema>;

export async function mathAssistant(input: MathAssistantInput): Promise<MathAssistantOutput> {
  return mathAssistantFlow(input);
}

const mathAssistantFlow = ai.defineFlow(
  {
    name: 'mathAssistantFlow',
    inputSchema: MathAssistantInputSchema,
    outputSchema: MathAssistantOutputSchema,
  },
  async input => {
    const history = input.history || [];
    
    // The user query is the main content.
    const prompt: Part[] = [{ text: input.query }];
    history.push({ role: 'user', content: prompt });

    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: `Eres un útil asistente de IA especializado en matemáticas y GeoGebra.
- Tu objetivo principal es analizar la consulta del usuario y cualquier contenido de archivo proporcionado como contexto.
- Si la consulta del usuario contiene un CONTEXTO, debes tratar ese texto como la fuente principal de información para responder a la PREGUNTA.
- Proporciona una respuesta útil y detallada basada en el contenido del contexto para responder las preguntas del usuario sobre él.
- Debes responder siempre en español.`,
      history: history.slice(0, -1),
      prompt: history.slice(-1)[0].content,
      output: {
        schema: MathAssistantOutputSchema,
      },
    });

    return output!;
  }
);
