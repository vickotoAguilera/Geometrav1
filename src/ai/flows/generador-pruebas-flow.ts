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
import {
  GeneradorPruebasInputSchema,
  GeneradorPruebasOutputSchema,
  type GeneradorPruebasInput,
  type GeneradorPruebasOutput,
} from './schemas/generador-pruebas-schemas';


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

    PASO 1: ANÁLISIS DEL TEMA
    Analiza el '{{{tema}}}'. Si el tema se resuelve predominantemente con una fórmula matemática clave (como 'fórmula cuadrática', 'teorema de pitágoras', etc.), identifica un nombre clave para esa fórmula (ej: "formula_cuadratica", "teorema_pitagoras"). Asigna este identificador al campo 'formula' en la salida. Si no hay una única fórmula dominante, deja ese campo en blanco.

    PASO 2: GENERACIÓN DE PREGUNTAS
    Crea las {{{cantidadPreguntas}}} preguntas según el '{{{tipoPrueba}}}'.

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
