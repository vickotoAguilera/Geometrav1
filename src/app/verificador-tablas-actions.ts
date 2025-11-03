'use server';

import { 
    verificarTabla,
    type VerificadorTablasInput,
    type VerificadorTablasOutput
} from '@/ai/flows/verificador-tablas-flow';

/**
 * Llama al flujo de Genkit para verificar las respuestas de una tabla.
 * @param input - Los parámetros para la verificación (ID de tabla y respuestas del usuario).
 * @returns Un objeto con el array de resultados booleanos.
 */
export async function verificarTablaAction(
  input: VerificadorTablasInput
): Promise<VerificadorTablasOutput> {
  return await verificarTabla(input);
}
