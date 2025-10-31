'use server';
/**
 * @fileOverview Flujo de Genkit para generar pruebas PAES de matemáticas (M1 y M2).
 *
 * - generarPruebaPaes - Genera una prueba de 50 preguntas basada en el temario oficial.
 * - GeneradorPaesInput - El tipo de entrada para el flujo (M1 o M2).
 * - GeneradorPaesOutput - El tipo de salida, que es un array de 50 Preguntas.
 */
import { ai } from '@/ai/genkit';
import {
  GeneradorPaesInputSchema,
  GeneradorPaesOutputSchema,
  type GeneradorPaesInput,
  type GeneradorPaesOutput,
} from './schemas/generador-paes-schemas';

// Contenido de los temarios M1 y M2
const temarioM1 = `
- Números: Conjunto de los números enteros y racionales (operatoria, orden y problemas), Porcentaje, Potencias y raíces enésimas.
- Álgebra y funciones: Expresiones algebraicas, Proporcionalidad, Ecuaciones e inecuaciones de primer grado, Sistemas de ecuaciones lineales 2×2, Función lineal y afín, Función cuadrática.
- Geometría: Figuras geométricas (perímetros, áreas), Cuerpos geométricos (áreas, volúmenes), Transformaciones isométricas.
- Probabilidad y estadística: Representación de datos mediante tablas y gráficos, Medidas de tendencia central y rango, Medidas de posición, Reglas de la probabilidad.
`;

const temarioM2 = `
- Incluye TODO el temario de M1.
- Números: Conjunto de los números reales, Matemática financiera, Logaritmos.
- Álgebra y funciones: Función potencia.
- Geometría: Homotecia de figuras planas, Razones trigonométricas en triángulos rectángulos.
- Probabilidad y estadística: Medidas de dispersión, Probabilidad condicional, Permutación y combinatoria.
`;

// Función exportada que se llamará desde la aplicación
export async function generarPruebaPaes(input: GeneradorPaesInput): Promise<GeneradorPaesOutput> {
  return generadorPaesFlow(input);
}

const generadorPaesPrompt = ai.definePrompt({
  name: 'generadorPaesPrompt',
  input: { schema: GeneradorPaesInputSchema },
  output: { schema: GeneradorPaesOutputSchema },
  prompt: `
    Actúas como un experto del DEMRE, encargado de crear la Prueba de Acceso a la Educación Superior (PAES) de Competencia Matemática.
    Tu tarea es generar un ensayo de 5 preguntas de selección múltiple (con 4 alternativas: A, B, C, D) para la prueba '{{{tipoPrueba}}}'.

    INSTRUCCIONES ESTRICTAS:
    1.  **Temario:** Basa TODAS las preguntas exclusivamente en el temario correspondiente.
        - Si es M1: Usa solo el temario M1.
        - Si es M2: Usa el temario de M1 Y ADEMÁS los temas específicos de M2. Asegúrate de que haya una buena mezcla, incluyendo preguntas de los temas más avanzados de M2.

    2.  **Formato de Pregunta:** Cada pregunta debe ser un problema contextualizado, similar a los ejemplos oficiales de la PAES. Deben requerir razonamiento y aplicación de conceptos, no solo cálculo mecánico.

    3.  **Alternativas:** Crea 4 alternativas (A, B, C, D). Una debe ser la correcta. Las otras tres deben ser distractores creíbles, basados en errores conceptuales comunes que cometen los estudiantes.

    4.  **Variabilidad:** Las preguntas y los valores numéricos deben ser únicos y variados en cada ejecución. No repitas problemas.

    5.  **Contexto del Temario a Usar:**
        - **Temario M1 (Obligatorio):** ${temarioM1}
        - **Temario M2 (Electivo):** ${temarioM2}

    Genera el resultado en el formato JSON especificado, con exactamente 5 preguntas.
  `,
});

// Definición del flujo de Genkit
const generadorPaesFlow = ai.defineFlow(
  {
    name: 'generadorPaesFlow',
    inputSchema: GeneradorPaesInputSchema,
    outputSchema: GeneradorPaesOutputSchema,
  },
  async (input) => {
    const { output } = await generadorPaesPrompt(input);
    if (!output || output.preguntas.length !== 5) {
      throw new Error('La IA no pudo generar las 5 preguntas de la prueba PAES.');
    }
    return output;
  }
);
