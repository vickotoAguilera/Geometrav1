/**
 * @fileOverview Define los esquemas de Zod para el flujo de verificación de tablas.
 */
import { z } from 'genkit';

// Esquema para la entrada del flujo de verificación.
export const VerificadorTablasInputSchema = z.object({
  tablaId: z.string().describe('El identificador único de la tabla que se está verificando (ej: "tabla-actividad-1").'),
  respuestasUsuario: z.array(z.string()).describe('Un array con las respuestas proporcionadas por el usuario para cada celda.')
});
export type VerificadorTablasInput = z.infer<typeof VerificadorTablasInputSchema>;

// Esquema para la salida del flujo.
export const VerificadorTablasOutputSchema = z.object({
  resultados: z.array(z.boolean()).describe("Un array de booleanos donde 'true' significa que la respuesta es correcta y 'false' que es incorrecta.")
});
export type VerificadorTablasOutput = z.infer<typeof VerificadorTablasOutputSchema>;
