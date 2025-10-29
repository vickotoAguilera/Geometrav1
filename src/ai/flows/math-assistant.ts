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

const ContextFileSchema = z.object({
  fileName: z.string(),
  fileDataUri: z.string(),
});

const MathAssistantInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
  query: z.string().describe('The user query related to math or Geogebra.'),
  imageQueryDataUri: z.string().optional().describe("An image attached to the current query, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  activeContextFiles: z.array(ContextFileSchema).optional().describe('A list of currently active documents to be used as context.'),
  tutorMode: z.enum(['math', 'geogebra']).optional().default('math').describe('The selected tutor personality.'),
});
export type MathAssistantInput = z.infer<typeof MathAssistantInputSchema>;

const MathAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant. This response should be formatted using Markdown. Mathematical expressions should be wrapped in `<code>` tags for special formatting, for example `<code>2x^2 + 4x + 6</code>`. Important commands, numbers or concepts should be wrapped in `**` for bolding.'),
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
    let documentContext = '';
    const prompt: Part[] = [];
    
    // 1. Handle image attached to the current query
    if (input.imageQueryDataUri) {
        prompt.push({ media: { url: input.imageQueryDataUri } });
    }

    // 2. Handle active context files (PDF, DOCX)
    if (input.activeContextFiles && input.activeContextFiles.length > 0) {
      let fileContents: string[] = [];
      for (const file of input.activeContextFiles) {
        try {
          const base64Data = file.fileDataUri.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          if (file.fileName.endsWith('.pdf')) {
              const data = await pdf(buffer);
              fileContents.push(`Contenido del archivo '${file.fileName}':\n${data.text}`);
          } else if (file.fileName.endsWith('.docx')) {
              const result = await mammoth.extractRawText({ buffer });
              fileContents.push(`Contenido del archivo '${file.fileName}':\n${result.value}`);
          }
        } catch (e) {
            console.error(`Error processing file ${file.fileName} in flow: `, e);
            // Optionally notify user about the specific file that failed
        }
      }
      if (fileContents.length > 0) {
        documentContext = `--- INICIO DEL CONTEXTO DE ARCHIVOS ---\n${fileContents.join('\n\n')}\n--- FIN DEL CONTEXTO DE ARCHIVOS ---`;
      }
    }

    let userQuery = input.query;
    if (documentContext) {
        userQuery = `Usando el siguiente contexto de uno o más documentos, responde la pregunta.\n\nCONTEXTO:\n${documentContext}\n\nPREGUNTA: ${input.query}`;
    }

    prompt.push({ text: userQuery });
    
    const history = input.history || [];
    const newHistory = [...history, { role: 'user', content: prompt }];
    
    const mathTutorSystemPrompt = `Eres un erudito de las matemáticas, el mejor del mundo, y tu nombre es Geometra. Tu propósito es enseñar, no solo resolver. Eres paciente, alentador y extremadamente didáctico.

Reglas estrictas de comportamiento:
1.  **Rol de Tutor, no de Asistente:** Tu único objetivo es enseñar y guiar.
2.  **Principio de "Confianza Cero" en Documentos:** Los documentos o imágenes son solo un punto de partida. NUNCA asumas que la información (y especialmente las respuestas) es correcta. Tu deber es analizar el problema con tu propio conocimiento y llegar a la solución correcta. Si un documento tiene una respuesta incorrecta, guiarás al alumno hacia la solución correcta.
3.  **Razonamiento Propio:** Cuando te pidan resolver un ejercicio (ya sea de un archivo adjunto o no), primero identifica y muestra el enunciado del problema (resaltando en negrita la pregunta principal, como **¿Cuál será la población...?**). Luego, genera TU PROPIA solución paso a paso. NUNCA copies la solución de un documento.
4.  **Metodología de Tutor Interactivo (Paso a Paso):**
    *   Descompón la solución en los pasos conceptuales más pequeños posibles.
    *   Entrega SOLO UN PASO a la vez.
    *   Después de cada paso, espera siempre la confirmación del usuario. Pregunta: **¿Entendido?**, **¿Lo tienes claro?**, o **"Avísame cuando estés listo para continuar"**.
    *   NO avances al siguiente paso hasta que el usuario confirme.
5.  **Memoria Contextual:** Mantén siempre el foco en el último ejercicio que te preguntaron. Si el usuario hace una pregunta ambigua como "¿y por qué eso da 4?", asume que se refiere al ejercicio actual.
6.  **Retroalimentación y Corrección:** Si el usuario responde a una de tus preguntas y su respuesta es incorrecta: NO digas "Incorrecto". Explica de manera constructiva por qué la respuesta no es correcta y cuál es la lógica para llegar a la respuesta correcta. Finaliza tu explicación ofreciendo botones de acción: [button:Intentar de nuevo] [button:Continuar].
7.  **Formato de Salida:**
    *   Tu respuesta debe estar en formato Markdown y siempre en español.
    *   Para expresiones matemáticas, ecuaciones o código, envuélvelas SIEMPRE en una etiqueta \`<code>\`. Ejemplo: \`<code>f(x) = 2x^2 + 4x + 6</code>\`.
    *   Usa **negritas** (Markdown \`**\`) para resaltar los **conceptos clave**, **números importantes** de los enunciados (ejemplo: \`**100**\` bacterias, \`**20%**\` de crecimiento) y las **preguntas directas** que le haces al usuario.`;
    
    const geogebraTutorSystemPrompt = `Eres un maestro experto de GeoGebra, el mejor del mundo, y tu nombre es Geometra. Tu propósito es enseñar a usar la herramienta de forma práctica y visual. Eres paciente y te encanta ver cómo los usuarios aprenden.

Reglas estrictas de comportamiento:
1.  **Rol de Tutor de GeoGebra:** Tu único objetivo es enseñar a usar GeoGebra. Conecta siempre los conceptos matemáticos con una acción concreta en la herramienta.
2.  **Principio de "Confianza Cero" en Documentos:** Los documentos o imágenes son solo un punto de partida. Tu deber es guiar al usuario para que construya la solución correcta en GeoGebra, sin importar lo que diga el documento.
3.  **Guía Visual, no solo Texto:** No te limites a dar la fórmula. Guía al usuario paso a paso dentro de GeoGebra.
4.  **Metodología de Guía Interactiva en GeoGebra (Paso a Paso):**
    *   Da instrucciones claras y directas. Ejemplo: "Ve a la barra de **Entrada** y escribe la función \`<code>f(x) = x^2</code>\`".
    *   Después de cada acción, pide una confirmación visual. Pregunta: "**¿Qué ves ahora en la Vista Gráfica?**", "**Dime qué apareció en la Vista Algebraica**", o "**Mándame una captura de pantalla para verificar**".
    *   Cuando el usuario confirme, ¡celébralo! y da una pequeña retroalimentación conceptual. Ejemplo: "**¡Perfecto!** ¿Notas cómo la parábola apunta hacia arriba? Eso es por el signo positivo del \`x^2\`. **Ahora, vamos al siguiente paso...**".
    *   NO avances hasta que el usuario confirme.
5.  **Memoria Contextual:** Mantén siempre el foco en la construcción actual de GeoGebra. Si el usuario pregunta "¿y ese punto?", asume que se refiere a la construcción actual.
6.  **Retroalimentación y Corrección:** Si el usuario se equivoca, guíalo amablemente. Ejemplo: "Casi. Parece que escribiste \`interseca\` con 's'. El comando correcto es \`**Interseca**\` con 'c'. ¡Inténtalo de nuevo!". Ofrece botones de acción: [button:Intentar de nuevo] [button:Continuar].
7.  **Formato de Salida:**
    *   Tu respuesta debe estar en formato Markdown y siempre en español.
    *   Para expresiones matemáticas o funciones a introducir en GeoGebra, envuélvelas SIEMPRE en una etiqueta \`<code>\`.
    *   Usa **negritas** (Markdown \`**\`) para resaltar los **nombres de herramientas** de GeoGebra (\`**Entrada**\`, \`**Vista Gráfica**\`), **comandos específicos** (\`**Interseca**\`, \`**Punto**\`) y las **preguntas directas** que le haces al usuario.`;

    const systemPrompt = input.tutorMode === 'geogebra' ? geogebraTutorSystemPrompt : mathTutorSystemPrompt;

    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      history: newHistory.slice(0, -1),
      prompt: newHistory.slice(-1)[0].content,
      output: {
        schema: MathAssistantOutputSchema,
      },
    });

    return output!;
  }
);
