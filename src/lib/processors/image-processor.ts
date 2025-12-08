/**
 * Procesador de imágenes
 * Analiza imágenes usando Gemini Vision API y crea thumbnails
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_KEYS } from '../utils/api-key-fallback';

export interface ImageAnalysis {
    visualDescription: string;
    detectedText: string;
    mathSymbols: string[];
    imageType: 'diagram' | 'photo' | 'screenshot' | 'handwritten' | 'other';
    confidence: number;
}

/**
 * Analiza una imagen usando Gemini Vision API
 * @param imageData - ArrayBuffer con el contenido de la imagen
 * @param mimeType - Tipo MIME de la imagen
 * @returns Análisis detallado de la imagen
 */
export async function analyzeImageWithGemini(
    imageData: ArrayBuffer,
    mimeType: string
): Promise<ImageAnalysis> {
    try {
        // Convertir ArrayBuffer a base64
        const base64 = Buffer.from(imageData).toString('base64');
        const dataUri = `data:${mimeType};base64,${base64}`;

        // Usar primera API key disponible
        const genAI = new GoogleGenerativeAI(API_KEYS[0] || process.env.GOOGLE_GENAI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Analiza esta imagen en detalle. Proporciona:
1. Una descripción visual completa de lo que ves
2. Todo el texto que detectes en la imagen (OCR)
3. Símbolos matemáticos o fórmulas que identifiques
4. El tipo de imagen (diagrama, foto, captura de pantalla, escritura a mano, otro)

Responde en formato JSON con esta estructura:
{
  "visualDescription": "descripción detallada",
  "detectedText": "texto detectado",
  "mathSymbols": ["símbolo1", "símbolo2"],
  "imageType": "tipo",
  "confidence": 0.95
}`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = result.response.text();

        // Intentar parsear como JSON
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                return {
                    visualDescription: analysis.visualDescription || '',
                    detectedText: analysis.detectedText || '',
                    mathSymbols: analysis.mathSymbols || [],
                    imageType: analysis.imageType || 'other',
                    confidence: analysis.confidence || 0.8,
                };
            }
        } catch (parseError) {
            // Si no se puede parsear como JSON, usar el texto completo como descripción
            return {
                visualDescription: response,
                detectedText: '',
                mathSymbols: [],
                imageType: 'other',
                confidence: 0.7,
            };
        }

        return {
            visualDescription: response,
            detectedText: '',
            mathSymbols: [],
            imageType: 'other',
            confidence: 0.7,
        };
    } catch (error) {
        console.error('Error analyzing image with Gemini:', error);
        throw new Error(`No se pudo analizar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
}

/**
 * Crea un thumbnail de una imagen
 * @param imageData - ArrayBuffer con el contenido de la imagen
 * @param maxSize - Tamaño máximo en píxeles (ancho o alto)
 * @returns Base64 string del thumbnail
 */
export async function createThumbnail(
    imageData: ArrayBuffer,
    maxSize: number = 200
): Promise<string> {
    try {
        // Convertir a base64
        const base64 = Buffer.from(imageData).toString('base64');

        // En el navegador, usaríamos canvas para redimensionar
        // En el servidor, podríamos usar sharp u otra librería
        // Por ahora, retornamos la imagen original si es pequeña
        // TODO: Implementar redimensionamiento real con sharp o canvas

        return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
        console.error('Error creating thumbnail:', error);
        throw new Error('No se pudo crear thumbnail');
    }
}

/**
 * Detecta si una imagen contiene contenido matemático
 * @param analysis - Análisis de la imagen
 * @returns true si contiene matemáticas
 */
export function containsMathContent(analysis: ImageAnalysis): boolean {
    const mathKeywords = [
        'ecuación',
        'fórmula',
        'gráfico',
        'diagrama',
        'triángulo',
        'círculo',
        'función',
        'integral',
        'derivada',
        'matriz',
        'vector',
        'ángulo',
        'teorema',
    ];

    const description = analysis.visualDescription.toLowerCase();
    const hasKeywords = mathKeywords.some((keyword) => description.includes(keyword));
    const hasMathSymbols = analysis.mathSymbols.length > 0;

    return hasKeywords || hasMathSymbols;
}
