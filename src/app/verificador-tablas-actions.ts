'use server';

import {
  verificarTabla,
} from '@/ai/flows/verificador-tablas-flow';

// Tipos
interface VerificadorTablasInput {
  tablaId: string;
  respuestasUsuario: string[];
}

interface VerificadorTablasOutput {
  resultados: boolean[];
}

/**
 * Llama al flujo de Genkit para verificar las respuestas de una tabla.
 * Ahora con validación mejorada que acepta "+3" = "3", etc.
 */
export async function verificarTablaAction(
  input: VerificadorTablasInput
): Promise<VerificadorTablasOutput> {
  return await verificarTabla(input);
}
