import jsPDF from 'jspdf';
import { Nota } from '@/types/notes';

export const exportNoteToPDF = (nota: Nota) => {
    const doc = new jsPDF();

    // Configuración de fuente
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);

    // Título
    const title = doc.splitTextToSize(nota.titulo, 170);
    doc.text(title, 20, 20);

    let yPos = 20 + (title.length * 10);

    // Metadatos
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    if (nota.temaNombre) {
        doc.text(`Tema: ${nota.temaNombre}`, 20, yPos);
        yPos += 5;
    }

    doc.text(`Fecha: ${new Date(nota.fecha_modificacion).toLocaleDateString()}`, 20, yPos);
    yPos += 15;

    // Contenido
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    // Convertir HTML a texto plano simple para el PDF
    // Nota: Para soporte completo de HTML/imágenes se requeriría html2canvas
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = nota.contenido;
    const text = tempDiv.textContent || tempDiv.innerText || '';

    const splitText = doc.splitTextToSize(text, 170);

    // Manejo de paginación básico
    if (yPos + splitText.length * 7 > 280) {
        // Si es muy largo, lo añadimos y jsPDF gestiona algunas cosas, 
        // pero para texto simple splitTextToSize ayuda.
        // Para simplificar en esta versión v1:
        doc.text(splitText, 20, yPos);
    } else {
        doc.text(splitText, 20, yPos);
    }

    // Guardar
    const filename = nota.titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'nota';
    doc.save(`${filename}.pdf`);
};
