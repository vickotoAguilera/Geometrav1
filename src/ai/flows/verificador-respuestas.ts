'use server';

/**
 * Verificador inteligente de respuestas con IA
 * Basado en verificador-respuestas-flow.ts del otro PC
 * Adaptado para ser MÁS flexible y usar Gemini directamente
 */

import { getApiKey } from '@/lib/api-key-fallback';

interface VerifyAnswerInput {
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    questionText?: string; // Opcional para contexto
}

interface VerifyAnswerOutput {
    isCorrect: boolean;
    feedback: string;
    confidence: number; // 0-100
}

/**
 * Verifica si una respuesta del usuario es correcta usando IA
 * Es MUY flexible con formatos, errores de tipeo y equivalencias
 */
export async function verifyAnswerWithAI(input: VerifyAnswerInput): Promise<VerifyAnswerOutput> {
    try {
        const apiKey = await getApiKey();

        const systemPrompt = createSystemPrompt();
        const userPrompt = createUserPrompt(input);

        console.log(`🔍 [verify-answer] Verificando: "${input.userAnswer}" vs "${input.correctAnswer}"`);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
                    }],
                    generationConfig: {
                        temperature: 0.3, // Baja temperatura para ser más consistente
                        maxOutputTokens: 300,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Parsear respuesta de la IA
        const result = parseAIResponse(aiResponse);

        console.log(`${result.isCorrect ? '✅' : '❌'} [verify-answer] Resultado: ${result.isCorrect ? 'CORRECTA' : 'INCORRECTA'} (${result.confidence}%)`);

        return result;
    } catch (error) {
        console.error('❌ [verify-answer] Error:', error);
        // Fallback: comparación simple
        return fallbackVerification(input);
    }
}

/**
 * Crea el prompt del sistema con reglas de validación
 */
function createSystemPrompt(): string {
    return `Eres un profesor de matemáticas experto y MUY flexible al evaluar respuestas. Tu tarea es determinar si la respuesta del usuario es conceptualmente correcta.

REGLAS DE VALIDACIÓN (SÉ MUY FLEXIBLE):

1. **EQUIVALENCIA NUMÉRICA:**
   - "3" = "+3" = "3.0" = "3.00"
   - "0.5" = "1/2" = "0.50"
   - "-5" = "- 5" = "(-5)"
   - Ignora espacios extras

2. **SÍMBOLOS Y OPERADORES:**
   - "+" al inicio se puede omitir: "+3" = "3"
   - "*" y "×" son equivalentes
   - "/" y "÷" son equivalentes
   - Acepta "pi", "π", "PI"

3. **ERRORES DE TIPEO:**
   - "triangulo" = "triángulo"
   - "rectangulo" = "rectángulo"
   - "angulo" = "ángulo"
   - Acepta errores ortográficos menores

4. **UNIDADES:**
   - Ignora unidades: "40°" = "40" = "40 grados"
   - "5cm" = "5" = "5 cm"

5. **FORMATOS:**
   - "(x+3)" = "x+3"
   - "2*x" = "2x"
   - Ignora paréntesis innecesarios

RESPONDE EN FORMATO JSON:
{
  "isCorrect": true/false,
  "feedback": "mensaje breve",
  "confidence": 0-100
}

Si es CORRECTA: felicita brevemente
Si es INCORRECTA: da una pista SIN revelar la respuesta`;
}

/**
 * Crea el prompt del usuario
 */
function createUserPrompt(input: VerifyAnswerInput): string {
    return `Analiza esta respuesta:

Pregunta ID: ${input.questionId}
${input.questionText ? `Pregunta: ${input.questionText}` : ''}
Respuesta del usuario: "${input.userAnswer}"
Respuesta correcta: "${input.correctAnswer}"

¿Es correcta la respuesta del usuario?`;
}

/**
 * Parsea la respuesta de la IA
 */
function parseAIResponse(text: string): VerifyAnswerOutput {
    try {
        // Intentar parsear JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                isCorrect: parsed.isCorrect === true,
                feedback: parsed.feedback || '',
                confidence: parsed.confidence || 80,
            };
        }

        // Si no hay JSON, intentar detectar por palabras clave
        const lowerText = text.toLowerCase();
        const isCorrect = lowerText.includes('correcto') ||
            lowerText.includes('correcta') ||
            lowerText.includes('sí') ||
            lowerText.includes('si,') ||
            lowerText.includes('true');

        return {
            isCorrect,
            feedback: text.substring(0, 200),
            confidence: 70,
        };
    } catch (error) {
        console.warn('⚠️ Could not parse AI response:', text);
        return {
            isCorrect: false,
            feedback: 'No se pudo verificar la respuesta',
            confidence: 0,
        };
    }
}

/**
 * Verificación de respaldo (sin IA)
 */
function fallbackVerification(input: VerifyAnswerInput): VerifyAnswerOutput {
    // Normalizar ambas respuestas
    const normalize = (str: string) => {
        return str
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '')
            .replace(/^[+]/, '') // Remover + al inicio
            .replace(/[°]/g, '') // Remover grados
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u');
    };

    const normalizedUser = normalize(input.userAnswer);
    const normalizedCorrect = normalize(input.correctAnswer);

    const isCorrect = normalizedUser === normalizedCorrect;

    return {
        isCorrect,
        feedback: isCorrect
            ? '¡Correcto!'
            : 'Revisa tu respuesta e intenta nuevamente.',
        confidence: isCorrect ? 90 : 50,
    };
}

/**
 * Verifica múltiples respuestas en batch
 */
export async function verifyMultipleAnswers(
    inputs: VerifyAnswerInput[]
): Promise<VerifyAnswerOutput[]> {
    const results = await Promise.all(
        inputs.map(input => verifyAnswerWithAI(input))
    );
    return results;
}
