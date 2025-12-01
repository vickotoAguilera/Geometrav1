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
        doc.text('📊 Resumen de Desempeño', margin, yPosition);
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
        doc.text('💡 Análisis del Desempeño', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Dividir feedback en líneas que quepan en la página
        const feedbackLines = doc.splitTextToSize(feedback, maxWidth);

        feedbackLines.forEach((line: string) => {
            // Verificar si necesitamos nueva página
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            doc.text(line, margin, yPosition);
            yPosition += 6;
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
