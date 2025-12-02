// Test simple para verificar el ancho del texto en jsPDF
const { jsPDF } = require('jspdf');

const doc = new jsPDF();
const pageWidth = doc.internal.pageSize.getWidth();
const margin = 20;
const maxWidth = pageWidth - (margin * 2);

console.log('📏 Dimensiones del PDF:');
console.log('  Ancho de página:', pageWidth, 'mm');
console.log('  Margen:', margin, 'mm');
console.log('  Ancho máximo de texto:', maxWidth, 'mm');
console.log('  Ancho máximo ajustado:', maxWidth - 5, 'mm');

// Probar con texto largo
doc.setFontSize(10);
doc.setFont('helvetica', 'normal');

const testTexts = [
    'Puedes buscar en la sección "Estudia" → Primero Medio → "Ángulos y sus Propiedades"',
    'También puedes buscar ejercicios resueltos en la sección "Practica" → Primero Medio',
    'ayudará a visualizar las relaciones entre los ángulos y a aplicar los teoremas correctos.'
];

console.log('\n🔍 Prueba de anchos de texto:');
testTexts.forEach((text, i) => {
    const width = doc.getTextWidth(text);
    const fits = width <= (maxWidth - 5);
    console.log(`\n  Texto ${i + 1}:`);
    console.log(`    "${text}"`);
    console.log(`    Ancho: ${width.toFixed(2)} mm`);
    console.log(`    ¿Cabe?: ${fits ? '✅ Sí' : '❌ No'}`);

    if (!fits) {
        // Dividir en palabras
        const words = text.split(' ');
        let currentLine = '';
        let lines = [];

        words.forEach(word => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = doc.getTextWidth(testLine);

            if (testWidth > (maxWidth - 5) && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        console.log(`    Dividido en ${lines.length} líneas:`);
        lines.forEach((line, j) => {
            const lineWidth = doc.getTextWidth(line);
            console.log(`      Línea ${j + 1}: "${line}" (${lineWidth.toFixed(2)} mm)`);
        });
    }
});

console.log('\n✅ Prueba completada');
