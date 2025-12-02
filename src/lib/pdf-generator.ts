// Generador de PDF para retroalimentación de ejercicios

import jsPDF from 'jspdf';
import type { DragDropExercise, FillInBlanksExercise } from '@/types/exercises';
import type { UserAnswer } from '@/ai/flows/feedback-generator';

type Exercise = DragDropExercise | FillInBlanksExercise;

export interface PDFOptions {
    subjectName: string;
    gradeName: string;
    studentName?: string;
}

/**
 * Genera y descarga un PDF con la retroalimentación
 */
export function generateFeedbackPDF(
    feedback: string,
    exercises: Exercise[],
    userAnswers: UserAnswer[],
    options: PDFOptions
): void {
    try {
        const doc = new jsPDF();
        const { subjectName, gradeName, studentName } = options;

        let yPosition = 20;
        const lineHeight = 7;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);

        // ===== ENCABEZADO =====
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Retroalimentación de Ejercicios', margin, yPosition);
        yPosition += 15;

        // Línea separadora
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        // Información del estudiante y materia
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        if (studentName) {
            doc.text(`Estudiante: ${studentName}`, margin, yPosition);
            yPosition += lineHeight;
        }

        doc.text(`Materia: ${subjectName}`, margin, yPosition);
        yPosition += lineHeight;

        doc.text(`Curso: ${gradeName}`, margin, yPosition);
        yPosition += lineHeight;

        const date = new Date().toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Fecha: ${date}`, margin, yPosition);
        yPosition += 15;

        // ===== RESUMEN DE DESEMPEÑO =====
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen de Desempeño', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
        const totalExercises = exercises.length;
        const successRate = Math.round((correctAnswers / totalExercises) * 100);

        doc.text(`Total de ejercicios: ${totalExercises}`, margin + 5, yPosition);
        yPosition += lineHeight;

        doc.text(`Respuestas correctas: ${correctAnswers}`, margin + 5, yPosition);
        yPosition += lineHeight;

        doc.text(`Respuestas incorrectas: ${totalExercises - correctAnswers}`, margin + 5, yPosition);
        yPosition += lineHeight;

        // Tasa de éxito con color
        doc.setFont('helvetica', 'bold');
        if (successRate >= 70) {
            doc.setTextColor(0, 128, 0); // Verde
        } else if (successRate >= 50) {
            doc.setTextColor(255, 165, 0); // Naranja
        } else {
            doc.setTextColor(255, 0, 0); // Rojo
        }
        doc.text(`Tasa de éxito: ${successRate}%`, margin + 5, yPosition);
        doc.setTextColor(0, 0, 0); // Reset a negro
        doc.setFont('helvetica', 'normal');
        yPosition += 15;

        // ===== RETROALIMENTACIÓN DE IA =====
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Análisis del Desempeño', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Función para dividir texto manualmente respetando palabras
        function wrapText(text: string, maxWidth: number): string[] {
            const words = text.split(' ');
            const lines: string[] = [];
            let currentLine = '';

            words.forEach((word) => {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const textWidth = doc.getTextWidth(testLine);

                if (textWidth > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });

            if (currentLine) {
                lines.push(currentLine);
            }

            return lines;
        }

        // Procesar el feedback línea por línea
        const paragraphs = feedback.split('\n');

        paragraphs.forEach((paragraph) => {
            // Saltar líneas vacías pero agregar espacio
            if (paragraph.trim() === '') {
                yPosition += 4;
                return;
            }

            // Detectar si es un encabezado (empieza con ** o números)
            const isHeading = paragraph.trim().match(/^\*\*\d+\.|^\d+\./);
            if (isHeading) {
                doc.setFont('helvetica', 'bold');
            }

            // Reemplazar emojis y caracteres especiales que causan problemas
            let cleanParagraph = paragraph
                .replace(/📚/g, '[RECURSOS]')
                .replace(/→/g, '->') // Reemplazar flecha por caracteres ASCII
                .replace(/•/g, '-')  // Reemplazar bullets por guiones
                .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F]/g, ''); // Eliminar otros caracteres no estándar

            // Detectar si hay un link en el párrafo
            const linkMatch = cleanParagraph.match(/\[LINK: (.*?)\]/);
            let linkUrl = '';

            if (linkMatch) {
                linkUrl = linkMatch[1];
                // Remover el tag del link para el texto visible
                cleanParagraph = cleanParagraph.replace(/\[LINK: .*?\]/, '').trim();
            }

            // Dividir el párrafo en líneas respetando palabras
            const lines = wrapText(cleanParagraph.trim(), maxWidth - 40);

            lines.forEach((line: string, index: number) => {
                // Verificar si necesitamos nueva página
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                // Limpiar asteriscos de markdown
                const cleanLine = line.replace(/\*\*/g, '');
                doc.text(cleanLine, margin, yPosition);
                yPosition += 5.5;
            });

            // Si había un link, agregarlo al final del párrafo
            if (linkUrl) {
                doc.setTextColor(0, 0, 255); // Azul
                doc.setFont('helvetica', 'normal'); // Asegurar fuente normal

                // Texto visible del link
                const linkText = `Ir a estudiar: ${linkUrl}`;

                // Verificar si cabe en la página
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                // Usar el origen actual (localhost o dominio de producción)
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://geometra.app';
                doc.textWithLink(linkText, margin, yPosition, { url: `${baseUrl}${linkUrl}` });

                doc.setTextColor(0, 0, 0); // Volver a negro
                yPosition += 5.5;
            }

            // Volver a fuente normal después de encabezados
            if (isHeading) {
                doc.setFont('helvetica', 'normal');
            }

            // Espacio extra después de cada párrafo
            yPosition += 2;
        });

        yPosition += 10;

        // ===== PIE DE PÁGINA =====
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Página ${i} de ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // ===== DESCARGAR PDF =====
        const fileName = `retroalimentacion_${subjectName.replace(/\s+/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        console.log(`✅ PDF generado: ${fileName}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('No se pudo generar el PDF. Por favor, intenta nuevamente.');
    }
}

/**
 * Genera un PDF con detalles de cada ejercicio
 */
export function generateDetailedFeedbackPDF(
    feedback: string,
    exercises: Exercise[],
    userAnswers: UserAnswer[],
    options: PDFOptions
): void {
    const doc = new jsPDF();
    // ... implementación similar pero con más detalles por ejercicio
    // Esta función se puede expandir en el futuro
}
