/**
 * Flow de IA para analizar tareas subidas por alumnos
 * 
 * Este flow procesa archivos desde R2 (imágenes, PDFs, documentos)
 * y genera un análisis automático de la tarea.
 */

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { prepareR2FileForAI, generateFileContext, canProcessWithAI } from '@/lib/r2-ai-integration';

// Schema de entrada
const TaskAnalysisInputSchema = z.object({
    taskTitle: z.string().describe('Título de la tarea'),
    taskDescription: z.string().describe('Descripción de la tarea'),
    files: z.array(z.object({
        url: z.string().describe('URL del archivo en R2'),
        name: z.string().describe('Nombre del archivo'),
        type: z.string().describe('Tipo MIME del archivo'),
        size: z.number().describe('Tamaño en bytes'),
    })).describe('Archivos adjuntos de la tarea'),
    studentLevel: z.string().optional().describe('Nivel del estudiante (ej: "3° Medio")'),
});

// Schema de salida
const TaskAnalysisOutputSchema = z.object({
    summary: z.string().describe('Resumen del contenido de la tarea'),
    strengths: z.array(z.string()).describe('Puntos fuertes identificados'),
    areasForImprovement: z.array(z.string()).describe('Áreas que necesitan mejora'),
    suggestions: z.array(z.string()).describe('Sugerencias específicas para el alumno'),
    detectedTopics: z.array(z.string()).describe('Temas matemáticos detectados'),
    estimatedCompleteness: z.number().min(0).max(100).describe('Porcentaje estimado de completitud'),
    overallQuality: z.enum(['excelente', 'bueno', 'regular', 'necesita_trabajo']).describe('Calidad general'),
});

export type TaskAnalysisInput = z.infer<typeof TaskAnalysisInputSchema>;
export type TaskAnalysisOutput = z.infer<typeof TaskAnalysisOutputSchema>;

/**
 * Analiza una tarea subida por un alumno
 */
export async function analyzeStudentTask(input: TaskAnalysisInput): Promise<TaskAnalysisOutput> {
    return analyzeTaskFlow(input);
}

// Flow principal
const analyzeTaskFlow = ai.defineFlow(
    {
        name: 'analyzeStudentTask',
        inputSchema: TaskAnalysisInputSchema,
        outputSchema: TaskAnalysisOutputSchema,
    },
    async (input) => {
        const systemPrompt = `Eres un asistente educativo experto en matemáticas. Tu tarea es analizar tareas de estudiantes chilenos y proporcionar retroalimentación constructiva.

CONTEXTO:
- Tarea: "${input.taskTitle}"
- Descripción: "${input.taskDescription}"
${input.studentLevel ? `- Nivel del estudiante: ${input.studentLevel}` : ''}

INSTRUCCIONES:
1. Analiza el contenido de los archivos adjuntos
2. Identifica los temas matemáticos abordados
3. Evalúa la calidad del trabajo (claridad, organización, corrección)
4. Proporciona retroalimentación constructiva y específica
5. Sugiere áreas de mejora concretas
6. Estima el nivel de completitud de la tarea

CRITERIOS DE EVALUACIÓN:
- **Excelente**: Trabajo completo, bien organizado, conceptos correctos, presentación clara
- **Bueno**: Trabajo mayormente completo, algunos errores menores, buena presentación
- **Regular**: Trabajo incompleto o con errores significativos, presentación aceptable
- **Necesita trabajo**: Trabajo muy incompleto, muchos errores, presentación deficiente

IMPORTANTE: Sé constructivo y alentador. Enfócate en cómo el estudiante puede mejorar.`;

        // Preparar archivos para la IA
        const fileContext = generateFileContext(input.files);

        // Procesar archivos que la IA puede analizar directamente
        const processableFiles = input.files.filter(f => canProcessWithAI(f.type));

        let prompt = `Analiza la siguiente tarea:${fileContext}\n\n`;

        // Si hay archivos procesables, incluirlos en el análisis
        if (processableFiles.length > 0) {
            prompt += `He adjuntado ${processableFiles.length} archivo(s) para tu análisis.\n\n`;

            // Preparar archivos para el prompt
            const preparedFiles = await Promise.all(
                processableFiles.map(async (file) => {
                    try {
                        return await prepareR2FileForAI(file.url, file.type);
                    } catch (error) {
                        console.error(`Error preparando archivo ${file.name}:`, error);
                        return null;
                    }
                })
            );

            // Filtrar archivos que se prepararon exitosamente
            const validFiles = preparedFiles.filter(f => f !== null);

            if (validFiles.length > 0) {
                prompt += `Archivos procesados: ${validFiles.length}\n`;
            }
        } else {
            prompt += `Nota: Los archivos adjuntos no pueden ser procesados directamente. Basa tu análisis en el título y descripción de la tarea.\n\n`;
        }

        prompt += `Proporciona un análisis completo de la tarea.`;

        const result = await generateWithFallback({
<<<<<<< HEAD
            model: 'googleai/gemini-2.5-flash',
=======
            model: 'googleai/gemini-2.0-flash',
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
            system: systemPrompt,
            prompt,
            output: {
                schema: TaskAnalysisOutputSchema,
            },
        });

        return output!;
    }
);
