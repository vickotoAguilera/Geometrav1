/**
 * Generador de PDFs para retroalimentación de ejercicios
 * Basado en el código del otro PC, adaptado para este proyecto
 */

import jsPDF from 'jspdf';

interface ExerciseAnswer {
    questionId: string;
    question: string;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
}

interface FeedbackData {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    score: number;
    detailedFeedback: {
        questionId: string;
        feedback: string;
    }[];
}

interface PDFOptions {
    studentName: string;
    subject: string;
    grade: string;
    date: Date;
    answers: ExerciseAnswer[];
    feedback: FeedbackData;
}

/**
 * Genera un PDF con la retroalimentación de ejercicios
 */
export function generateFeedbackPDF(options: PDFOptions): jsPDF {
    const { studentName, subject, grade, date, answers, feedback } = options;

    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Retroalimentación de Ejercicios', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Información del estudiante
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Estudiante: ${studentName}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Curso: ${grade}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Materia: ${subject}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Fecha: ${date.toLocaleDateString('es-CL')}`, margin, yPosition);
    yPosition += 15;

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Resumen de resultados
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen de Resultados', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalCount = answers.length;

    doc.text(`Puntaje: ${feedback.score}%`, margin, yPosition);
    yPosition += 7;
    doc.text(`Ejercicios correctos: ${correctCount}/${totalCount}`, margin, yPosition);
    yPosition += 15;

    // Retroalimentación general
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Retroalimentación General', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(feedback.summary, maxWidth);
    doc.text(summaryLines, margin, yPosition);
    yPosition += (summaryLines.length * 6) + 10;

    // Fortalezas
    if (feedback.strengths.length > 0) {
        yPosition = checkPageBreak(doc, yPosition, 40);

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 128, 0); // Verde
        doc.text('✓ Fortalezas', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0); // Negro

        feedback.strengths.forEach(strength => {
            yPosition = checkPageBreak(doc, yPosition, 15);
            const lines = doc.splitTextToSize(`• ${strength}`, maxWidth - 5);
            doc.text(lines, margin + 5, yPosition);
            yPosition += (lines.length * 6) + 3;
        });
        yPosition += 5;
    }

    // Áreas a mejorar
    if (feedback.weaknesses.length > 0) {
        yPosition = checkPageBreak(doc, yPosition, 40);

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 100, 0); // Naranja
        doc.text('⚠ Áreas a Mejorar', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        feedback.weaknesses.forEach(weakness => {
            yPosition = checkPageBreak(doc, yPosition, 15);
            const lines = doc.splitTextToSize(`• ${weakness}`, maxWidth - 5);
            doc.text(lines, margin + 5, yPosition);
            yPosition += (lines.length * 6) + 3;
        });
        yPosition += 5;
    }

    // Sugerencias
    if (feedback.suggestions.length > 0) {
        yPosition = checkPageBreak(doc, yPosition, 40);

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 100, 200); // Azul
        doc.text('💡 Sugerencias', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        feedback.suggestions.forEach(suggestion => {
            yPosition = checkPageBreak(doc, yPosition, 15);
            const lines = doc.splitTextToSize(`• ${suggestion}`, maxWidth - 5);
            doc.text(lines, margin + 5, yPosition);
            yPosition += (lines.length * 6) + 3;
        });
        yPosition += 10;
    }

    // Nueva página para detalles
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Detalles por Ejercicio', margin, yPosition);
    yPosition += 15;

    // Detalles de cada ejercicio
    answers.forEach((answer, index) => {
        yPosition = checkPageBreak(doc, yPosition, 50);

        // Número de pregunta
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Pregunta ${index + 1}`, margin, yPosition);
        yPosition += 7;

        // Pregunta
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const questionLines = doc.splitTextToSize(answer.question, maxWidth);
        doc.text(questionLines, margin, yPosition);
        yPosition += (questionLines.length * 5) + 5;

        // Respuesta del usuario
        doc.setFont('helvetica', 'bold');
        doc.text('Tu respuesta: ', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(answer.isCorrect ? 0 : 200, answer.isCorrect ? 128 : 0, 0);
        doc.text(answer.userAnswer, margin + 30, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 6;

        // Respuesta correcta (si es incorrecta)
        if (!answer.isCorrect) {
            doc.setFont('helvetica', 'bold');
            doc.text('Respuesta correcta: ', margin, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 128, 0);
            doc.text(answer.correctAnswer, margin + 40, yPosition);
            doc.setTextColor(0, 0, 0);
            yPosition += 6;
        }

        // Feedback específico
        const detailedFb = feedback.detailedFeedback.find(f => f.questionId === answer.questionId);
        if (detailedFb) {
            yPosition += 3;
            doc.setFont('helvetica', 'italic');
            const fbLines = doc.splitTextToSize(detailedFb.feedback, maxWidth);
            doc.text(fbLines, margin, yPosition);
            yPosition += (fbLines.length * 5);
        }

        yPosition += 10;
    });

    // Footer en todas las páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Geometra - Página ${i} de ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    return doc;
}

/**
 * Verifica si se necesita un salto de página
 */
function checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomMargin = 20;

    if (currentY + requiredSpace > pageHeight - bottomMargin) {
        doc.addPage();
        return 20; // Volver al inicio de la nueva página
    }

    return currentY;
}

/**
 * Descarga el PDF generado
 */
export function downloadFeedbackPDF(options: PDFOptions): void {
    const doc = generateFeedbackPDF(options);
    const fileName = `retroalimentacion_${options.subject}_${options.date.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}
