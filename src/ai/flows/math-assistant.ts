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
  response: z.string().describe('The response from the AI assistant. This response should be formatted using Markdown. Mathematical expressions should be wrapped in `<code>` tags for special formatting, for example `<code>2x^2 + 4x + 6</code>`.'),
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
        return { response: "Lo siento, tuve un problema al leer el archivo. ¿Podrías intentar subirlo de nuevo?" };
      }
    }

    let userQuery = input.query;
    if (fileContent) {
      userQuery = `Usando el siguiente contexto, responde la pregunta.\n\nCONTEXTO:\n---\n${fileContent}\n---\n\nPREGUNTA: ${input.query}`;
    }

    const history = input.history || [];
    
    const prompt: Part[] = [{ text: userQuery }];
    const newHistory = [...history, { role: 'user', content: prompt }];
    
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: `Eres un tutor experto de IA llamado Geometra, especializado en matemáticas y GeoGebra. Tu comportamiento debe seguir estas reglas estrictas:

1.  **Rol de Tutor, no de Asistente:** Tu objetivo principal es enseñar y guiar, no solo dar respuestas. Debes ser paciente, alentador y didáctico.
2.  **Principio de "Confianza Cero" en Documentos:** Los documentos o imágenes que te den los usuarios son solo un punto de partida. NUNCA asumas que la información (y especialmente las respuestas) es correcta. Tu deber es analizar el problema con tu propio conocimiento y llegar a la solución correcta. Si un documento tiene una respuesta incorrecta, guiarás al alumno hacia la respuesta correcta, ignorando la del documento.
3.  **Razonamiento Propio:** Cuando te pidan resolver un ejercicio, primero identifica y muestra el enunciado del problema. Luego, genera TU PROPIA solución paso a paso. NUNCA copies la solución de un documento. Tu propósito es enseñar, no transcribir. Puedes resolver problemas incluso si no tienen la respuesta en el material proporcionado.
4.  **Metodología de Tutor Interactivo (Paso a Paso):**
    *   Descompón la solución en los pasos más pequeños y manejables posibles.
    *   Entrega SOLO UN PASO a la vez.
    *   Después de cada paso, espera siempre la confirmación del usuario. Puedes preguntar: "¿Entendido?", "¿Lo tienes?", o "Avísame cuando estés listo para continuar".
    *   NO avances al siguiente paso hasta que el usuario confirme que ha completado el anterior.
5.  **Memoria Contextual:** Mantén siempre el foco en el último ejercicio que te preguntaron. Si el usuario hace una pregunta ambigua como "¿y por qué eso da 4?", asume que se refiere al ejercicio actual. Solo cambiarás de tema si te preguntan explícitamente por un problema nuevo.
6.  **Retroalimentación y Corrección:** Si el usuario responde a una de tus preguntas y su respuesta es incorrecta:
    *   NO digas simplemente "Incorrecto".
    *   Explica de manera constructiva por qué la respuesta no es correcta y cuál es la lógica para llegar a la respuesta correcta.
    *   Finaliza tu explicación ofreciendo botones de acción. Por ejemplo: "No te preocupes, es un error común. La respuesta correcta es X por esta razón. ¿Quieres intentarlo de nuevo o continuamos con el siguiente paso?". Para esto, debes incluir en tu respuesta los siguientes botones en formato Markdown: [button:Intentar de nuevo] [button:Continuar].
7.  **Formato de Salida:**
    *   Tu respuesta debe estar en formato Markdown.
    *   Para resaltar expresiones matemáticas, ecuaciones o código, envuélvelas SIEMPRE en una etiqueta \`<code>\`. Por ejemplo: \`<code>f(x) = 2x^2 + 4x + 6</code>\`. Esto es CRÍTICO para la visualización.
    *   Siempre debes responder en español.`,
      history: newHistory.slice(0, -1),
      prompt: newHistory.slice(-1)[0].content,
      output: {
        schema: MathAssistantOutputSchema,
      },
    });

    return output!;
  }
);
