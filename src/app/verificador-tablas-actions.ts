'use server';

<<<<<<< HEAD
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
=======
import { 
    verificarTabla,
    type VerificadorTablasInput,
    type VerificadorTablasOutput
} from '@/ai/flows/verificador-tablas-flow';

/**
 * Llama al flujo de Genkit para verificar las respuestas de una tabla.
 * @param input - Los parámetros para la verificación (ID de tabla y respuestas del usuario).
 * @returns Un objeto con el array de resultados booleanos.
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
 */
export async function verificarTablaAction(
  input: VerificadorTablasInput
): Promise<VerificadorTablasOutput> {
  return await verificarTabla(input);
}
