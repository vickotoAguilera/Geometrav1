/**
 * Script 2: Probar Lógica de Validación
 * 
 * Este script prueba que la lógica de validación funcione correctamente
 * con diferentes tipos de respuestas (correctas, incorrectas, con unidades, etc.)
 * 
 * Ejecutar: npx tsx scripts/test-validation-logic.ts
 */

import { validateBlankAnswer } from '../src/lib/exercise-validator';
import type { FillInBlank } from '../src/types/exercises';

interface TestCase {
    name: string;
    blank: FillInBlank;
    userAnswer: string;
    expected: boolean;
    description: string;
}

const testCases: TestCase[] = [
    // Respuestas numéricas exactas
    {
        name: 'Número exacto',
        blank: { id: 'test-1', correctAnswer: '6' },
        userAnswer: '6',
        expected: true,
        description: 'Respuesta numérica exacta',
    },
    {
        name: 'Número con unidades (km/h)',
        blank: { id: 'test-2', correctAnswer: '6' },
        userAnswer: '6 km/h',
        expected: true,
        description: 'Número con unidades debe aceptarse',
    },
    {
        name: 'Número con unidades sin espacio',
        blank: { id: 'test-3', correctAnswer: '45' },
        userAnswer: '45°',
        expected: true,
        description: 'Unidades sin espacio deben aceptarse',
    },
    {
        name: 'Número con m/s',
        blank: { id: 'test-4', correctAnswer: '10' },
        userAnswer: '10 m/s',
        expected: true,
        description: 'Unidades de velocidad m/s',
    },
    {
        name: 'Porcentaje',
        blank: { id: 'test-5', correctAnswer: '80' },
        userAnswer: '80%',
        expected: true,
        description: 'Porcentaje debe aceptarse',
    },
    
    // Respuestas con tolerancia
    {
        name: 'Tolerancia: dentro del rango',
        blank: { id: 'test-6', correctAnswer: '10', tolerance: 0.5 },
        userAnswer: '10.3',
        expected: true,
        description: 'Respuesta dentro de tolerancia',
    },
    {
        name: 'Tolerancia: fuera del rango',
        blank: { id: 'test-7', correctAnswer: '10', tolerance: 0.5 },
        userAnswer: '11',
        expected: false,
        description: 'Respuesta fuera de tolerancia',
    },
    
    // Respuestas múltiples
    {
        name: 'Múltiples respuestas correctas (opción 1)',
        blank: { id: 'test-8', correctAnswer: ['(x+2)(x+3)', '(x+3)(x+2)'] },
        userAnswer: '(x+2)(x+3)',
        expected: true,
        description: 'Primera opción correcta',
    },
    {
        name: 'Múltiples respuestas correctas (opción 2)',
        blank: { id: 'test-9', correctAnswer: ['(x+2)(x+3)', '(x+3)(x+2)'] },
        userAnswer: '(x+3)(x+2)',
        expected: true,
        description: 'Segunda opción correcta',
    },
    
    // Case insensitive
    {
        name: 'Mayúsculas/minúsculas',
        blank: { id: 'test-10', correctAnswer: 'seno' },
        userAnswer: 'SENO',
        expected: true,
        description: 'No debe ser case-sensitive',
    },
    
    // Espacios
    {
        name: 'Espacios extra',
        blank: { id: 'test-11', correctAnswer: 'pi' },
        userAnswer: '  pi  ',
        expected: true,
        description: 'Espacios deben eliminarse',
    },
    
    // Respuestas incorrectas
    {
        name: 'Respuesta incorrecta',
        blank: { id: 'test-12', correctAnswer: '6' },
        userAnswer: '7',
        expected: false,
        description: 'Respuesta incorrecta debe fallar',
    },
    {
        name: 'Respuesta vacía',
        blank: { id: 'test-13', correctAnswer: '6' },
        userAnswer: '',
        expected: false,
        description: 'Respuesta vacía debe fallar',
    },
];

function runTests() {
    console.log('🧪 Probando lógica de validación...\n');
    console.log('='.repeat(80));

    let passed = 0;
    let failed = 0;

    testCases.forEach((test, index) => {
        const result = validateBlankAnswer(test.blank, test.userAnswer);
        const success = result === test.expected;

        if (success) {
            passed++;
            console.log(`✅ Test ${index + 1}: ${test.name}`);
            console.log(`   ${test.description}`);
            console.log(`   Respuesta: "${test.userAnswer}" → ${result ? 'Correcta' : 'Incorrecta'}`);
        } else {
            failed++;
            console.log(`❌ Test ${index + 1}: ${test.name}`);
            console.log(`   ${test.description}`);
            console.log(`   Respuesta: "${test.userAnswer}"`);
            console.log(`   Esperado: ${test.expected}, Obtenido: ${result}`);
        }
        console.log('');
    });

    console.log('='.repeat(80));
    console.log(`\n📊 Resultados:`);
    console.log(`   ✅ Pasaron: ${passed}/${testCases.length}`);
    console.log(`   ❌ Fallaron: ${failed}/${testCases.length}`);

    if (failed === 0) {
        console.log('\n🎉 ¡TODOS LOS TESTS PASARON!\n');
        return true;
    } else {
        console.log(`\n⚠️  ${failed} test(s) fallaron\n`);
        return false;
    }
}

const success = runTests();
process.exit(success ? 0 : 1);
