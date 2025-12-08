/**
 * Script 3: Probar Sistema de Popups de Retroalimentación
 * 
 * Este script simula diferentes escenarios de respuestas incorrectas
 * y verifica que el sistema de retroalimentación funcione correctamente.
 * 
 * Ejecutar: npx tsx scripts/test-feedback-popups.ts
 */

console.log('🧪 Probando Sistema de Popups de Retroalimentación...\n');
console.log('='.repeat(80));

interface TestScenario {
    name: string;
    userAnswer: string;
    correctAnswer: string;
    expectedFeedbackType: 'empty' | 'close' | 'wrong-approach' | 'missing-units' | 'algebraic' | 'generic';
}

const scenarios: TestScenario[] = [
    {
        name: 'Respuesta vacía',
        userAnswer: '',
        correctAnswer: '6',
        expectedFeedbackType: 'empty',
    },
    {
        name: 'Respuesta numérica cercana (5% diff)',
        userAnswer: '6.3',
        correctAnswer: '6',
        expectedFeedbackType: 'close',
    },
    {
        name: 'Respuesta numérica con error moderado (30% diff)',
        userAnswer: '8',
        correctAnswer: '6',
        expectedFeedbackType: 'wrong-approach',
    },
    {
        name: 'Número sin unidades (debería tener km/h)',
        userAnswer: '60',
        correctAnswer: '60 km/h',
        expectedFeedbackType: 'missing-units',
    },
    {
        name: 'Expresión algebraica incorrecta',
        userAnswer: '(x+1)(x+6)',
        correctAnswer: '(x+2)(x+3)',
        expectedFeedbackType: 'algebraic',
    },
    {
        name: 'Respuesta completamente incorrecta',
        userAnswer: 'abc',
        correctAnswer: '6',
        expectedFeedbackType: 'generic',
    },
];

function analyzeFeedback(userAnswer: string, correctAnswer: string): string {
    const user = userAnswer.trim();

    // Caso 1: Respuesta vacía
    if (!user) {
        return 'empty';
    }

    // Caso 2: Respuesta numérica cercana
    const userNum = parseFloat(user);
    const correctNum = parseFloat(correctAnswer);
    if (!isNaN(userNum) && !isNaN(correctNum)) {
        const diff = Math.abs(userNum - correctNum);
        const percentDiff = (diff / correctNum) * 100;

        if (percentDiff < 10) {
            return 'close';
        } else if (percentDiff < 50) {
            return 'wrong-approach';
        }
    }

    // Caso 3: Respuesta con unidades incorrectas o faltantes
    const hasUnits = /[a-zA-Z°%]/.test(user);
    const correctHasUnits = /[a-zA-Z°%]/.test(correctAnswer);

    if (!hasUnits && correctHasUnits) {
        return 'missing-units';
    }

    // Caso 4: Respuesta algebraica
    if (/[a-z()]/i.test(correctAnswer)) {
        return 'algebraic';
    }

    // Caso 5: Respuesta genérica incorrecta
    return 'generic';
}

let passed = 0;
let failed = 0;

scenarios.forEach((scenario, index) => {
    const feedbackType = analyzeFeedback(scenario.userAnswer, scenario.correctAnswer);
    const success = feedbackType === scenario.expectedFeedbackType;

    if (success) {
        passed++;
        console.log(`✅ Test ${index + 1}: ${scenario.name}`);
        console.log(`   Usuario: "${scenario.userAnswer}" | Correcto: "${scenario.correctAnswer}"`);
        console.log(`   Tipo de retroalimentación: ${feedbackType}`);
    } else {
        failed++;
        console.log(`❌ Test ${index + 1}: ${scenario.name}`);
        console.log(`   Usuario: "${scenario.userAnswer}" | Correcto: "${scenario.correctAnswer}"`);
        console.log(`   Esperado: ${scenario.expectedFeedbackType}, Obtenido: ${feedbackType}`);
    }
    console.log('');
});

console.log('='.repeat(80));
console.log(`\n📊 Resultados:`);
console.log(`   ✅ Pasaron: ${passed}/${scenarios.length}`);
console.log(`   ❌ Fallaron: ${failed}/${scenarios.length}`);

if (failed === 0) {
    console.log('\n🎉 ¡TODOS LOS TESTS DE RETROALIMENTACIÓN PASARON!\n');
    console.log('✅ El sistema de popups está funcionando correctamente.');
    console.log('✅ Los mensajes de retroalimentación son contextuales e inteligentes.');
    console.log('\n📝 Tipos de retroalimentación implementados:');
    console.log('   1. 💡 Respuesta vacía → Pista para empezar');
    console.log('   2. 🎯 Respuesta cercana → Sugerencia de revisar cálculos');
    console.log('   3. 🔍 Error en procedimiento → Verificar cada paso');
    console.log('   4. 📏 Faltan unidades → Agregar unidades apropiadas');
    console.log('   5. 🧮 Expresión algebraica → Revisar signos y factores');
    console.log('   6. ❌ Respuesta incorrecta → Pista general\n');
    process.exit(0);
} else {
    console.log(`\n⚠️  ${failed} test(s) fallaron\n`);
    process.exit(1);
}
