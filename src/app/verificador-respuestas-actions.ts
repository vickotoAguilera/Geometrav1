'use server';

import { 
    verificarRespuesta,
    type VerificadorRespuestaInput,
    type VerificadorRespuestaOutput
} from '@/ai/flows/verificador-respuestas-flow';

/**
 * Llama al flujo de Genkit para verificar una respuesta de desarrollo.
 * @param input - Los parámetros para la verificación (ID de pregunta, respuesta de usuario, etc.).
 * @returns Un objeto con el resultado booleano de la verificación y un feedback.
 */
export async function verificarRespuestaAction(
  input: VerificadorRespuestaInput
): Promise<VerificadorRespuestaOutput> {
  return await verificarRespuesta(input);
}
