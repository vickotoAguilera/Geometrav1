// Script de prueba para la API de retroalimentación
const testData = {
    exercises: [
        {
            id: 'test-1',
            type: 'fill-in-blanks',
            title: 'Teorema de Pitágoras',
            description: 'En un triángulo rectángulo, a² + b² = __',
            points: 10,
            difficulty: 'medium',
            blanks: [{ id: 'b1', correctAnswer: 'c²' }]
        },
        {
            id: 'test-2',
            type: 'drag-drop',
            title: 'Propiedades de los ángulos',
            description: 'Clasifica los siguientes ángulos',
            points: 10,
            difficulty: 'easy',
            items: [],
            dropZones: []
        },
        {
            id: 'test-3',
            type: 'fill-in-blanks',
            title: 'Área del círculo',
            description: 'El área de un círculo es __',
            points: 10,
            difficulty: 'medium',
            blanks: [{ id: 'b1', correctAnswer: 'πr²' }]
        }
    ],
    userAnswers: [
        { exerciseId: 'test-1', answer: 'c²', isCorrect: true, timeSpent: 45 },
        { exerciseId: 'test-2', answer: null, isCorrect: false, timeSpent: 30 },
        { exerciseId: 'test-3', answer: 'πr²', isCorrect: true, timeSpent: 25 }
    ],
    subjectName: 'Geometría',
    gradeName: 'Primero Medio'
};

async function testFeedbackAPI() {
    console.log('🧪 Testing feedback API...');
    console.log('📤 Sending request with data:', JSON.stringify(testData, null, 2));

    try {
        const response = await fetch('http://localhost:9002/api/generate-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            return;
        }

        const data = await response.json();
        console.log('✅ Success! Feedback received:');
        console.log('─'.repeat(80));
        console.log(data.feedback);
        console.log('─'.repeat(80));
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testFeedbackAPI();
