'use server';
/**
 * @fileOverview Flujo de IA para el asistente contextual de la sección Funciones y Matrices.
 * Su propósito es guiar al usuario paso a paso en la resolución de un ejercicio dentro de GeoGebra.
 */

import { ai } from '@/ai/genkit';
import { Part } from 'genkit';
import { 
    FuncionesMatricesAssistantInputSchema,
    FuncionesMatricesAssistantOutputSchema,
    type FuncionesMatricesAssistantInput,
    type FuncionesMatricesAssistantOutput 
} from './schemas/funciones-matrices-schemas';


// Función exportada que se llamará desde la aplicación
export async function funcionesMatricesAssistant(input: FuncionesMatricesAssistantInput): Promise<FuncionesMatricesAssistantOutput> {
  return funcionesMatricesAssistantFlow(input);
}

const systemPrompt = `Eres un tutor de GeoGebra experto, paciente y amigable. Tu única misión es guiar al usuario, paso a paso, para que resuelva un ejercicio específico **dentro de la herramienta GeoGebra**. También puedes analizar capturas de pantalla de la pizarra de GeoGebra para darle feedback.

REGLAS DE COMPORTAMIENTO ESTRICTAS:
1.  **USA EL MATERIAL PROPORCIONADO:** El usuario te enviará una guía completa para un ejercicio. Tu ÚNICA fuente de conocimiento es ese material. Sigue las instrucciones y los pasos que contiene al pie de la letra. No inventes nada.
2.  **NO DES LA RESPUESTA FINAL:** Tu objetivo es que el alumno descubra la solución, no que tú se la des.
3.  **GUÍA PASO A PASO:** Da solo una instrucción o haz una pregunta a la vez, tal como lo indica la guía. Espera la respuesta del alumno antes de continuar.
4.  **PIDE CONFIRMACIÓN VISUAL:** Haz preguntas como "**¿Qué ves ahora en la Vista Gráfica?**", "**¿Qué punto se acaba de crear?**" o "**Inténtalo y dime qué resultado te aparece**".
5.  **BOTÓN DE REGRESO:** Cuando la guía indique que el ejercicio está resuelto, tu último mensaje DEBE ser una felicitación y terminar con el botón de acción: \`[button:Volver al Ejercicio]\`.
6.  **ANÁLISIS DE CAPTURA DE PANTALLA:** Si el usuario te envía una imagen, tu rol es ser un supervisor.
    - Analiza la construcción en GeoGebra que se ve en la imagen.
    - Compárala con los pasos de la guía que están resolviendo.
    - Dale una retroalimentación constructiva. Ejemplo: "**Veo que ya dibujaste la circunferencia, ¡muy bien! Ahora, según el paso 2, necesitas crear los puntos A, B y C. ¿Necesitas ayuda con eso?**".
    - Finaliza siempre tu análisis con una pregunta para seguir guiándolo.`;

const funcionesMatricesAssistantFlow = ai.defineFlow(
  {
    name: 'funcionesMatricesAssistantFlow',
    inputSchema: FuncionesMatricesAssistantInputSchema,
    outputSchema: FuncionesMatricesAssistantOutputSchema,
  },
  async (input) => {
    const { history, userQuery, screenshotDataUri, initialSystemPrompt } = input;
    const prompt: Part[] = [];
    
    // El prompt de sistema se construye dinámicamente
    let dynamicSystemPrompt = systemPrompt;
    
    // Si es el primer turno, el 'initialSystemPrompt' contiene la guía. Lo inyectamos en el prompt del sistema.
    if (initialSystemPrompt) {
        dynamicSystemPrompt += `\n\nCONTEXTO OBLIGATORIO (GUÍA DEL EJERCICIO):\n${initialSystemPrompt}`;
    }

    // Add the screenshot to the prompt if it exists
    if (screenshotDataUri) {
      prompt.push({ media: { url: screenshotDataUri } });
    }
    
    let fullQuery = userQuery || 'El usuario acaba de abrir el chat, preséntate y da la primera instrucción de la guía.';
    
    if (fullQuery.trim()) {
      prompt.push({ text: fullQuery });
    }
     
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: dynamicSystemPrompt,
      history: history || undefined,
      prompt: prompt,
      output: {
        schema: FuncionesMatricesAssistantOutputSchema,
      },
    });

    return output!;
  }
);
