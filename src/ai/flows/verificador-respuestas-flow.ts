'use server';
/**
 * @fileOverview Flujo de IA para verificar respuestas abiertas de forma inteligente.
 */

import { ai } from '@/ai/genkit';
import {
  VerificadorRespuestaInputSchema,
  VerificadorRespuestaOutputSchema,
  type VerificadorRespuestaInput,
  type VerificadorRespuestaOutput,
} from './schemas/verificador-respuestas-schemas';

// Función exportada que se llamará desde la acción de servidor.
export async function verificarRespuesta(input: VerificadorRespuestaInput): Promise<VerificadorRespuestaOutput> {
  return verificadorRespuestaFlow(input);
}

const systemPrompt = `Eres un experto evaluador de matemáticas. Tu única tarea es comparar la 'respuestaUsuario' con la 'respuestaCorrecta' y determinar si son matemáticamente equivalentes. Debes ser flexible con el formato.

REGLAS DE EVALUACIÓN:
1.  **EQUIVALENCIA NUMÉRICA:** '40.0' es igual a '40'. '0.5' es igual a '1/2'.
2.  **EQUIVALENCIA CON PI:** El usuario puede escribir 'pi' o usar el símbolo 'π'. Ambas son válidas. '2*pi/9', '2pi/9', '(2/9)pi' son todas equivalentes.
3.  **APROXIMACIONES DECIMALES:** Si la respuesta correcta involucra 'pi' (ej: '2π/9' ≈ 0.698), una respuesta decimal del usuario como '0.7', '0.70' o '0.69' también debe considerarse correcta. Acepta un margen de error razonable.
4.  **IGNORAR UNIDADES:** Ignora unidades como '°', 'grados', 'radianes' en la respuesta del usuario. Céntrate solo en el valor numérico.

PROCESO:
1.  Analiza la 'respuestaUsuario' y la 'respuestaCorrecta'.
2.  Determina si son equivalentes según las reglas anteriores y establece 'esCorrecta' como 'true' o 'false'.
3.  Genera un 'feedback' muy breve:
    - Si es correcta, di algo como "¡Correcto!" o "¡Muy bien!".
    - Si es incorrecta, da una pista muy sutil SIN dar la respuesta. Por ejemplo, si la respuesta era '40' y el usuario puso '20', di "Revisa el teorema. ¿Cuál es la relación entre el ángulo del centro y el inscrito?". Si la respuesta era '2π/9' y el usuario puso otra cosa, di "Revisa la fórmula de conversión de grados a radianes."`;

const verificadorRespuestaFlow = ai.defineFlow(
  {
    name: 'verificadorRespuestaFlow',
    inputSchema: VerificadorRespuestaInputSchema,
    outputSchema: VerificadorRespuestaOutputSchema,
  },
  async ({ preguntaId, respuestaUsuario, respuestaCorrecta }) => {

    const { output } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        system: systemPrompt,
        prompt: `Analiza la siguiente respuesta:
        - Pregunta ID: ${preguntaId}
        - Respuesta del Usuario: "${respuestaUsuario}"
        - Respuesta Correcta Esperada: "${respuestaCorrecta}"
        `,
        output: { schema: VerificadorRespuestaOutputSchema },
    });
    
    if (!output) {
      throw new Error('La IA de verificación no pudo generar una respuesta.');
    }

    return output;
  }
);
