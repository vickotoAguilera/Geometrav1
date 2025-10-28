'use server';
/**
 * @fileOverview An AI assistant for mathematics and Geogebra questions.
 *
 * - mathAssistant - A function that provides assistance with math problems and Geogebra questions.
 * - MathAssistantInput - The input type for the mathAssistant function.
 * - MathAssistantOutput - The return type for the mathAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MathAssistantInputSchema = z.object({
  query: z.string().describe('The user query related to math or Geogebra.'),
});
export type MathAssistantInput = z.infer<typeof MathAssistantInputSchema>;

const MathAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant.'),
});
export type MathAssistantOutput = z.infer<typeof MathAssistantOutputSchema>;

export async function mathAssistant(input: MathAssistantInput): Promise<MathAssistantOutput> {
  return mathAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mathAssistantPrompt',
  input: {schema: MathAssistantInputSchema},
  output: {schema: MathAssistantOutputSchema},
  prompt: `You are a helpful AI assistant specialized in mathematics and Geogebra. Respond to the user query with accurate and helpful information.\n\nUser Query: {{{query}}}`,
});

const mathAssistantFlow = ai.defineFlow(
  {
    name: 'mathAssistantFlow',
    inputSchema: MathAssistantInputSchema,
    outputSchema: MathAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
