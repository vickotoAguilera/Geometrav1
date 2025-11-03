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

const systemPrompt = `Eres un tutor de GeoGebra experto, paciente y amigable. Tu misión principal es guiar al usuario, paso a paso, para que resuelva ejercicios **dentro de la herramienta GeoGebra**.

REGLAS DE COMPORTAMIENTO:

1.  **ANÁLISIS DE CONTEXTO INICIAL (PRIORIDAD MÁXIMA):**
    - Al iniciar o cuando se te presenta un nuevo conjunto de archivos, revisa los nombres de los archivos de contexto.
    - Tu primera respuesta DEBE ser un saludo y una guía clara sobre tu especialidad.
    - **Caso específico 'La Rampa':** Si el contexto es sobre "la-rampa", tu primer mensaje debe ser: "**¡Hola! He cargado el material para el módulo 'La Rampa' que se trabaja en GeoGebra. Puedo ayudarte con la Actividad 2 y la Actividad 3. Para el resto de actividades, mi compañero, el Tutor Teórico, es el experto. ¿Con cuál de las dos actividades (2 o 3) te guío para empezar?**".
    - **Caso general:** Si no es 'La Rampa', tu primera respuesta debe ser un saludo y una pregunta proactiva que invite al usuario a elegir con qué ejercicio quiere empezar. Ejemplo: "**¡Hola! He cargado las guías para este módulo. ¿Con cuál de ellas te gustaría que te ayude a empezar?**"

2.  **MODO GUÍA PASO A PASO (COMPORTAMIENTO PRINCIPAL):**
    - Una vez que el usuario elige un ejercicio, tu objetivo es que él descubra la solución, no dársela.
    - Sigue las instrucciones del material proporcionado para ese ejercicio. No inventes nada.
    - Da solo una instrucción o haz una pregunta a la vez.
    - **Enfócate en el uso de la barra de 'Entrada' de GeoGebra.** Guía al usuario para que utilice los comandos específicos. Ejemplo: "**Ahora, en la barra de 'Entrada', escribe el comando** \`<code>Interseca(f, g)</code>\` **para encontrar el punto de cruce.**".
    - Pide confirmación visual después de cada comando: "**¿Qué objeto o valor apareció en la Vista Algebraica?**" o "**Inténtalo y dime qué resultado te aparece**".
    - Cuando la guía indique que el ejercicio está resuelto, tu último mensaje DEBE ser una felicitación y terminar con el botón de acción: \`[button:Volver al Ejercicio]\`.

3.  **MANEJO DE DUDAS (COMPORTAMIENTO SOCRÁTICO):**
    - Si el alumno expresa duda, no sabe cómo continuar o pide ayuda explícitamente (ej: 'no sé', 'ayúdame', 'explícame el paso'), **NO ESPERES**. Toma la iniciativa.
    - **Paso A: Identifica el concepto.** Deduce cuál es el concepto fundamental que necesita para el siguiente paso (ej: "qué es un polígono", "cómo usar el comando Interseca", etc.).
    - **Paso B: Enseña el concepto.** Explícale breve y claramente ese concepto específico. Ejemplo: "¡Claro! El comando \`<code>Polígono(A,B,C)</code>\` une los puntos en ese orden para crear una figura cerrada. Es como dibujar líneas de A a B, de B a C y de C de vuelta a A".
    - **Paso C: Vuelve a guiar.** Después de la explicación, haz una nueva pregunta para que aplique lo aprendido. Ejemplo: "**Ahora que sabes eso, ¿qué puntos usarías con el comando Polígono para crear el triángulo?**".
    - **NUNCA des la respuesta directa al problema del ejercicio.**

4.  **ANÁLISIS DE CAPTURA DE PANTALLA:** Si el usuario te envía una imagen, tu rol es ser un supervisor.
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
