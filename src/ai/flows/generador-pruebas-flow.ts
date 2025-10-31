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

const TEMARIO_M1 = `
- Números: Conjunto de los números enteros y racionales (propiedades, operatoria, transformaciones), Porcentajes (cálculo, aplicaciones), Potencias y raíces enésimas (propiedades, operatoria).
- Álgebra y funciones: Expresiones algebraicas (valorización, operatoria), Proporcionalidad (directa, inversa), Ecuaciones e inecuaciones de primer grado, Sistemas de ecuaciones lineales 2x2 (resolución e interpretación), Función lineal y afín (gráficos, parámetros), Función cuadrática (gráficos, parámetros, raíces).
- Geometría: Figuras geométricas (perímetro, área), Cuerpos geométricos (área de superficie, volumen), Transformaciones isométricas (traslación, rotación, reflexión).
- Probabilidad y estadística: Representación de datos (tablas y gráficos), Medidas de tendencia central (media, mediana, moda) y rango, Medidas de posición (cuartiles, percentiles), Reglas de la probabilidad (regla aditiva, multiplicativa).
`;

const TEMARIO_M2 = `
- Incluye TODO el temario de M1.
- Números: Conjunto de los números reales (propiedades, operatoria con irracionales), Logaritmos (propiedades, aplicaciones), Matemática financiera (interés simple y compuesto).
- Álgebra y funciones: Sistemas de ecuaciones lineales 2x2 (análisis de soluciones), Función potencia.
- Geometría: Homotecia de figuras planas (propiedades), Razones trigonométricas en triángulos rectángulos (seno, coseno, tangente).
- Probabilidad y estadística: Medidas de dispersión (varianza, desviación estándar), Probabilidad condicional, Permutación y combinatoria.
`;

const ESTRUCTURA_EJEMPLO_PAES = `
Pregunta 1. Por el arriendo de un juego inflable se cobra una cuota fija de $120.000 por cuatro horas, más $25.000 por cada hora adicional.
¿Cuántas horas como máximo puede arrendar una empresa el juego inflable si tiene un presupuesto de $240.000 para este efecto?
A) 4
B) 8
C) 9
D) 10
Respuesta: La relación entre el costo de arriendo y el número de horas es una función afín debido a que el valor inicial es diferente de 0. El cargo por hora corresponde a la pendiente de la recta y la cuota fija es el valor inicial. f(x)=25.000x+120.000. En donde f(x) es el costo y x es el número de horas. En este ejemplo, tenemos el presupuesto de la empresa por lo que se debe encontrar la cantidad de horas x. 240.000=25.000x+120.000. x = (240.000 - 120.000) / 25.000. x = 4.8 horas. La empresa únicamente puede pagar por 4 horas completas, la respuesta es A.
`;

// Definición del prompt para Genkit
const generadorDePruebasPrompt = ai.definePrompt({
  name: 'generadorDePruebasPrompt',
  input: { schema: GeneradorPruebasInputSchema },
  output: { schema: GeneradorPruebasOutputSchema },
  prompt: `
    Actúas como un experto del DEMRE, encargado de crear la PAES de Matemáticas. Eres extremadamente meticuloso.
    Tu tarea es generar una prueba sobre el tema '{{{tema}}}' que contenga exactamente {{{cantidadPreguntas}}} preguntas.
    El tipo de preguntas debe ser '{{{tipoPrueba}}}'.

    PASO 1: ANÁLISIS DEL TEMA
    - Si el '{{{tema}}}' es 'PAES M1', tu base de conocimiento para crear preguntas es exclusivamente el siguiente temario: ${TEMARIO_M1}.
    - Si el '{{{tema}}}' es 'PAES M2', tu base de conocimiento es la unión del temario M1 y el temario M2: ${TEMARIO_M1} ${TEMARIO_M2}.
    - Si el '{{{tema}}}' es otro (ej: "Teorema de Pitágoras"), enfócate solo en ese tema.

    PASO 2: GENERACIÓN DE PREGUNTAS
    Crea las {{{cantidadPreguntas}}} preguntas según el tipo solicitado.

    REGLAS ESTRICTAS DE GENERACIÓN (TODOS LOS TEMAS):
    1.  **Formato de Respuesta Correcta (para tipo 'respuesta-corta'):** Usa punto (.) para decimales. Redondea a dos decimales si es necesario. No uses separadores de miles (ej: 1500, no 1.500). Para conteo de objetos/personas, trunca a entero.
    2.  **Formato de Justificación (TODOS LOS TEMAS):**
        - Si el tema NO es PAES, la justificación debe ser clara y directa.
        - Si el tema ES 'PAES M1' o 'PAES M2', la justificación debe ser **extremadamente detallada y pedagógica**, como si fueras un profesor explicando la solución paso a paso. Debe definir el concepto clave, mostrar la fórmula, desarrollar el problema y concluir la respuesta. Inspírate en la estructura del siguiente ejemplo: ${ESTRUCTURA_EJEMPLO_PAES}.

    PASO 3: DETECCIÓN DE FÓRMULA CLAVE (SOLO para temas NO PAES)
    - Si el tema se resuelve con una fórmula clave (ej: 'fórmula cuadrática', 'teorema de pitágoras'), identifica un nombre clave para esa fórmula (ej: "formula_cuadratica"). Asigna este identificador al campo 'formula'. Si no, déjalo en blanco. Para temas PAES, este campo siempre irá en blanco.

    Es crucial que las preguntas y los valores numéricos sean variados para que cada prueba sea única. Genera el resultado en el formato JSON especificado.
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
