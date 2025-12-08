/**
 * Flow de IA para generar sugerencias de retroalimentación para profesores
 * 
 * Este flow ayuda a los profesores a crear retroalimentación personalizada
 * basada en el análisis de la tarea del alumno y su perfil de aprendizaje.
 */

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { prepareR2FileForAI, generateFileContext } from '@/lib/r2-ai-integration';

// Schema de entrada
const FeedbackSuggestionsInputSchema = z.object({
    taskTitle: z.string().describe('Título de la tarea'),
    taskDescription: z.string().describe('Descripción de la tarea'),
    studentName: z.string().describe('Nombre del estudiante'),
    studentLevel: z.string().optional().describe('Nivel del estudiante'),
    studentStrengths: z.array(z.string()).optional().describe('Fortalezas del estudiante'),
    studentWeaknesses: z.array(z.string()).optional().describe('Debilidades del estudiante'),
    taskFiles: z.array(z.object({
        url: z.string(),
        name: z.string(),
        type: z.string(),
        size: z.number(),
    })).describe('Archivos de la tarea del estudiante'),
    teacherNotes: z.string().optional().describe('Notas adicionales del profesor'),
});

// Schema de salida
const FeedbackSuggestionsOutputSchema = z.object({
    overallFeedback: z.string().describe('Retroalimentación general sugerida'),
    specificComments: z.array(z.object({
        topic: z.string().describe('Tema o aspecto específico'),
        comment: z.string().describe('Comentario sugerido'),
        priority: z.enum(['alta', 'media', 'baja']).describe('Prioridad del comentario'),
    })).describe('Comentarios específicos sugeridos'),
    recommendedExercises: z.array(z.string()).describe('Ejercicios recomendados para reforzar'),
    encouragement: z.string().describe('Mensaje de aliento personalizado'),
    nextSteps: z.array(z.string()).describe('Próximos pasos sugeridos para el estudiante'),
});

export type FeedbackSuggestionsInput = z.infer<typeof FeedbackSuggestionsInputSchema>;
export type FeedbackSuggestionsOutput = z.infer<typeof FeedbackSuggestionsOutputSchema>;

/**
 * Genera sugerencias de retroalimentación para un profesor
 */
export async function generateFeedbackSuggestions(
    input: FeedbackSuggestionsInput
): Promise<FeedbackSuggestionsOutput> {
    return feedbackSuggestionsFlow(input);
}

// Flow principal
const feedbackSuggestionsFlow = ai.defineFlow(
    {
        name: 'generateFeedbackSuggestions',
        inputSchema: FeedbackSuggestionsInputSchema,
        outputSchema: FeedbackSuggestionsOutputSchema,
    },
    async (input) => {
        const systemPrompt = `Eres un asistente pedagógico experto que ayuda a profesores de matemáticas a crear retroalimentación efectiva y personalizada para sus estudiantes.

CONTEXTO DEL ESTUDIANTE:
- Nombre: ${input.studentName}
${input.studentLevel ? `- Nivel: ${input.studentLevel}` : ''}
${input.studentStrengths && input.studentStrengths.length > 0 ? `- Fortalezas: ${input.studentStrengths.join(', ')}` : ''}
${input.studentWeaknesses && input.studentWeaknesses.length > 0 ? `- Áreas a reforzar: ${input.studentWeaknesses.join(', ')}` : ''}

TAREA:
- Título: "${input.taskTitle}"
- Descripción: "${input.taskDescription}"
${input.teacherNotes ? `- Notas del profesor: "${input.teacherNotes}"` : ''}

PRINCIPIOS DE RETROALIMENTACIÓN EFECTIVA:
1. **Específica**: Comentarios concretos sobre aspectos particulares del trabajo
2. **Constructiva**: Enfocada en cómo mejorar, no solo en lo que está mal
3. **Personalizada**: Adaptada al nivel y perfil del estudiante
4. **Balanceada**: Reconoce logros y señala áreas de mejora
5. **Accionable**: Proporciona pasos claros para mejorar
6. **Motivadora**: Alienta al estudiante a seguir aprendiendo

FORMATO DE COMENTARIOS:
- Prioridad ALTA: Errores conceptuales fundamentales o malentendidos importantes
- Prioridad MEDIA: Errores procedimentales o áreas que necesitan refuerzo
- Prioridad BAJA: Detalles de presentación o mejoras opcionales

IMPORTANTE: 
- Usa un tono amable y profesional
- Reconoce el esfuerzo del estudiante
- Proporciona ejemplos concretos cuando sea posible
- Sugiere recursos o ejercicios específicos para mejorar`;

        const fileContext = generateFileContext(input.taskFiles);

        const prompt = `Genera sugerencias de retroalimentación para esta tarea:

${fileContext}

Proporciona:
1. Una retroalimentación general que el profesor pueda usar
2. Comentarios específicos organizados por prioridad
3. Ejercicios recomendados para reforzar conceptos
4. Un mensaje de aliento personalizado
5. Próximos pasos claros para el estudiante

Recuerda: La retroalimentación debe ser constructiva, específica y motivadora.`;

        const { output } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            system: systemPrompt,
            prompt,
            output: {
                schema: FeedbackSuggestionsOutputSchema,
            },
        });

        return output!;
    }
);
