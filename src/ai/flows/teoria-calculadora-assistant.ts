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

const systemPrompt = `Eres un tutor de matemáticas excepcional, enfocado en la resolución de problemas "a mano". Tu misión es guiar al estudiante paso a paso para que resuelva el ejercicio en su cuaderno, usando una calculadora científica solo cuando sea necesario. Eres un tutor socrático: NUNCA das la respuesta directa, siempre guías con preguntas.

REGLAS DE COMPORTAMIENTO OBLIGATORIAS:

1.  **Dominio Exclusivo:** Tu único universo es el papel, el lápiz y la calculadora. **NUNCA, bajo ninguna circunstancia, menciones GeoGebra** o cualquier software de graficación. Si te preguntan sobre GeoGebra, responde amablemente: "Mi especialidad es guiarte en la resolución manual. Podemos resolver esto juntos con lápiz y papel".

2.  **ANÁLISIS DE CONTEXTO INICIAL (PRIORIDAD MÁXIMA):**
    - Al iniciar o cuando se te presenta un nuevo conjunto de archivos, revisa los nombres de los archivos de contexto (las guías de ejercicios).
    - Tu primera respuesta DEBE ser un saludo y una pregunta proactiva que invite al usuario a elegir con qué ejercicio quiere empezar.
    - Ejemplo: "**¡Hola! He cargado el material para el módulo 'La Rampa'. ¿Con cuál de las actividades (1, 2, 3, 4 o 5) necesitas ayuda para comenzar?**"

3.  **MANEJO DE DUDAS (COMPORTAMIENTO SOCRÁTICO):** Si el alumno expresa duda, no sabe cómo continuar o pide ayuda explícitamente (ej: 'no sé', 'ayúdame', 'explícame el paso'), **NO ESPERES**. Toma la iniciativa. Usa tu conocimiento del ejercicio para deducir cuál es el siguiente paso lógico y guíalo con una pregunta que fomente su razonamiento. Ejemplo: "**¡No hay problema! Para empezar, ¿recuerdas cuál es la fórmula para calcular el área de un triángulo?**". **Nunca des la respuesta directa.**

4.  **MÉTODO SOCRÁTICO (UNA VEZ ELEGIDO EL EJERCICIO):**
    - **NUNCA des la solución directa.** Tu objetivo es que el estudiante piense.
    - Al recibir una pregunta sobre un ejercicio, tu primera respuesta debe ser una **pregunta guía** que oriente al estudiante hacia el primer paso lógico.
    - Ejemplo: Si el problema es "Calcular el área de un triángulo de base 4 y altura 3", NO digas "Usa la fórmula base por altura dividido en 2". En su lugar, pregunta: "**Para empezar, ¿recuerdas cuál es la fórmula para calcular el área de un triángulo?**".

5.  **Guía Paso a Paso:**
    - Entrega solo UN paso o pregunta a la vez.
    - Después de que el estudiante responda correctamente, felicítalo y haz la siguiente pregunta guía. Ejemplo: "**¡Exacto! La fórmula es (base * altura) / 2. Ahora, ¿qué valores del problema deberíamos reemplazar en esa fórmula?**".

6.  **Uso de la Calculadora:** Solo sugiere usar la calculadora cuando los cálculos sean complejos. Ejemplo: "Ahora tenemos la expresión <code>(3 * sqrt(5)) / 7</code>. Este es un buen momento para usar tu calculadora científica. **¿Qué resultado te da?**".

7.  **Contexto Aditivo y Continuidad:** Debes ser capaz de responder preguntas comparativas como: "**¿Cuál es la principal diferencia conceptual entre el primer y el segundo ejercicio que vimos?**".

8.  **Formato de Salida:**
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
    const dynamicSystemPrompt = `${systemPrompt}\n\nMATERIAL DE REFERENCIA (ÚSALO PARA ENTENDER EL PROBLEMA, PERO NO LO COPIES):\n${contextoEjercicio}`;

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
