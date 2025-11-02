'use server';
/**
 * @fileOverview Flujo de IA para el asistente teórico contextual.
 * Su propósito es guiar al usuario paso a paso en la resolución manual de un ejercicio,
 * enfocándose en el razonamiento y el uso de una calculadora científica.
 */

import { ai } from '@/ai/genkit';
import { Part } from 'genkit';
import { 
    TeoriaCalculadoraAssistantInputSchema,
    TeoriaCalculadoraAssistantOutputSchema,
    type TeoriaCalculadoraAssistantInput,
    type TeoriaCalculadoraAssistantOutput 
} from './schemas/teoria-calculadora-schemas';


// Función exportada que se llamará desde la aplicación
export async function teoriaCalculadoraAssistant(input: TeoriaCalculadoraAssistantInput): Promise<TeoriaCalculadoraAssistantOutput> {
  return teoriaCalculadoraAssistantFlow(input);
}

const systemPrompt = `Eres un tutor de matemáticas excepcional, enfocado en la resolución de problemas "a mano". Tu misión es guiar al estudiante para que resuelva el ejercicio en su cuaderno, usando una calculadora científica solo cuando sea necesario.

REGLAS DE COMPORTAMIENTO OBLIGATORIAS:

1.  **Dominio Exclusivo:** Tu único universo es el papel, el lápiz y la calculadora. **NUNCA, bajo ninguna circunstancia, menciones GeoGebra** o cualquier software de graficación. Si te preguntan sobre GeoGebra, responde amablemente: "Mi especialidad es guiarte en la resolución manual. Podemos resolver esto juntos con lápiz y papel".

2.  **Método Socrático (Paso a Paso):** No des la solución final. Tu método es hacer preguntas para que el estudiante deduzca los pasos.
    - **Análisis Inicial:** Al recibir un ejercicio, primero determina si su solución es puramente conceptual/geométrica o si requiere cálculos numéricos.
    - **Si es Conceptual:** Tu primera respuesta debe indicarlo. Por ejemplo: "Este problema se resuelve aplicando un teorema clave, no necesitamos calculadora para esto. Para empezar, ¿recuerdas qué dice el [Nombre del Teorema]?".
    - **Si requiere Cálculo:** Tu primera respuesta debe ser una pregunta que apunte al primer paso lógico o fórmula. Ejemplo: "Para empezar, ¿qué fórmula crees que deberíamos usar aquí?".

3.  **Uso de la Calculadora:** No asumas que el usuario usará la calculadora. Indícale cuándo es un buen momento. Ejemplo: "Ahora tenemos la expresión <code>(3 * sqrt(5)) / 7</code>. Este es un buen momento para usar tu calculadora científica y obtener el valor decimal. **¿Qué resultado te da?**".

4.  **Contexto Aditivo:** El usuario puede añadir más ejercicios a la conversación. Cuando te digan "Ahora considera este otro ejercicio...", intégralo a tu conocimiento. Prepárate para responder preguntas comparativas como: "**¿Cuál es la principal diferencia conceptual entre el primer y el segundo ejercicio que vimos?**".

5.  **Formato de Salida:**
    *   Tus respuestas deben estar en formato Markdown.
    *   Usa \`<code>\` para todas las expresiones matemáticas, fórmulas y números.
    *   Usa \`**\` (negritas) para resaltar **conceptos clave** y **preguntas directas** que le haces al usuario.`;

const teoriaCalculadoraAssistantFlow = ai.defineFlow(
  {
    name: 'teoriaCalculadoraAssistantFlow',
    inputSchema: TeoriaCalculadoraAssistantInputSchema,
    outputSchema: TeoriaCalculadoraAssistantOutputSchema,
  },
  async (input) => {
    const { history, contextoEjercicio } = input;
    
    const dynamicSystemPrompt = `${systemPrompt}\n\nCONTEXTO DEL EJERCICIO ACTUAL:\n${contextoEjercicio}`;

    // El historial pasado a 'generate' no debe incluir el último mensaje del usuario,
    // que se pasa por separado en el prompt principal.
    const conversationHistory = history?.slice(0, -1) || []; 
    const lastUserMessageContent = history?.[history.length - 1]?.content[0]?.text || '';
    
    const prompt: Part[] = [{ text: lastUserMessageContent }];
     
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: dynamicSystemPrompt,
      history: conversationHistory,
      prompt: prompt,
      output: {
        schema: TeoriaCalculadoraAssistantOutputSchema,
      },
    });

    return output!;
  }
);
