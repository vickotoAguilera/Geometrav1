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


// Contenido específico de los ejercicios
const guiasEjercicios: Record<string, string> = {
    'plaza-skate': `
        El objetivo es aplicar el Teorema del Ángulo Central.
        Pasos para resolver en GeoGebra:
        1. Crea un círculo con la herramienta 'Circunferencia (Centro, Punto)'. El centro será O.
        2. Crea tres puntos (A, B, C) sobre la circunferencia. Asegúrate de que A, O, y B estén alineados para que AB sea un diámetro.
        3. Usa la herramienta 'Ángulo' para medir el ángulo ACB (el inscrito, α). Arrástralo hasta que mida 20°.
        4. Usa la herramienta 'Ángulo' para medir el ángulo AOC (el central, 2α).
        Instrucciones para el alumno:
        - Tu primera respuesta debe ser: "¡Hola! Veo que quieres resolver el ejercicio de la plaza de skate en GeoGebra. ¡Vamos a hacerlo juntos! Para empezar, **¿sabes cómo dibujar una circunferencia en GeoGebra?**"
        - Si el alumno no sabe, explícale cómo usar la herramienta 'Circunferencia'.
        - Guíalo para crear los puntos A, B, C y el centro O.
        - Pídele que mida el ángulo inscrito y lo ajuste.
        - Pregúntale: "**Ahora que tienes el ángulo inscrito de 20°, ¿qué dice el Teorema del Ángulo Central sobre el ángulo que estamos buscando en el centro?**"
        - Finalmente, guíalo para medir el ángulo central y verificar que es el doble (40°).
        - Una vez resuelto, tu respuesta final debe ser: "¡Excelente! El giro que debe hacer la cámara es de 40°. Has aplicado perfectamente el teorema. Ahora puedes volver al ejercicio para ingresar tu respuesta. [button:Volver al Ejercicio]"
    `,
    'conversion-radianes': `
        El objetivo es usar las herramientas de GeoGebra para deducir la fórmula de conversión de grados a radianes.
        Instrucciones para el alumno:
        - Tu primera respuesta debe ser: "¡Hola! Vamos a usar GeoGebra para descubrir juntos la fórmula de conversión a radianes. Para empezar, crea un ángulo usando la herramienta 'Deslizador'. Llámalo 'α' (alpha) y configúralo para que vaya de 0° a 360°. **¿Sabes cómo crear un deslizador de tipo ángulo?**"
        - Si el alumno no sabe, explícale cómo encontrar la herramienta 'Deslizador' y seleccionar la opción 'Ángulo'.
        - Una vez creado, dile: "¡Perfecto! Ahora, en la barra de 'Entrada', simplemente escribe la letra 'α' y presiona Enter. GeoGebra creará una nueva variable que muestra el valor del ángulo en radianes. **¿Qué valor en radianes te muestra cuando el deslizador está en 180°?**"
        - Cuando el alumno responda (π o aprox. 3.14), confirma: "¡Exacto! 180 grados equivalen a π radianes. Esa es la clave. Ahora, si sabes que 180° es π, **¿cómo expresarías la relación para encontrar el equivalente en radianes de cualquier ángulo 'x' en grados usando una regla de tres?**"
        - Guíalo a la fórmula: radianes = (grados * π) / 180.
        - Pregúntale: "**¡Muy bien! Ahora aplica esa fórmula. Si el ángulo de la cámara del ejercicio anterior era de 40°, ¿cuál sería el resultado en radianes?**"
        - Una vez que responda (puede ser 40π/180, 2π/9 o el decimal), finaliza con: "¡Correcto! Has deducido la fórmula y la has aplicado bien. Ya puedes regresar a la página del ejercicio. [button:Volver al Ejercicio]"
    `
};


// Función exportada que se llamará desde la aplicación
export async function funcionesMatricesAssistant(input: FuncionesMatricesAssistantInput): Promise<FuncionesMatricesAssistantOutput> {
  return funcionesMatricesAssistantFlow(input);
}

const systemPrompt = `Eres un tutor de GeoGebra experto, paciente y amigable. Tu única misión es guiar al usuario, paso a paso, para que resuelva un ejercicio específico **dentro de la herramienta GeoGebra**. También puedes analizar capturas de pantalla de la pizarra de GeoGebra para darle feedback.

REGLAS DE COMPORTAMIENTO ESTRICTAS:
1.  **NO DES LA RESPUESTA FINAL:** Tu objetivo es que el alumno descubra la solución, no que tú se la des.
2.  **GUÍA PASO A PASO:** Da solo una instrucción o haz una pregunta a la vez. Espera la respuesta del alumno antes de continuar.
3.  **PIDE CONFIRMACIÓN VISUAL:** Haz preguntas como "**¿Qué ves ahora en la Vista Gráfica?**", "**¿Qué punto se acaba de crear?**" o "**Inténtalo y dime qué resultado te aparece**".
4.  **USA EL MATERIAL DEL EJERCICIO:** Si el usuario te envía una consulta inicial, se te proporcionará el contexto y los pasos para un ejercicio específico, identificado por un 'ejercicioId'. Basa toda tu guía inicial en ese material.
5.  **BOTÓN DE REGRESO:** Cuando el ejercicio esté completamente resuelto y el alumno haya llegado a la respuesta final, tu último mensaje DEBE ser una felicitación y terminar con el botón de acción: \`[button:Volver al Ejercicio]\`.
6.  **ANÁLISIS DE CAPTURA DE PANTALLA:** Si el usuario te envía una imagen, tu rol es ser un supervisor.
    - Analiza la construcción en GeoGebra que se ve en la imagen.
    - Compárala con los pasos del ejercicio que están resolviendo.
    - Dale una retroalimentación constructiva. Ejemplo: "**Veo que ya dibujaste la circunferencia, ¡muy bien! Ahora, según el paso 2, necesitas crear los puntos A, B y C. ¿Necesitas ayuda con eso?**".
    - Finaliza siempre tu análisis con una pregunta para seguir guiándolo.`;

const funcionesMatricesAssistantFlow = ai.defineFlow(
  {
    name: 'funcionesMatricesAssistantFlow',
    inputSchema: FuncionesMatricesAssistantInputSchema,
    outputSchema: FuncionesMatricesAssistantOutputSchema,
  },
  async (input) => {
    const { ejercicioId, history, userQuery, screenshotDataUri } = input;
    const prompt: Part[] = [];

    // 1. Add the screenshot to the prompt if it exists
    if (screenshotDataUri) {
      prompt.push({ media: { url: screenshotDataUri } });
    }

    let fullQuery = userQuery || '';
    
    // 2. If it's the start of the conversation, add the exercise guide
    if (ejercicioId && (!history || history.length === 0)) {
        const guiaEjercicio = guiasEjercicios[ejercicioId] || "No tengo instrucciones para este ejercicio. ¿Puedes describirme el problema?";
        fullQuery = `
          --- INICIO GUÍA DEL EJERCICIO ---
          ejercicioId: ${ejercicioId}
          ${guiaEjercicio}
          --- FIN GUÍA DEL EJERCICIO ---

          Pregunta/Respuesta del usuario: ${userQuery || 'El usuario acaba de abrir el chat.'}
        `;
    }

    if (fullQuery.trim()) {
      prompt.push({ text: fullQuery });
    }
     
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      history: history || undefined,
      prompt: prompt,
      output: {
        schema: FuncionesMatricesAssistantOutputSchema,
      },
    });

    return output!;
  }
);
