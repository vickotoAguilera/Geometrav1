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
  'tabla-actividad-4': [
    '6.84', '0.1191', '0.9929', '0.1200', '0.1191', '0.1200', '0.9929',
    '4.57', '0.0797', '0.9968', '0.0800', '0.0797', '0.0800', '0.9968',
    '3.43', '0.0599', '0.9982', '0.0600', '0.0599', '0.0600', '0.9982'
  ],
};

// Función exportada que se llamará desde la acción de servidor.
export async function verificarTabla(input: VerificadorTablasInput): Promise<VerificadorTablasOutput> {
  return verificadorTablasFlow(input);
}

// Función de fallback (comparación simple)
function sonNumerosEquivalentes(val1: string, val2: string): boolean {
  if (val1 === val2) return true;

  // Normalizar: remover espacios, + al inicio, etc.
  const normalize = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/^[+]/, '') // Remover + al inicio
      .replace(/\s+/g, '') // Remover espacios
      .replace(',', '.'); // Coma a punto
  };

  const norm1 = normalize(val1);
  const norm2 = normalize(val2);

  if (norm1 === norm2) return true;

  // Intentar comparación numérica
  const num1 = Number(norm1);
  const num2 = Number(norm2);

  if (!isNaN(num1) && !isNaN(num2)) {
    return Math.abs(num1 - num2) < 0.01;
  }

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
      if (!respuestaUser || !respuestaUser.trim()) {
        return false;
      }
      return sonNumerosEquivalentes(respuestaUser, respuestaCorrecta);
    });

    return { resultados };
  }
);
