'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing example prompts and use cases to new users of the math and Geogebra AI assistant.
 *
 * - getStartedPromptFlow: A function that returns example prompts and use cases.
 * - GetStartedPromptInput: The input type for the getStartedPromptFlow function (currently empty).
 * - GetStartedPromptOutput: The return type for the getStartedPromptFlow function, containing example prompts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetStartedPromptInputSchema = z.object({});
export type GetStartedPromptInput = z.infer<typeof GetStartedPromptInputSchema>;

const GetStartedPromptOutputSchema = z.object({
  examplePrompts: z.array(z.string()).describe('An array of example prompts and use cases for the AI assistant.'),
});
export type GetStartedPromptOutput = z.infer<typeof GetStartedPromptOutputSchema>;

export async function getStartedPrompt(): Promise<GetStartedPromptOutput> {
  return getStartedPromptFlow({});
}

const prompt = ai.definePrompt({
  name: 'getStartedPrompt',
  input: {schema: GetStartedPromptInputSchema},
  output: {schema: GetStartedPromptOutputSchema},
  prompt: `You are an AI assistant designed to help users with math and Geogebra. Provide a list of example prompts and use cases to help new users understand how to effectively use the tool. Focus on clarity and variety to showcase the tool's capabilities.\n\nExample Prompts and Use Cases:\n{{#each examplePrompts}}- {{this}}\n{{/each}}`,
});

const getStartedPromptFlow = ai.defineFlow(
  {
    name: 'getStartedPromptFlow',
    inputSchema: GetStartedPromptInputSchema,
    outputSchema: GetStartedPromptOutputSchema,
  },
  async () => {
    const examplePrompts = [
      'Resuelve la ecuación 2x + 3 = 7.',
      'Explica el concepto de derivadas en cálculo.',
      '¿Cómo construir una bisectriz perpendicular en Geogebra?',
      '¿Cuáles son las aplicaciones de las integrales en la vida real?',
      'Grafica la función y = x^2 - 4x + 3 usando Geogebra.',
      'Muéstrame cómo calcular el área de un círculo en Geogebra.',
      'Explica el teorema de Pitágoras.',
      'Dame algunas preguntas de ejemplo que se puedan resolver con la herramienta.',
    ];

    const {output} = await prompt({
      examplePrompts,
    });
    return output!;
  }
);
