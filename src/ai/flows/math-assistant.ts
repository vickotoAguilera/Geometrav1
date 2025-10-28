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

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.any()),
});

const MathAssistantInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
  query: z.string().describe('The user query related to math or Geogebra.'),
  photoDataUri: z.string().optional().describe(
    "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
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
  prompt: `You are a helpful AI assistant specialized in mathematics and Geogebra. Analyze the user's query and any provided context (including images or conversation history) to provide an accurate and helpful response.

  {{#if photoDataUri}}
  Photo Analysis:
  {{media url=photoDataUri}}
  {{/if}}

  User Query: {{{query}}}`,
});

const mathAssistantFlow = ai.defineFlow(
  {
    name: 'mathAssistantFlow',
    inputSchema: MathAssistantInputSchema,
    outputSchema: MathAssistantOutputSchema,
  },
  async input => {
    
    const llm = ai.model('googleai/gemini-2.5-flash');

    const history = input.history?.map(msg => ({
        role: msg.role,
        content: msg.content.map(c => ({text: c.text}))
    })) || [];
    
    const {output} = await ai.generate({
        model: llm,
        history: history,
        prompt: `You are a helpful AI assistant specialized in mathematics and Geogebra. Analyze the user's query and any provided context (including images or conversation history) to provide an accurate and helpful response.

        ${input.photoDataUri ? `Photo Analysis: {{media url=${input.photoDataUri}}}`: ''}

        User Query: ${input.query}`,
        output: {
            schema: MathAssistantOutputSchema
        }
    })

    return output!;
  }
);