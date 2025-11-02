/**
 * @fileOverview Define los esquemas de Zod para el flujo del asistente de Funciones y Matrices.
 */
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.any()),
});

// Esquema para la entrada del flujo
export const FuncionesMatricesAssistantInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe('El historial de la conversación.'),
  ejercicioId: z.string().describe('El identificador único del ejercicio que se está resolviendo.'),
  userQuery: z.string().optional().describe('La respuesta o pregunta del usuario.'),
});
export type FuncionesMatricesAssistantInput = z.infer<typeof FuncionesMatricesAssistantInputSchema>;

// Esquema para la salida del flujo
export const FuncionesMatricesAssistantOutputSchema = z.object({
  response: z.string().describe('La respuesta del tutor de GeoGebra. Debe guiar al usuario y puede incluir botones de acción como [button:Texto].'),
});
export type FuncionesMatricesAssistantOutput = z.infer<typeof FuncionesMatricesAssistantOutputSchema>;
