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
        El objetivo es encontrar la fórmula para convertir grados a radianes.
        Información clave: π radianes = 180°.
        Instrucciones para el alumno:
        - Tu primera respuesta debe ser: "¡Hola! Vamos a resolver juntos cómo convertir grados a radianes. La pista clave es que **180 grados equivalen a π radianes**. Sabiendo eso, si tenemos un ángulo 'x' en grados, **¿qué operación matemática (una regla de tres simple) harías para encontrar su equivalente en radianes?**"
        - Guíalo para que plantee la proporción: (radianes / π) = (grados / 180).
        - Ayúdalo a despejar 'radianes' para llegar a la fórmula: radianes = (grados * π) / 180.
        - Pregúntale: "**Perfecto. Entonces, si el ángulo de la cámara del ejercicio anterior era de 40°, ¿cuál sería el resultado en radianes usando la fórmula que encontramos?**"
        - Una vez que responda (puede ser 40π/180, 2π/9 o el decimal), finaliza con: "¡Muy bien! Esa es la expresión correcta. Has deducido la fórmula de conversión. Ya puedes regresar a la página del ejercicio. [button:Volver al Ejercicio]"
    `
};


// Función exportada que se llamará desde la aplicación
export async function funcionesMatricesAssistant(input: FuncionesMatricesAssistantInput): Promise<FuncionesMatricesAssistantOutput> {
  return funcionesMatricesAssistantFlow(input);
}

const systemPrompt = `Eres un tutor de GeoGebra experto, paciente y amigable. Tu única misión es guiar al usuario, paso a paso, para que resuelva un ejercicio específico **dentro de la herramienta GeoGebra**.

REGLAS DE COMPORTAMIENTO ESTRICTAS:
1.  **NO DES LA RESPUESTA FINAL:** Tu objetivo es que el alumno descubra la solución, no que tú se la des.
2.  **GUÍA PASO A PASO:** Da solo una instrucción o haz una pregunta a la vez. Espera la respuesta del alumno antes de continuar.
3.  **PIDE CONFIRMACIÓN VISUAL:** Haz preguntas como "**¿Qué ves ahora en la Vista Gráfica?**", "**¿Qué punto se acaba de crear?**" o "**Inténtalo y dime qué resultado te aparece**".
4.  **USA EL MATERIAL DEL EJERCICIO:** A continuación se te proporcionará el contexto y los pasos para un ejercicio específico, identificado por un 'ejercicioId'. Basa toda tu guía en ese material.
5.  **BOTÓN DE REGRESO:** Cuando el ejercicio esté completamente resuelto y el alumno haya llegado a la respuesta final, tu último mensaje DEBE ser una felicitación y terminar con el botón de acción: \`[button:Volver al Ejercicio]\`.`;

const funcionesMatricesAssistantFlow = ai.defineFlow(
  {
    name: 'funcionesMatricesAssistantFlow',
    inputSchema: FuncionesMatricesAssistantInputSchema,
    outputSchema: FuncionesMatricesAssistantOutputSchema,
  },
  async (input) => {
    const { ejercicioId, history, userQuery } = input;

    const guiaEjercicio = guiasEjercicios[ejercicioId] || "No tengo instrucciones para este ejercicio. ¿Puedes describirme el problema?";

    const fullQuery = `
      --- INICIO GUÍA DEL EJERCICIO ---
      ejercicioId: ${ejercicioId}
      ${guiaEjercicio}
      --- FIN GUÍA DEL EJERCICIO ---

      Pregunta/Respuesta del usuario: ${userQuery || (history && history.length > 0 ? '' : 'El usuario acaba de abrir el chat.')}
    `;

    const newHistory: Part[] = (history || []).map(m => ({
        role: m.role,
        content: m.content.map(c => ({ text: c.text }))
    }));

    if (userQuery) {
        newHistory.push({ role: 'user', content: [{ text: userQuery }]});
    }
     
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      prompt: [{ text: fullQuery }],
      history: newHistory.length > 0 ? newHistory : undefined,
      output: {
        schema: FuncionesMatricesAssistantOutputSchema,
      },
    });

    return output!;
  }
);
