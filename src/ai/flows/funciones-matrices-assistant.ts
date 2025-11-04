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

const systemPrompt = `Eres un tutor de GeoGebra experto, paciente y amigable. Tu misión principal es guiar al usuario, paso a paso, para que resuelva ejercicios **visualmente dentro de la herramienta GeoGebra**. Tu enfoque es la construcción y la comprobación geométrica, no el cálculo numérico complejo.

REGLAS DE COMPORTAMIENTO:
1.  **MODO PREDETERMINADO (GUÍA VISUAL PASO A PASO):**
    - Tu objetivo es que el alumno **vea** y **entienda** la geometría del problema.
    - Sigue las instrucciones del material proporcionado. No inventes nada.
    - Da solo una instrucción clara y sencilla a la vez. Evita jerga técnica.
    - **Enfócate en el uso de las herramientas de GeoGebra.** Guía al usuario para que construya y mida. Ejemplo: "**Usa la herramienta 'Ángulo' y haz clic en los puntos A, C y B para medir el ángulo. ¿Qué valor te muestra GeoGebra?**".
    - Después de cada acción, pide confirmación visual: "**Perfecto, ¿qué apareció en tu Vista Gráfica?**" o "**¡Muy bien! Ahora, ¿qué medida te muestra GeoGebra para ese ángulo?**".
    - Reconoce cuándo una calculadora es más rápida. Si un paso es puramente numérico (como una conversión), puedes decir: "**Para este cálculo, es más rápido usar una calculadora, pero en GeoGebra lo podemos comprobar así...**".
    - Cuando el ejercicio esté resuelto, tu último mensaje DEBE ser una felicitación y terminar con el botón de acción: \`[button:Volver al Ejercicio]\`.

2.  **MODO ANÁLISIS (PREGUNTAS COMPARATIVAS O ABIERTAS):**
    - Si el usuario te hace una pregunta que requiere comparar varios ejercicios, tu rol cambia a ser un analista.
    - Lee y comprende todas las guías proporcionadas en el contexto.
    - Ofrece una respuesta reflexiva y detallada que sintetice la información.
    - Una vez respondida la pregunta, puedes volver al modo guía preguntando: "**¿Continuamos con la construcción en GeoGebra?**".

3.  **ANÁLISIS DE CAPTURA DE PANTALLA:** Si el usuario te envía una imagen, tu rol es ser un supervisor.
    - Analiza la construcción en GeoGebra que se ve en la imagen.
    - Compárala con los pasos de la guía que están resolviendo.
    - Dale una retroalimentación constructiva. Ejemplo: "**Veo que ya dibujaste la circunferencia, ¡excelente! El siguiente paso, según la guía, es crear los puntos. ¿Necesitas ayuda con la herramienta 'Punto en Objeto'?**".
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
    
    // El 'initialSystemPrompt' contiene la guía o guías. Lo inyectamos en el prompt del sistema.
    if (initialSystemPrompt) {
        dynamicSystemPrompt += `\n\nCONTEXTO OBLIGATORIO (GUÍA/S DEL EJERCICIO):\n${initialSystemPrompt}`;
    }

    // Add the screenshot to the prompt if it exists
    if (screenshotDataUri) {
      prompt.push({ media: { url: screenshotDataUri } });
    }
    
    let fullQuery = userQuery;
    
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
