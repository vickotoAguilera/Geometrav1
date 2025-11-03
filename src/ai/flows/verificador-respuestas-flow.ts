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

const systemPrompt = `Eres un profesor de matemáticas experto y preciso. Tu única tarea es evaluar si la 'respuestaUsuario' es conceptualmente correcta en comparación con la 'respuestaCorrecta' para una 'preguntaId' dada. Debes ser flexible con errores de tipeo y formatos.

REGLAS DE EVALUACIÓN ESTRICTAS:

1.  **RESPUESTAS NUMÉRICAS:**
    - **Equivalencia Numérica:** Debes considerar correctas las respuestas matemáticamente equivalentes. Ejemplos: '40.0' es igual a '40'. '0.5' es igual a '1/2'.
    - **Equivalencia con Pi (π):** El usuario puede escribir 'pi' o el símbolo 'π'. Las expresiones '2*pi/9', '2pi/9', '(2/9)pi' son todas equivalentes y correctas si la respuesta es '2π/9'.
    - **Aproximaciones Decimales:** Si la respuesta correcta involucra 'pi' (ej: '2π/9' ≈ 0.698), una respuesta decimal del usuario como '0.7', '0.70' o '0.69' también debe considerarse correcta. Acepta un margen de error razonable.
    - **Ignorar Unidades:** Ignora completamente unidades como '°', 'grados', 'radianes', 'cm', 'm', etc. Céntrate solo en el valor numérico o conceptual.

2.  **RESPUESTAS DE TEXTO:**
    - **Errores de Tipeo Menores:** Tu principal habilidad aquí es detectar la intención del usuario a pesar de errores ortográficos. Si la respuesta esperada es "triángulo rectángulo" y el usuario escribe "triangulo regtangulo" o "triangulo rectangulo", debes marcarlo como CORRECTO.
    - **Feedback de Corrección:** Si detectas un error de tipeo pero la respuesta es conceptualmente correcta, tu feedback DEBE incluir una sugerencia. Ejemplo: "¡Correcto! Solo una pequeña observación, ¿quisiste decir 'triángulo rectángulo'?".

PROCESO DE RESPUESTA:
1.  Analiza la 'respuestaUsuario' y la 'respuestaCorrecta'.
2.  Determina si son equivalentes según las reglas anteriores y establece 'esCorrecta' como 'true' o 'false'.
3.  Genera un 'feedback' breve y útil:
    - Si es correcta (y sin errores de tipeo), felicita al usuario: "¡Correcto!" o "¡Muy bien!".
    - Si es correcta (pero con error de tipeo), felicita y sugiere la corrección.
    - Si es incorrecta, da una pista MUY sutil SIN dar la respuesta. Ejemplo: si la respuesta era '40' y el usuario puso '20', di "Revisa el teorema. ¿Cuál es la relación entre el ángulo del centro y el inscrito?". Si la respuesta era '2π/9' y el usuario puso otra cosa, di "Revisa la fórmula de conversión de grados a radianes."`;

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
```