import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateWithFallback } from '@/ai/api-key-fallback';

// Schema para comandos de GeoGebra
const GeoGebraCommandSchema = z.object({
    type: z.enum(['create', 'modify', 'question']).describe('Tipo de acción'),
    commands: z.array(z.string()).describe('Comandos de GeoGebra a ejecutar'),
    message: z.string().describe('Mensaje para el usuario'),
    needsConfirmation: z.boolean().optional().describe('Si necesita confirmación del usuario'),
    confirmationQuestion: z.string().optional().describe('Pregunta de confirmación'),
});

export type GeoGebraCommand = z.infer<typeof GeoGebraCommandSchema>;

// Input schema
const GeoGebraInterpreterInputSchema = z.object({
    userMessage: z.string().describe('Mensaje del usuario'),
    history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
    })).optional().describe('Historial de conversación'),
    pendingConfirmation: z.boolean().optional().describe('Si hay una confirmación pendiente'),
});

export type GeoGebraInterpreterInput = z.infer<typeof GeoGebraInterpreterInputSchema>;

// Prompt del sistema
const SYSTEM_PROMPT = `Eres un asistente experto en GeoGebra que interpreta comandos en lenguaje natural y los convierte en comandos de GeoGebra.

COMANDOS DE GEOGEBRA DISPONIBLES:
- Puntos: A = (x, y)
- Triángulos: Polygon(A, B, C)
- Círculos: Circle(centro, radio) o Circle(centro, punto)
- Segmentos: Segment(A, B)
- Polígonos: Polygon(A, B, C, D, ...)
- Etiquetas: ShowLabel(objeto, true) o ShowLabel(objeto, false)

REGLAS IMPORTANTES:
1. Si el usuario NO especifica coordenadas, genera coordenadas aleatorias visualmente agradables (entre -5 y 5)
2. Para triángulos rectángulos, asegura que un ángulo sea exactamente 90° usando coordenadas apropiadas
3. Después de crear la figura, EXPLICA qué hiciste y pregunta si quiere modificar coordenadas
4. Los nombres de puntos deben ser letras mayúsculas (A, B, C, etc.)
5. Responde en español de forma amigable y educativa
6. USA PARÉNTESIS () NO CORCHETES []
7. IMPORTANTE: Usa comandos en INGLÉS (Polygon, Circle, Segment, ShowLabel)

EJEMPLOS:

Usuario: "hazme un triángulo rectángulo"
Respuesta:
{
  "type": "create",
  "commands": [
    "A = (0, 0)",
    "B = (4, 0)",
    "C = (0, 3)",
    "Polygon(A, B, C)"
  ],
  "message": "¡Listo! He creado un triángulo rectángulo con vértices en A(0,0), B(4,0) y C(0,3). El ángulo recto está en el punto A.\n\n📐 Explicación:\n- El punto A está en el origen (0,0)\n- El punto B está 4 unidades a la derecha en el eje X\n- El punto C está 3 unidades arriba en el eje Y\n- Esto forma un triángulo rectángulo con catetos de longitud 4 y 3\n\n¿Quieres cambiar alguna coordenada? Por ejemplo, puedes decir 'mueve B a (5,0)' o '¿quieres ponerle indicadores a cada punto?'",
  "needsConfirmation": true,
  "confirmationQuestion": "modifications"
}

Usuario: "sí" o "mueve B a (5,0)" o "pon etiquetas"
Respuesta (si pide etiquetas):
{
  "type": "modify",
  "commands": [
    "ShowLabel(A, true)",
    "ShowLabel(B, true)",
    "ShowLabel(C, true)"
  ],
  "message": "¡Perfecto! He agregado las etiquetas a los puntos A, B y C. ¿Quieres hacer algún otro cambio?",
  "needsConfirmation": false
}

Respuesta (si pide mover un punto):
{
  "type": "modify",
  "commands": [
    "B = (5, 0)"
  ],
  "message": "He movido el punto B a (5,0). Ahora el triángulo tiene una base más larga. ¿Algún otro cambio?",
  "needsConfirmation": false
}

Usuario: "crea un círculo con centro en (2, 3) y radio 5"
Respuesta:
{
  "type": "create",
  "commands": [
    "O = (2, 3)",
    "Circle(O, 5)"
  ],
  "message": "He creado un círculo con centro en O(2,3) y radio 5.\n\n⭕ Explicación:\n- El centro está en el punto (2,3)\n- El radio es de 5 unidades\n\n¿Quieres cambiar el centro o el radio? También puedo ponerle etiqueta al centro.",
  "needsConfirmation": true,
  "confirmationQuestion": "modifications"
}

IMPORTANTE: Siempre responde en formato JSON válido siguiendo el schema.`;

// Flow de interpretación
export const geogebraInterpreter = ai.defineFlow(
    {
        name: 'geogebraInterpreter',
        inputSchema: GeoGebraInterpreterInputSchema,
        outputSchema: GeoGebraCommandSchema,
    },
    async (input) => {
        const { userMessage, history = [], pendingConfirmation = false } = input;

        // Construir el contexto
        let contextMessage = userMessage;
        if (pendingConfirmation) {
            contextMessage = `El usuario respondió: "${userMessage}" a una pregunta de confirmación sobre agregar etiquetas.`;
        }

        // Construir historial para el modelo
        const messages = [
            ...history.map(h => ({
                role: h.role,
                content: [{ text: h.content }],
            })),
            {
                role: 'user' as const,
                content: [{ text: contextMessage }],
            },
        ];

        const result = await generateWithFallback({
            model: 'groq/llama-3.3-70b-versatile',
            system: SYSTEM_PROMPT,
            messages,
            output: {
                format: 'json',
                schema: GeoGebraCommandSchema,
            },
            config: {
                temperature: 0.7,
            },
        });

        return result.output!;
    }
);
