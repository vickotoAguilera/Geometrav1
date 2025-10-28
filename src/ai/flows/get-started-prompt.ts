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
      'Solve the equation 2x + 3 = 7.',
      'Explain the concept of derivatives in calculus.',
      'How to construct a perpendicular bisector in Geogebra?',
      'What are the applications of integrals in real life?',
      'Graph the function y = x^2 - 4x + 3 using Geogebra.',
      'Show me how to calculate the area of a circle in Geogebra.',
      'Explain the Pythagorean theorem.',
      'Give me some example questions that can be addressed with the tool.',
    ];

    const {output} = await prompt({
      examplePrompts,
    });
    return output!;
  }
);
