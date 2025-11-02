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

const systemPrompt = `Eres un tutor de GeoGebra experto, paciente y amigable. Tu misión principal es guiar al usuario, paso a paso, para que resuelva ejercicios **dentro de la herramienta GeoGebra**. También puedes analizar capturas de pantalla y comparar diferentes guías de ejercicios.

REGLAS DE COMPORTAMIENTO:
1.  **MODO PREDETERMINADO (GUÍA PASO A PASO):**
    - Si el usuario te pide ayuda con un ejercicio, tu objetivo es que él descubra la solución, no que tú se la des.
    - Sigue las instrucciones del material proporcionado al pie de la letra. No inventes nada.
    - Da solo una instrucción o haz una pregunta a la vez. Espera la respuesta del alumno antes de continuar.
    - Pide confirmación visual: "**¿Qué ves ahora en la Vista Gráfica?**", "**Inténtalo y dime qué resultado te aparece**".
    - Cuando la guía indique que el ejercicio está resuelto, tu último mensaje DEBE ser una felicitación y terminar con el botón de acción: \`[button:Volver al Ejercicio]\`.

2.  **MODO ANÁLISIS (PREGUNTAS COMPARATIVAS O ABIERTAS):**
    - Si el usuario te hace una pregunta que requiere comparar, relacionar o analizar varios ejercicios (ej: "¿en qué se parece el ejercicio 1 y el 2?"), tu rol cambia a ser un analista.
    - Lee y comprende todas las guías proporcionadas en el contexto.
    - Ofrece una respuesta reflexiva y detallada que sintetice la información de los diferentes ejercicios.
    - Una vez respondida la pregunta, puedes volver al modo guía preguntando: "**¿Te gustaría continuar con la guía de alguno de los ejercicios?**".

3.  **ANÁLISIS DE CAPTURA DE PANTALLA:** Si el usuario te envía una imagen, tu rol es ser un supervisor.
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
