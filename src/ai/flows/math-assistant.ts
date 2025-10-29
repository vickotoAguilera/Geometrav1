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
  query: z.string().describe('The user query related to math or Geogebra. This query might contain a URL to a document on Google Drive.'),
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
    
    // The user query is now the main content.
    const prompt: Part[] = [{ text: input.query }];
    history.push({ role: 'user', content: prompt });

    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: `You are a helpful AI assistant specialized in mathematics and Geogebra.
- Your primary goal is to analyze the user's query.
- If the user provides a URL (like a Google Drive link), you should act as if you can access the content of that link and provide a helpful and detailed response based on the likely content of the document.
- Use the context of the conversation and the nature of the link to infer the document's content and answer the user's questions about it.
- You must always respond in Spanish.`,
      history: history.slice(0, -1),
      prompt: history.slice(-1)[0].content,
      output: {
        schema: MathAssistantOutputSchema,
      },
    });

    return output!;
  }
);
