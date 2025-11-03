'use server';
/**
 * @fileOverview Flujo de IA para verificar las respuestas de las tablas interactivas.
 * No utiliza un modelo de lenguaje generativo, sino que aplica lógica de comparación.
 */

import { ai } from '@/ai/genkit';
import {
  VerificadorTablasInputSchema,
  VerificadorTablasOutputSchema,
  type VerificadorTablasInput,
  type VerificadorTablasOutput,
} from './schemas/verificador-tablas-schemas';

// Objeto que almacena las respuestas correctas para cada tabla.
// En una aplicación real, esto podría venir de una base de datos.
const soluciones: Record<string, string[]> = {
  'tabla-actividad-1': ['12', '18', '6', '16', '24', '14.4'],
  'tabla-actividad-4': ['6.84', '0.1191', '0.9929', '0.1200', '0.1191', '0.1200', '0.9929', '4.57', '0.0797', '0.9968', '0.0800', '0.0797', '0.0800', '0.9968', '3.43', '0.0599', '0.9982', '0.0600', '0.0599', '0.0600', '0.9982'],
};

// Función exportada que se llamará desde la acción de servidor.
export async function verificarTabla(input: VerificadorTablasInput): Promise<VerificadorTablasOutput> {
  return verificadorTablasFlow(input);
}

// Función para comparar si dos valores numéricos son equivalentes (ej: "0.5" y "1/2").
function sonNumerosEquivalentes(val1: string, val2: string): boolean {
  if (val1 === val2) return true;
  const num1 = Number(val1);
  const num2 = Number(val2);
  if (!isNaN(num1) && !isNaN(num2)) {
    // Compara con una pequeña tolerancia para errores de punto flotante.
    return Math.abs(num1 - num2) < 0.01;
  }
  // Podríamos añadir lógica para fracciones, pero por ahora comparamos como texto.
  return false;
}

const verificadorTablasFlow = ai.defineFlow(
  {
    name: 'verificadorTablasFlow',
    inputSchema: VerificadorTablasInputSchema,
    outputSchema: VerificadorTablasOutputSchema,
  },
  async ({ tablaId, respuestasUsuario }) => {
    const respuestasCorrectas = soluciones[tablaId];

    if (!respuestasCorrectas) {
      throw new Error(`No se encontraron soluciones para la tabla con ID: ${tablaId}`);
    }

    const resultados = respuestasUsuario.map((respuestaUser, index) => {
      const respuestaCorrecta = respuestasCorrectas[index];
      // Si el usuario no ha respondido, no es ni correcto ni incorrecto, pero lo marcamos como false.
      if (!respuestaUser.trim()) {
        return false;
      }
      return sonNumerosEquivalentes(respuestaUser, respuestaCorrecta);
    });

    return { resultados };
  }
);
