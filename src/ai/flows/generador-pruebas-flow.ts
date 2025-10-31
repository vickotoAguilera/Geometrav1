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
    Actúas como un experto creador de exámenes de matemáticas. Eres extremadamente meticuloso.
    Tu tarea es generar una prueba sobre el tema '{{{tema}}}' que contenga exactamente {{{cantidadPreguntas}}} preguntas.
    El tipo de preguntas debe ser '{{{tipoPrueba}}}'.

    REGLAS ESTRICTAS DE GENERACIÓN:
    1.  **Formato de Preguntas de Selección Múltiple:** Debes crear 5 alternativas. Una debe ser la respuesta correcta, y las otras cuatro deben ser "distractores" plausibles, es decir, respuestas que un estudiante podría obtener si comete un error común.
    2.  **Formato de Preguntas de Respuesta Corta:** La respuesta debe ser un número o una expresión muy breve. Para respuestas numéricas, usa punto (.) como separador decimal, redondea a dos decimales si es necesario y no uses separadores de miles (ej: 1500, no 1.500). Para conteo de objetos/personas, la respuesta debe ser un número entero (trunca el resultado si es decimal).
    3.  **Justificación (solo para selección múltiple):** Proporciona una explicación clara y directa de por qué la respuesta es correcta.
    4.  **Fórmula Clave (solo para temas específicos):** Si el tema se resuelve con una fórmula matemática muy conocida (ej: 'fórmula cuadrática' para resolver ecuaciones de segundo grado, o 'teorema de pitágoras'), identifica un nombre clave para esa fórmula (ej: "formula_cuadratica" o "teorema_pitagoras"). Asigna este identificador al campo 'formula'. Si no aplica, déjalo en blanco.
    5.  **Variabilidad:** Es crucial que las preguntas y los valores numéricos sean variados para que cada prueba generada sea única.

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
