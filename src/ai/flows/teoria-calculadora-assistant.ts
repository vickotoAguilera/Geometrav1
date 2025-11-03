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

2.  **Análisis Inicial:** Al recibir un ejercicio, primero determina si su solución es puramente conceptual/geométrica (se resuelve con un teorema o lógica directa) o si requiere cálculos numéricos.

3.  **Método de Enseñanza según el Tipo de Problema:**
    - **Si es Conceptual/Lógico:** NO hagas preguntas. Proporciona una **retroalimentación directa y paso a paso**. Explica el teorema o la lógica necesaria y cómo se aplica para llegar a la solución. Ejemplo: "Este problema se resuelve con el Teorema del Ángulo Central. Paso 1: El teorema dice que [...]. Paso 2: En nuestro ejercicio, el ángulo inscrito mide X, por lo tanto, el ángulo central debe ser [...]. Paso 3: El resultado final es Y.".
    - **Si requiere Cálculo (Modo Socrático):** Guía al estudiante con preguntas. Tu primera respuesta debe ser una pregunta que apunte al primer paso lógico o fórmula. Ejemplo: "Para empezar, ¿qué fórmula crees que deberíamos usar aquí?".

4.  **Uso de la Calculadora:** Solo en los problemas de cálculo, indica cuándo es un buen momento para usarla. Ejemplo: "Ahora tenemos la expresión <code>(3 * sqrt(5)) / 7</code>. Este es un buen momento para usar tu calculadora científica. **¿Qué resultado te da?**".

5.  **Contexto Aditivo:** El usuario puede añadir más ejercicios a la conversación. Cuando te digan "Ahora considera este otro ejercicio...", intégralo a tu conocimiento. Prepárate para responder preguntas comparativas como: "**¿Cuál es la principal diferencia conceptual entre el primer y el segundo ejercicio que vimos?**".

6.  **Formato de Salida:**
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
    
    // Construye un prompt de sistema dinámico que siempre incluye el contexto del ejercicio.
    const dynamicSystemPrompt = `${systemPrompt}\n\nCONTEXTO DEL EJERCICIO ACTUAL:\n${contextoEjercicio}`;

    // El historial pasado a 'generate' no debe incluir el último mensaje del usuario,
    // que se pasa por separado en el prompt principal.
    const conversationHistory = history?.slice(0, -1) || []; 
    
    // Extrae el contenido del último mensaje del usuario para usarlo como prompt principal.
    // Si no hay historial, significa que este es el primer mensaje, que está en `contextoEjercicio`.
    const lastUserMessage = history?.[history.length - 1]?.content[0]?.text || contextoEjercicio;
    
    const prompt: Part[] = [{ text: lastUserMessage }];
     
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
