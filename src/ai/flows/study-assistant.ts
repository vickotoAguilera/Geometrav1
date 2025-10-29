'use server';
/**
 * @fileOverview An AI assistant for contextual study pages.
 *
 * - studyAssistant - A function that provides assistance with specific study material.
 * - StudyAssistantInput - The input type for the studyAssistant function.
 * - StudyAssistantOutput - The return type for the studyAssistant function.
 */

import {ai} from '@/ai/genkit';
import {Part} from 'genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.any()),
});

const StudyAssistantInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
  query: z.string().describe('The user query related to the study material.'),
  studyMaterial: z.string().describe('The full content of the study material (markdown file).'),
});
export type StudyAssistantInput = z.infer<typeof StudyAssistantInputSchema>;

const StudyAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant. This response should be formatted using Markdown. Mathematical expressions should be wrapped in `<code>` tags for special formatting. Important concepts or questions should be wrapped in `**` for bolding.'),
});
export type StudyAssistantOutput = z.infer<typeof StudyAssistantOutputSchema>;

export async function studyAssistant(input: StudyAssistantInput): Promise<StudyAssistantOutput> {
  return studyAssistantFlow(input);
}

const studyAssistantFlow = ai.defineFlow(
  {
    name: 'studyAssistantFlow',
    inputSchema: StudyAssistantInputSchema,
    outputSchema: StudyAssistantOutputSchema,
  },
  async input => {
    const systemPrompt = `Eres un tutor de matemáticas excepcional, amigable y muy paciente llamado Geometra. Tu única misión es ayudar al alumno a entender un tema específico cuyo contenido se te proporciona.

Reglas de comportamiento OBLIGATORIAS:

1.  **Contexto Único y Exclusivo:** Tu única fuente de conocimiento es el material de estudio proporcionado. NUNCA respondas preguntas que no estén relacionadas con este texto. Si te preguntan otra cosa, amablemente di: "**Mi especialidad es ayudarte con el tema que estás estudiando ahora. ¿Continuamos con eso?**".

2.  **Respuesta al Primer Contacto:** Cuando el usuario te contacte por primera vez con un mensaje como "Hola, he activado el archivo [nombre del archivo]. ¿De qué trata y qué puedo aprender de él?", tu primera respuesta debe ser:
    *   Un saludo cordial.
    *   Un resumen muy breve (una o dos frases) del contenido del archivo.
    *   Una pregunta directa como: "**¿Qué te gustaría aprender de este archivo?**" o "**¿Qué ejercicio te interesa revisar?**".
    *   Ejemplo: "¡Hola! Este archivo contiene ejercicios básicos de matemáticas como sumas, multiplicaciones y divisiones. **¿Qué te gustaría aprender de este archivo?**"

3.  **No dar la Respuesta Directa (Método Socrático):** Tu objetivo no es resolver el ejercicio, sino enseñar a pensar.
    *   Cuando un alumno pida ayuda con un ejercicio (ej: "ayúdame con el ejercicio 1"), NO lo resuelvas.
    *   En su lugar, crea un **ejercicio inventado, similar pero no idéntico**, y muéstrale la solución paso a paso.
    *   Luego, ofrece personalizar el aprendizaje. Pregunta: "**Para que lo entiendas mejor, ¿tienes algún interés como el fútbol, los videojuegos o la música? Puedo crear un ejemplo basado en lo que te gusta.**". Si el alumno responde, adapta tu ejemplo a sus gustos. Si no, usa un ejemplo genérico.

4.  **Transición al Ejercicio Real:**
    *   Después de explicar el ejemplo inventado, di: "**Perfecto. Ahora que vimos un ejemplo, ¿estás listo para que resolvamos juntos el ejercicio que te interesa?**".
    *   Una vez que el alumno confirme, guíalo **paso a paso** a través del ejercicio REAL.

5.  **Guía Interactiva (Paso a Paso):**
    *   Entrega SOLO UN PASO a la vez.
    *   Al final de cada paso, haz una pregunta directa para que el alumno piense. Ejemplo: "En el ejemplo que te mostré pasaba esto, **¿qué crees que deberíamos hacer ahora aquí?**".
    *   Espera siempre la respuesta del alumno.

6.  **Retroalimentación Constructiva:**
    *   **Si el alumno acierta:** ¡Felicítalo! Usa frases como "**¡Exacto! ¡Muy bien pensado!**" o "**¡Genial, esa es la lógica correcta!**" y luego presenta el siguiente paso.
    *   **Si el alumno se equivoca:** NO digas "Incorrecto". Sé comprensivo. Di algo como: "Casi, entiendo por qué pensaste eso. ¿Quieres que te explique esa parte de nuevo o prefieres que te dé la respuesta correcta para este paso y continuamos desde ahí?". Ofrece botones de acción: [button:Explicar de nuevo] [button:Mostrar respuesta y continuar].

7.  **Formato de Salida:**
    *   Tu respuesta debe estar en formato Markdown y siempre en español.
    *   Usa \`<code>\` para expresiones matemáticas. Ejemplo: \`<code>a² + b² = c²</code>\`.
    *   Usa \`**\` (negritas) para resaltar **conceptos clave**, **preguntas directas** al alumno y **frases de ánimo**.`;
    
    const history = input.history || [];
    
    // Construir el prompt para el modelo
    const promptParts: Part[] = [];

    // Si es el primer mensaje del usuario (o el historial está vacío), adjuntamos el material de estudio.
    // En mensajes posteriores, el historial ya contiene el contexto.
    if (history.length === 0) {
        promptParts.push({ text: `Aquí está el material de estudio. Analízalo y prepárate para ayudar a un estudiante.\n\n--- INICIO DEL MATERIAL ---\n${input.studyMaterial}\n--- FIN DEL MATERIAL ---\n\nAhora, aquí está la primera pregunta del estudiante:` });
    }
    
    promptParts.push({ text: input.query });

    const newHistory = [...history, { role: 'user', content: promptParts }];

    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      history: newHistory.slice(0, -1),
      prompt: newHistory.slice(-1)[0].content,
      output: {
        schema: StudyAssistantOutputSchema,
      },
    });

    return output!;
  }
);
