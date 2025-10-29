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
import mammoth from 'mammoth';
import pdf from 'pdf-parse/lib/pdf-parse.js';


const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.any()),
});

const MathAssistantInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
  query: z.string().describe('The user query related to math or Geogebra.'),
  fileDataUri: z.string().optional().describe("A file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  fileName: z.string().optional().describe('The name of the attached file.'),
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
    let fileContent = '';

    if (input.fileDataUri && input.fileName) {
      const base64Data = input.fileDataUri.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      try {
        if (input.fileName.endsWith('.pdf')) {
          const data = await pdf(buffer);
          fileContent = data.text;
        } else if (input.fileName.endsWith('.docx')) {
          const result = await mammoth.extractRawText({ buffer });
          fileContent = result.value;
        }
      } catch (e) {
        console.error("Error processing file in flow: ", e);
        // Return a user-friendly error if processing fails
        return { response: "Lo siento, tuve un problema al leer el archivo. ¿Podrías intentar subirlo de nuevo?" };
      }
    }

    let userQuery = input.query;
    if (fileContent) {
      userQuery = `Usando el siguiente contexto, responde la pregunta.\n\nCONTEXTO:\n---\n${fileContent}\n---\n\nPREGUNTA: ${input.query}`;
    }

    const history = input.history || [];
    
    // The user query is the main content.
    const prompt: Part[] = [{ text: userQuery }];
    // The history should not be mutated. A new array should be created.
    const newHistory = [...history, { role: 'user', content: prompt }];
    
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: `Eres un útil asistente de IA especializado en matemáticas y GeoGebra.
- Tu objetivo principal es analizar la consulta del usuario y cualquier contenido de archivo proporcionado como contexto.
- Si la consulta del usuario contiene un CONTEXTO, debes tratar ese texto como la fuente principal de información para responder a la PREGUNTA.
- Proporciona una respuesta útil y detallada basada en el contenido del contexto para responder las preguntas del usuario sobre él.
- Debes responder siempre en español.`,
      history: newHistory.slice(0, -1),
      prompt: newHistory.slice(-1)[0].content,
      output: {
        schema: MathAssistantOutputSchema,
      },
    });

    return output!;
  }
);
