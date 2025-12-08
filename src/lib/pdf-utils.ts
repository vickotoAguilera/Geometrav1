import jsPDF from 'jspdf';
import { Nota, Highlight } from '@/types/notes';

/**
 * Exporta una nota a PDF con formato profesional
 */
export const exportNoteToPDF = (nota: Nota, highlights?: Highlight[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // Función auxiliar para verificar si necesitamos nueva página
    const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
            return true;
        }
        return false;
    };

    // Función auxiliar para agregar texto con manejo de páginas
    const addText = (text: string | string[], x: number, fontSize: number = 12, isBold: boolean = false) => {
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setFontSize(fontSize);

        const lines = Array.isArray(text) ? text : doc.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.5;

        for (let i = 0; i < lines.length; i++) {
            checkPageBreak(lineHeight);
            doc.text(lines[i], x, yPos);
            yPos += lineHeight;
        }
    };

    // ===== ENCABEZADO =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(30, 30, 30);

    const titleLines = doc.splitTextToSize(nota.titulo, maxWidth);
    titleLines.forEach((line: string) => {
        doc.text(line, margin, yPos);
        yPos += 12;
    });

    yPos += 5;

    // ===== METADATOS =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);

    if (nota.temaNombre) {
        doc.text(`📚 Tema: ${nota.temaNombre}`, margin, yPos);
        yPos += 6;
    }

    const fechaCreacion = new Date(nota.fecha_creacion).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const fechaModificacion = new Date(nota.fecha_modificacion).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    doc.text(`📅 Creado: ${fechaCreacion}`, margin, yPos);
    yPos += 6;

    if (fechaCreacion !== fechaModificacion) {
        doc.text(`✏️  Modificado: ${fechaModificacion}`, margin, yPos);
        yPos += 6;
    }

    // Línea separadora
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // ===== CONTENIDO DE LA NOTA =====
    if (nota.contenido && nota.contenido.trim()) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text("Contenido", margin, yPos);
        yPos += 10;

        // Convertir HTML a texto plano
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = nota.contenido;
        const text = tempDiv.textContent || tempDiv.innerText || '';

        if (text.trim()) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(40, 40, 40);

            const contentLines = doc.splitTextToSize(text, maxWidth);
            const lineHeight = 6;

            for (let i = 0; i < contentLines.length; i++) {
                checkPageBreak(lineHeight + 5);
                doc.text(contentLines[i], margin, yPos);
                yPos += lineHeight;
            }
        } else {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text("(Sin contenido)", margin, yPos);
            yPos += 8;
        }

        yPos += 10;
    }

    // ===== HIGHLIGHTS =====
    if (highlights && highlights.length > 0) {
        checkPageBreak(30);

        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text("Textos Resaltados", margin, yPos);
        yPos += 10;

        highlights.forEach((highlight, index) => {
            checkPageBreak(25);

            // Color del highlight
            const colors = {
                yellow: [255, 235, 59],
                green: [76, 175, 80],
                blue: [33, 150, 243],
                pink: [233, 30, 99]
            };

            const [r, g, b] = colors[highlight.color] || [200, 200, 200];

            // Cuadro de color
            doc.setFillColor(r, g, b);
            doc.rect(margin, yPos - 3, 4, 6, 'F');

            // Texto del highlight
            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);

            const highlightLines = doc.splitTextToSize(`"${highlight.texto}"`, maxWidth - 10);
            highlightLines.forEach((line: string) => {
                checkPageBreak(5);
                doc.text(line, margin + 8, yPos);
                yPos += 5;
            });

            // Fecha del highlight
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            const fechaHighlight = new Date(highlight.fecha).toLocaleDateString('es-CL');
            doc.text(fechaHighlight, margin + 8, yPos);
            yPos += 10;
        });
    }

    // ===== PIE DE PÁGINA =====
    const totalPages = doc.getNumberOfPages();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(
            `Página ${i} de ${totalPages} • Generado con Geometra`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // ===== GUARDAR ARCHIVO =====
    const filename = nota.titulo
        .replace(/[^a-z0-9áéíóúñ\s]/gi, '')
        .replace(/\s+/g, '_')
        .toLowerCase() || 'nota';

    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`${filename}_${timestamp}.pdf`);
};
