// Script para probar la generación de PDF con texto largo
import { generateFeedbackPDF } from './src/lib/pdf-generator.js';

const testFeedback = `¡Hola! Aquí tienes tu retroalimentación sobre tu desempeño en Geometría en Geometra.

**1. Resumen General:**

¡Buen trabajo! Has demostrado un buen entendimiento general de los conceptos básicos de geometría. Obtuviste un 67% de respuestas correctas, lo que indica que estás avanzando bien. Sin embargo, hay un área específica que necesita un poco más de atención para que puedas alcanzar tu máximo potencial. ¡Vamos a ello!

**2. Fortalezas:**

* Aplicación de conceptos básicos: Lograste aplicar correctamente los conceptos básicos de geometría en la mayoría de los ejercicios. ¡Sigue así!
* Resolución de problemas: Demostraste habilidad para resolver problemas geométricos, llegando a la respuesta correcta en la mayoría de los casos.
* Comprensión general: Se nota que tienes una buena base para seguir construyendo tu conocimiento en geometría.

**3. Áreas de Mejora:**

* Propiedades de los ángulos: El ejercicio sobre propiedades de los ángulos fue el que te resultó más difícil. Es importante que repases este tema.
* Identificación de ángulos: Asegúrate de poder identificar correctamente los diferentes tipos de ángulos (agudo, obtuso, recto, llano, etc.) y sus relaciones.
* Aplicación de teoremas: Practica la aplicación de teoremas relacionados con ángulos, como el teorema de los ángulos suplementarios y complementarios.

**4. Recomendaciones:**

* Repasa la teoría: Dedica tiempo a repasar la teoría sobre propiedades de los ángulos. Asegúrate de entender las definiciones y los teoremas.
* Practica con ejercicios: Resuelve una variedad de ejercicios sobre ángulos, comenzando con los más sencillos y avanzando gradualmente a los más complejos.
* Visualiza los conceptos: Utiliza diagramas y dibujos para ayudarte a visualizar las propiedades de los ángulos. Esto te facilitará la comprensión.

**5. Próximos Pasos:**

* Prioriza el estudio de las propiedades de los ángulos: Dedica tiempo extra a este tema, revisando la teoría y practicando con ejercicios.
* Revisa el ejercicio incorrecto: Analiza detenidamente el ejercicio sobre propiedades de los ángulos que respondiste incorrectamente. Identifica dónde te equivocaste y por qué.

**📚 Recursos en Geometra**

Recuerda que puedes buscar en la sección 'Estudia' → Primero Medio → "Ángulos y sus Propiedades", ahí encontrarás la información que necesitas. Además, ¡no dudes en hablar con el Asistente Geometra! Él te ayudará con gusto en todo lo que necesites.

¡Sigue adelante!`;

const testExercises = [
    {
        id: 'test-1',
        type: 'fill-in-blanks',
        title: 'Teorema de Pitágoras',
        description: 'En un triángulo rectángulo, a² + b² = __',
        template: 'En un triángulo rectángulo, a² + b² = __',
        points: 10,
        difficulty: 'medio',
        blanks: [{ id: 'b1', correctAnswer: 'c²', position: 0 }]
    },
    {
        id: 'test-2',
        type: 'drag-drop',
        title: 'Propiedades de los ángulos',
        description: 'Clasifica los siguientes ángulos',
        points: 10,
        difficulty: 'facil',
        items: [],
        dropZones: []
    },
    {
        id: 'test-3',
        type: 'fill-in-blanks',
        title: 'Área del círculo',
        description: 'El área de un círculo es __',
        template: 'El área de un círculo es __',
        points: 10,
        difficulty: 'medio',
        blanks: [{ id: 'b1', correctAnswer: 'πr²', position: 0 }]
    }
];

const testUserAnswers = [
    { exerciseId: 'test-1', answer: 'c²', isCorrect: true, timeSpent: 45 },
    { exerciseId: 'test-2', answer: null, isCorrect: false, timeSpent: 30 },
    { exerciseId: 'test-3', answer: 'πr²', isCorrect: true, timeSpent: 25 }
];

console.log('🧪 Generando PDF de prueba...');

try {
    generateFeedbackPDF(
        testFeedback,
        testExercises,
        testUserAnswers,
        {
            subjectName: 'Geometría',
            gradeName: 'Primero Medio',
            studentName: 'Estudiante de Prueba'
        }
    );
    console.log('✅ PDF generado exitosamente!');
} catch (error) {
    console.error('❌ Error:', error);
}
