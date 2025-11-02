/**
 * @fileOverview Define los esquemas de Zod para el flujo del asistente teórico.
 */
import { z } from 'genkit';

// Esquema para un mensaje individual en el historial de chat
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.any()),
});

// Esquema para la entrada del flujo del tutor teórico
export const TeoriaCalculadoraAssistantInputSchema = z.object({
  history: z.array(MessageSchema).optional().describe('El historial de la conversación.'),
  contextoEjercicio: z.string().describe('El contenido completo del archivo .md del ejercicio actual para dar contexto a la IA.'),
});
export type TeoriaCalculadoraAssistantInput = z.infer<typeof TeoriaCalculadoraAssistantInputSchema>;

// Esquema para la salida del flujo del tutor teórico
export const TeoriaCalculadoraAssistantOutputSchema = z.object({
  response: z.string().describe('La respuesta del tutor teórico. Debe guiar al usuario en la resolución manual del ejercicio.'),
});
export type TeoriaCalculadoraAssistantOutput = z.infer<typeof TeoriaCalculadoraAssistantOutputSchema>;
