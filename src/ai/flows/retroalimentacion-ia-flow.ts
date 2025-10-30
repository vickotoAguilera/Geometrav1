'use server';
/**
 * @fileOverview Flujo de Genkit para el tutor de IA que proporciona retroalimentación.
 *
 * - retroalimentacion - Evalúa la respuesta de un alumno y proporciona retroalimentación.
 * - RetroalimentacionInput - El tipo de entrada para el flujo.
 * - RetroalimentacionOutput - El tipo de salida del flujo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PreguntaSchema } from './generador-pruebas-flow';

// Esquema de entrada para el flujo de retroalimentación
export const RetroalimentacionInputSchema = z.object({
  pregunta: PreguntaSchema.describe('La pregunta completa que se está evaluando.'),
  respuestaUsuario: z.string().describe('La respuesta proporcionada por el usuario.'),
  evidenciaUsuario: z.string().optional().describe('Argumento o texto proporcionado por el usuario que cuestiona la corrección.'),
});
export type RetroalimentacionInput = z.infer<typeof RetroalimentacionInputSchema>;


// Esquema de salida para el flujo de retroalimentación
export const RetroalimentacionOutputSchema = z.object({
  esCorrecta: z.boolean().describe('Indica si la respuesta del usuario es correcta.'),
  feedback: z.string().describe('La explicación detallada, paso a paso, para el usuario. Si la respuesta es correcta, es un mensaje de felicitación. Si es incorrecta, es una guía para entender el error. Si hay autocorrección, se debe indicar.'),
  autocorreccion: z.boolean().describe('Indica si la IA ha tenido que corregir su propia evaluación inicial basándose en la evidencia del usuario.'),
});
export type RetroalimentacionOutput = z.infer<typeof RetroalimentacionOutputSchema>;


// Función exportada que se llamará desde la aplicación
export async function retroalimentacion(input: RetroalimentacionInput): Promise<RetroalimentacionOutput> {
  return retroalimentacionIAFlow(input);
}


const retroalimentacionPrompt = ai.definePrompt({
  name: 'retroalimentacionPrompt',
  input: { schema: RetroalimentacionInputSchema },
  output: { schema: RetroalimentacionOutputSchema },
  prompt: `
    Actúas como un tutor de matemáticas y analista extremadamente lógico y metódico. Tu principal cualidad es la precisión. Revisa tus propios razonamientos y cálculos al menos dos veces antes de dar una respuesta para minimizar errores.

    TAREA PRINCIPAL:
    Evalúa la respuesta de un alumno a una pregunta de matemáticas.

    CONTEXTO:
    - Pregunta: {{{pregunta}}}
    - Respuesta Correcta (según el generador): {{pregunta.respuestaCorrecta}}
    - Respuesta del Alumno: {{{respuestaUsuario}}}

    PASOS A SEGUIR:

    1.  **ANÁLISIS DE LA RESPUESTA DEL ALUMNO:**
        - Para preguntas de 'respuesta-corta', determina si la respuesta del alumno es matemáticamente equivalente a la respuesta correcta. Por ejemplo, '0.5' es equivalente a '1/2'. Sé flexible con formatos, pero estricto con el valor numérico.
        - Para preguntas de 'seleccion-multiple', compara la respuesta del alumno con la alternativa correcta.

    2.  **GENERACIÓN DE FEEDBACK:**
        - **Si la respuesta es CORRECTA:** Genera un mensaje de felicitación claro y conciso.
        - **Si la respuesta es INCORRECTA:**
            - Identifica el posible error conceptual del alumno (ej. error de signo, malentendido de la pregunta, etc.).
            - Proporciona una explicación clara y paso a paso del concepto subyacente.
            - Guía al alumno hacia la lógica de la respuesta correcta sin revelar la solución directamente al principio de la explicación.

    3.  **PROCESO DE AUTOCORRECCIÓN (SI APLICA):**
        - El alumno puede proporcionar un argumento o evidencia en el campo 'evidenciaUsuario'.
        - Si 'evidenciaUsuario' existe, tu prioridad MÁXIMA es analizar esa evidencia.
        - Compara la evidencia del alumno con la respuesta correcta original y tu propia evaluación.
        - **SI TE EQUIVOCASTE:** Admite tu error humildemente. Ajusta tu evaluación, marca 'esCorrecta' como 'true', 'autocorreccion' como 'true' y proporciona una nueva explicación que reconozca la validez del argumento del alumno.
        - **SI EL ALUMNO ESTÁ EQUIVOCADO:** Refuta amablemente la evidencia del alumno, explicando por qué no es correcta y reafirmando tu explicación original. Marca 'autocorreccion' como 'false'.

    Genera el resultado en el formato JSON especificado.
  `,
});

// Definición del flujo de Genkit
const retroalimentacionIAFlow = ai.defineFlow(
  {
    name: 'retroalimentacionIAFlow',
    inputSchema: RetroalimentacionInputSchema,
    outputSchema: RetroalimentacionOutputSchema,
  },
  async (input) => {
    const { output } = await retroalimentacionPrompt(input);
    if (!output) {
      throw new Error('La IA de retroalimentación no pudo generar una respuesta.');
    }
    return output;
  }
);
