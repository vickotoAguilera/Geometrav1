'use server';
/**
 * @fileOverview Flujo de Genkit para generar pruebas de matemáticas dinámicas.
 *
 * - generarPrueba - Genera una prueba basada en un tema, número de preguntas y tipo de prueba.
 * - GeneradorPruebasInput - El tipo de entrada para el flujo.
 * - Pregunta - El tipo que define la estructura de una pregunta generada.
 * - GeneradorPruebasOutput - El tipo de salida, que es un array de Preguntas.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Esquema para las preguntas de Selección Múltiple
const PreguntaSeleccionMultipleSchema = z.object({
  tipo: z.literal('seleccion-multiple'),
  pregunta: z.string().describe('El enunciado claro y conciso de la pregunta.'),
  alternativas: z.array(z.string()).length(5).describe('Un arreglo de 5 alternativas, donde una es la correcta y las otras cuatro son distractores plausibles.'),
  respuestaCorrecta: z.string().describe('El texto exacto de la alternativa correcta.'),
  justificacion: z.string().describe('Una explicación clara y paso a paso de por qué esa es la respuesta correcta.'),
});

// Esquema para las preguntas de Respuesta Corta
const PreguntaRespuestaCortaSchema = z.object({
  tipo: z.literal('respuesta-corta'),
  pregunta: z.string().describe('El enunciado claro y conciso de la pregunta, que solicita una respuesta numérica o textual breve.'),
  respuestaCorrecta: z.string().describe('La respuesta exacta y precisa a la pregunta.'),
});

// Unión de ambos tipos de preguntas
export const PreguntaSchema = z.union([
  PreguntaSeleccionMultipleSchema,
  PreguntaRespuestaCortaSchema,
]);
export type Pregunta = z.infer<typeof PreguntaSchema>;

// Esquema para la entrada del flujo
export const GeneradorPruebasInputSchema = z.object({
  tema: z.string().describe('El tema central de la prueba. Ejemplo: "Teorema de Pitágoras".'),
  cantidadPreguntas: z.number().int().positive().describe('El número de preguntas que debe contener la prueba.'),
  tipoPrueba: z.enum(['seleccion-multiple', 'respuesta-corta']).describe('El formato de las preguntas a generar.'),
});
export type GeneradorPruebasInput = z.infer<typeof GeneradorPruebasInputSchema>;

// Esquema para la salida del flujo
export const GeneradorPruebasOutputSchema = z.object({
  preguntas: z.array(PreguntaSchema),
});
export type GeneradorPruebasOutput = z.infer<typeof GeneradorPruebasOutputSchema>;

// Función exportada que se llamará desde la aplicación
export async function generarPrueba(input: GeneradorPruebasInput): Promise<GeneradorPruebasOutput> {
  return generadorDePruebasFlow(input);
}

// Definición del prompt para Genkit
const generadorDePruebasPrompt = ai.definePrompt({
  name: 'generadorDePruebasPrompt',
  input: { schema: GeneradorPruebasInputSchema },
  output: { schema: GeneradorPruebasOutputSchema },
  prompt: `
    Eres un experto y meticuloso creador de exámenes de matemáticas para estudiantes de enseñanza media.
    Tu tarea es generar una prueba sobre el tema '{{{tema}}}' que contenga exactamente {{{cantidadPreguntas}}} preguntas.

    El tipo de preguntas debe ser '{{{tipoPrueba}}}'.

    REGLAS ESTRICTAS DE FORMATO PARA LAS RESPUESTAS CORRECTAS:
    1.  **Decimales:** Usa siempre un punto (.) como separador decimal. Si un resultado tiene más de dos decimales, debes **redondearlo** a dos decimales. Ejemplo: 5.564 se convierte en 5.56; 5.567 se convierte en 5.57.
    2.  **Enteros:** Los números enteros, especialmente los miles, se escriben sin separadores. Ejemplo: Escribe 1000, no 1.000.
    3.  **Truncamiento Lógico:** Si la pregunta se refiere a contar entidades que no pueden ser fraccionarias (como personas, objetos, etc.) y el cálculo resulta en un decimal, la respuesta correcta debe ser el número entero, ignorando la parte decimal. Ejemplo: si un cálculo da 5.8 alumnos, la respuesta correcta es 5.

    - Si el tipo es 'seleccion-multiple', cada pregunta debe tener un enunciado, 5 alternativas (una correcta y cuatro distractores creíbles) y una justificación clara de la respuesta correcta. Asegúrate de que la 'respuestaCorrecta' coincida exactamente con una de las alternativas.
    - Si el tipo es 'respuesta-corta', cada pregunta debe tener un enunciado claro y la 'respuestaCorrecta' debe seguir rigurosamente las reglas de formato anteriores.

    Es crucial que las preguntas y los valores numéricos utilizados sean variados y únicos en cada ejecución para asegurar que cada prueba sea diferente.
    Genera el resultado en el formato JSON especificado.
  `,
});

// Definición del flujo de Genkit
const generadorDePruebasFlow = ai.defineFlow(
  {
    name: 'generadorDePruebasFlow',
    inputSchema: GeneradorPruebasInputSchema,
    outputSchema: GeneradorPruebasOutputSchema,
  },
  async (input) => {
    const { output } = await generadorDePruebasPrompt(input);
    if (!output) {
      throw new Error('La generación de la prueba no produjo un resultado.');
    }
    return output;
  }
);
