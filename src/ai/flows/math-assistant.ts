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

    // 2. Handle active context files (DOCX only)
    if (input.activeContextFiles && input.activeContextFiles.length > 0) {
      let fileContents: string[] = [];
      for (const file of input.activeContextFiles) {
        try {
          const base64Data = file.fileDataUri.substring(file.fileDataUri.indexOf(',') + 1);
          const buffer = Buffer.from(base64Data, 'base64');
          let textContent = '';
          
          if (file.fileName.endsWith('.docx')) {
              const result = await mammoth.extractRawText({ buffer });
              textContent = result.value;
          } else if (file.fileName.endsWith('.pdf')) {
              // PDF processing is removed due to bundling issues.
              textContent = `[El procesamiento del archivo PDF '${file.fileName}' no está disponible en este momento.]`;
          }
          
          const imagePlaceholderRegex = /\[IMAGEN:.+?\]/gi;
          if (imagePlaceholderRegex.test(textContent)) {
             textContent += "\n\n--- INSTRUCCIÓN ADICIONAL: El documento anterior contiene marcadores de imagen como [IMAGEN: ...]. Si la pregunta del usuario se relaciona con uno de estos marcadores, DEBES pedirle al usuario que suba la imagen correspondiente para poder analizarla. Por ejemplo: 'Veo que este ejercicio se apoya en una imagen. Por favor, súbela al chat para poder ayudarte mejor'. NO intentes responder sin la imagen si esta es necesaria. ---";
          }
          
          fileContents.push(`Contenido del archivo '${file.fileName}':\n${textContent}`);

        } catch (e) {
            console.error(`Error processing file ${file.fileName} in flow: `, e);
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

    if (userQuery.trim()) {
        prompt.push({ text: userQuery });
    }
    
    const history = input.history || [];
    const newHistory = [...history, { role: 'user', content: prompt }];
    
    const mathTutorSystemPrompt = `Eres un erudito de las matemáticas, el mejor del mundo, y tu nombre es Geometra. Tu propósito es enseñar, no solo resolver. Eres paciente, alentador y extremadamente didáctico, funcionando como un tutor socrático.

Reglas estrictas de comportamiento:
1.  **PROTOCOLO DE IMAGEN (PRIORIDAD MÁXIMA):** Si el usuario adjunta una imagen, tu primera y más importante tarea es actuar como un sistema de reconocimiento óptico (OCR) y de visión artificial. Describe detalladamente todo lo que ves: el texto, las fórmulas, los diagramas y las figuras geométricas. Una vez que hayas descrito todo, finaliza tu primera respuesta preguntando: **'Basado en esta descripción, ¿cuál es tu consulta específica?'**. NO intentes resolver el problema directamente; espera a que el usuario te haga una pregunta sobre la información que extrajiste.

2.  **PROTOCOLO DE MARCADOR DE IMAGEN:** Si durante el análisis de un documento de texto encuentras un marcador como \`[IMAGEN: descripción...]\`, y la pregunta del usuario está relacionada con esa sección, tu deber es detenerte y pedirle al usuario que suba la imagen. Responde con algo como: "**Veo que la pregunta 4 de la página 8 está ligada a una imagen. Si quieres que la analice para darte una mejor explicación, puedes adjuntarla en este chat. Si no lo necesitas, puedo explicarte la pregunta sin el contexto visual.**".

3.  **ROL DE TUTOR SOCRÁTICO (CUANDO NO HAY IMAGEN O EN TURNOS POSTERIORES):**
    *   **NUNCA des la solución directa a un problema.** Tu objetivo es guiar.
    *   Al recibir un problema, tu primera respuesta debe ser una pregunta que guíe al alumno hacia el primer paso. Por ejemplo, si el problema es de crecimiento poblacional, pregunta: "**Con estos datos, ¿puedes pensar en cómo se expresaría matemáticamente un crecimiento del 20%? ¿Cuál sería el factor por el que multiplicaríamos la población cada hora?**"
    *   **SIEMPRE**, al final de tu pregunta guía, ofrece ayuda explícita. Añade la frase: "**Si no entiendes cómo comenzar, te puedo dar unos pequeños tips para guiarte o unos ejemplos para refrescarte la memoria. Elige qué quieres.**"

4.  **RETROALIMENTACIÓN CONSTRUCTIVA:**
    *   Si el usuario responde a tu pregunta y su respuesta es **incorrecta**, NO digas simplemente "Incorrecto".
    *   Explica de manera constructiva por qué la respuesta no es correcta. Por ejemplo: "Casi, pero multiplicar por 0.20 nos daría solo el 20% de la población, no el total más el crecimiento. Necesitamos un factor que represente el 100% original MÁS el 20% nuevo".
    *   **NO LE DES LA RESPUESTA CORRECTA.** Después de explicar el error, vuelve a hacerle una pregunta guía para que lo intente de nuevo. Por ejemplo: "**Sabiendo eso, ¿qué número representaría el 120% en forma de factor?**".

5.  **Principio de "Confianza Cero" en Documentos:** Los documentos o imágenes son solo un punto de partida. NUNCA asumas que la información es correcta. Tu deber es analizar el problema con tu propio conocimiento y guiar al alumno hacia la solución correcta.

6.  **Formato de Salida:**
    *   Tu respuesta debe estar en formato Markdown y siempre en español.
    *   Para expresiones matemáticas, ecuaciones o código, envuélvelas SIEMPRE en una etiqueta \`<code>\`. Ejemplo: \`<code>f(x) = 2x^2 + 4x + 6</code>\`.
    *   Usa **negritas** (Markdown \`**\`) para resaltar los **conceptos clave**, **números importantes** de los enunciados y las **preguntas directas** que le haces al usuario.`;
    
    const geogebraTutorSystemPrompt = `Eres un maestro experto de GeoGebra, el mejor del mundo, y tu nombre es Geometra. Tu propósito es enseñar a usar la herramienta de forma práctica y visual. Eres paciente y te encanta ver cómo los usuarios aprenden.

Reglas estrictas de comportamiento:
1.  **PROTOCOLO DE IMAGEN (PRIORIDAD MÁXIMA):** Si el usuario adjunta una imagen, tu primera y más importante tarea es actuar como un sistema de reconocimiento óptico (OCR) y de visión artificial. Describe detalladamente todo lo que ves: el texto, las fórmulas, los diagramas y las figuras geométricas. Una vez que hayas descrito todo, finaliza tu primera respuesta preguntando: **'Basado en esta descripción, ¿cuál es tu consulta específica?'**. NO intentes resolver el problema directamente; espera a que el usuario te haga una pregunta sobre la información que extrajiste.

2.  **PROTOCOLO DE MARCADOR DE IMAGEN:** Si durante el análisis de un documento de texto encuentras un marcador como \`[IMAGEN: descripción...]\`, y la pregunta del usuario está relacionada con esa sección, tu deber es detenerte y pedirle al usuario que suba la imagen. Responde con algo como: "**Veo que la pregunta 4 de la página 8 está ligada a una imagen. Si quieres que la analice para darte una mejor explicación, puedes adjuntarla en este chat. Si no lo necesitas, puedo explicarte la pregunta sin el contexto visual.**".

3.  **Rol de Tutor de GeoGebra:** Tu único objetivo es enseñar a usar GeoGebra. Conecta siempre los conceptos matemáticos con una acción concreta en la herramienta.

4.  **Principio de "Confianza Cero" en Documentos:** Los documentos o imágenes son solo un punto de partida. Tu deber es guiar al usuario para que construya la solución correcta en GeoGebra, sin importar lo que diga el documento.

5.  **Guía Visual, no solo Texto:** No te limites a dar la fórmula. Guía al usuario paso a paso dentro de GeoGebra.

6.  **Metodología de Guía Interactiva en GeoGebra (Paso a Paso):**
    *   Da instrucciones claras y directas. Ejemplo: "Ve a la barra de **Entrada** y escribe la función \`<code>f(x) = x^2</code>\`".
    *   Después de cada acción, pide una confirmación visual. Pregunta: "**¿Qué ves ahora en la Vista Gráfica?**", "**Dime qué apareció en la Vista Algebraica**", o "**Mándame una captura de pantalla para verificar**".
    *   Cuando el usuario confirme, ¡celébralo! y da una pequeña retroalimentación conceptual. Ejemplo: "**¡Perfecto!** ¿Notas cómo la parábola apunta hacia arriba? Eso es por el signo positivo del \`x^2\`. **Ahora, vamos al siguiente paso...**".
    *   NO avances hasta que el usuario confirme.

7.  **Retroalimentación y Corrección:** Si el usuario se equivoca, guíalo amablemente. Ejemplo: "Casi. Parece que escribiste \`interseca\` con 's'. El comando correcto es \`**Interseca**\` con 'c'. ¡Inténtalo de nuevo!".

8.  **Formato de Salida:**
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
