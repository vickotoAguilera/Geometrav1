/**
 * Script de Validación Completa del Sistema
 * 
 * Este script simula respuestas reales de usuarios y verifica que:
 * 1. Las respuestas correctas sean aceptadas
 * 2. Las respuestas con unidades sean aceptadas
 * 3. Las respuestas incorrectas sean rechazadas
 * 4. El sistema de retroalimentación funcione
 * 
 * Ejecutar: npx tsx scripts/test-complete-validation.ts
 */

import { validateBlankAnswer } from '../src/lib/exercise-validator';
import type { FillInBlank } from '../src/types/exercises';

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

interface TestCase {
    scenario: string;
    blank: FillInBlank;
    userAnswer: string;
    shouldBeCorrect: boolean;
    description: string;
}

const testCases: TestCase[] = [
    // ========== ESCENARIO 1: Respuestas Numéricas Exactas ==========
    {
        scenario: 'Números Exactos',
        blank: { id: 'test-1', correctAnswer: '6' },
        userAnswer: '6',
        shouldBeCorrect: true,
        description: 'Usuario escribe "6" cuando la respuesta es 6',
    },
    {
        scenario: 'Números Exactos',
        blank: { id: 'test-2', correctAnswer: '42' },
        userAnswer: '42',
        shouldBeCorrect: true,
        description: 'Usuario escribe "42" cuando la respuesta es 42',
    },
    {
        scenario: 'Números Exactos',
        blank: { id: 'test-3', correctAnswer: '3.14' },
        userAnswer: '3.14',
        shouldBeCorrect: true,
        description: 'Usuario escribe "3.14" cuando la respuesta es 3.14',
    },

    // ========== ESCENARIO 2: Respuestas con Unidades ==========
    {
        scenario: 'Respuestas con Unidades',
        blank: { id: 'test-4', correctAnswer: '6' },
        userAnswer: '6 km/h',
        shouldBeCorrect: true,
        description: 'Usuario escribe "6 km/h" cuando la respuesta es 6 (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Respuestas con Unidades',
        blank: { id: 'test-5', correctAnswer: '45' },
        userAnswer: '45°',
        shouldBeCorrect: true,
        description: 'Usuario escribe "45°" cuando la respuesta es 45 (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Respuestas con Unidades',
        blank: { id: 'test-6', correctAnswer: '80' },
        userAnswer: '80%',
        shouldBeCorrect: true,
        description: 'Usuario escribe "80%" cuando la respuesta es 80 (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Respuestas con Unidades',
        blank: { id: 'test-7', correctAnswer: '10' },
        userAnswer: '10 m/s',
        shouldBeCorrect: true,
        description: 'Usuario escribe "10 m/s" cuando la respuesta es 10 (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Respuestas con Unidades',
        blank: { id: 'test-8', correctAnswer: '100' },
        userAnswer: '100 km',
        shouldBeCorrect: true,
        description: 'Usuario escribe "100 km" cuando la respuesta es 100 (DEBE ACEPTARSE)',
    },

    // ========== ESCENARIO 3: Respuestas con Espacios ==========
    {
        scenario: 'Espacios Extra',
        blank: { id: 'test-9', correctAnswer: '6' },
        userAnswer: '  6  ',
        shouldBeCorrect: true,
        description: 'Usuario escribe "  6  " con espacios (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Espacios Extra',
        blank: { id: 'test-10', correctAnswer: '6' },
        userAnswer: '6   km/h',
        shouldBeCorrect: true,
        description: 'Usuario escribe "6   km/h" con espacios extra (DEBE ACEPTARSE)',
    },

    // ========== ESCENARIO 4: Mayúsculas/Minúsculas ==========
    {
        scenario: 'Case Insensitive',
        blank: { id: 'test-11', correctAnswer: 'seno' },
        userAnswer: 'SENO',
        shouldBeCorrect: true,
        description: 'Usuario escribe "SENO" cuando la respuesta es "seno" (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Case Insensitive',
        blank: { id: 'test-12', correctAnswer: 'Pi' },
        userAnswer: 'pi',
        shouldBeCorrect: true,
        description: 'Usuario escribe "pi" cuando la respuesta es "Pi" (DEBE ACEPTARSE)',
    },

    // ========== ESCENARIO 5: Tolerancia Numérica ==========
    {
        scenario: 'Tolerancia',
        blank: { id: 'test-13', correctAnswer: '10', tolerance: 0.5 },
        userAnswer: '10.3',
        shouldBeCorrect: true,
        description: 'Usuario escribe "10.3" con tolerancia 0.5 (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Tolerancia',
        blank: { id: 'test-14', correctAnswer: '10', tolerance: 0.5 },
        userAnswer: '9.7',
        shouldBeCorrect: true,
        description: 'Usuario escribe "9.7" con tolerancia 0.5 (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Tolerancia',
        blank: { id: 'test-15', correctAnswer: '10', tolerance: 0.5 },
        userAnswer: '11',
        shouldBeCorrect: false,
        description: 'Usuario escribe "11" fuera de tolerancia (DEBE RECHAZARSE)',
    },

    // ========== ESCENARIO 6: Múltiples Respuestas Correctas ==========
    {
        scenario: 'Múltiples Opciones',
        blank: { id: 'test-16', correctAnswer: ['(x+2)(x+3)', '(x+3)(x+2)'] },
        userAnswer: '(x+2)(x+3)',
        shouldBeCorrect: true,
        description: 'Usuario escribe primera opción correcta (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Múltiples Opciones',
        blank: { id: 'test-17', correctAnswer: ['(x+2)(x+3)', '(x+3)(x+2)'] },
        userAnswer: '(x+3)(x+2)',
        shouldBeCorrect: true,
        description: 'Usuario escribe segunda opción correcta (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Múltiples Opciones',
        blank: { id: 'test-18', correctAnswer: ['sí', 'si', 'yes'] },
        userAnswer: 'SI',
        shouldBeCorrect: true,
        description: 'Usuario escribe "SI" cuando las opciones son ["sí", "si", "yes"] (DEBE ACEPTARSE)',
    },

    // ========== ESCENARIO 7: Respuestas Incorrectas ==========
    {
        scenario: 'Respuestas Incorrectas',
        blank: { id: 'test-19', correctAnswer: '6' },
        userAnswer: '7',
        shouldBeCorrect: false,
        description: 'Usuario escribe "7" cuando la respuesta es 6 (DEBE RECHAZARSE)',
    },
    {
        scenario: 'Respuestas Incorrectas',
        blank: { id: 'test-20', correctAnswer: '6' },
        userAnswer: '',
        shouldBeCorrect: false,
        description: 'Usuario no escribe nada (DEBE RECHAZARSE)',
    },
    {
        scenario: 'Respuestas Incorrectas',
        blank: { id: 'test-21', correctAnswer: '(x+2)(x+3)' },
        userAnswer: '(x+1)(x+6)',
        shouldBeCorrect: false,
        description: 'Usuario escribe factorización incorrecta (DEBE RECHAZARSE)',
    },

    // ========== ESCENARIO 8: Casos Edge ==========
    {
        scenario: 'Casos Edge',
        blank: { id: 'test-22', correctAnswer: '0' },
        userAnswer: '0',
        shouldBeCorrect: true,
        description: 'Usuario escribe "0" cuando la respuesta es 0 (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Casos Edge',
        blank: { id: 'test-23', correctAnswer: '-5' },
        userAnswer: '-5',
        shouldBeCorrect: true,
        description: 'Usuario escribe "-5" número negativo (DEBE ACEPTARSE)',
    },
    {
        scenario: 'Casos Edge',
        blank: { id: 'test-24', correctAnswer: '1000' },
        userAnswer: '1000',
        shouldBeCorrect: true,
        description: 'Usuario escribe "1000" número grande (DEBE ACEPTARSE)',
    },
];

function runTests() {
    console.clear();
    log('\n🧪 VALIDACIÓN COMPLETA DEL SISTEMA DE RESPUESTAS\n', 'cyan');
    log('='.repeat(80), 'cyan');

    const scenarios = [...new Set(testCases.map(t => t.scenario))];
    let totalPassed = 0;
    let totalFailed = 0;
    const failedTests: TestCase[] = [];

    scenarios.forEach(scenario => {
        log(`\n📋 ${scenario}`, 'blue');
        log('-'.repeat(80), 'blue');

        const scenarioTests = testCases.filter(t => t.scenario === scenario);
        let scenarioPassed = 0;
        let scenarioFailed = 0;

        scenarioTests.forEach((test, index) => {
            const result = validateBlankAnswer(test.blank, test.userAnswer);
            const passed = result === test.shouldBeCorrect;

            if (passed) {
                scenarioPassed++;
                totalPassed++;
                log(`✅ ${test.description}`, 'green');
                log(`   Respuesta: "${test.userAnswer}" → ${result ? 'Correcta' : 'Incorrecta'} ✓`, 'green');
            } else {
                scenarioFailed++;
                totalFailed++;
                failedTests.push(test);
                log(`❌ ${test.description}`, 'red');
                log(`   Respuesta: "${test.userAnswer}"`, 'red');
                log(`   Esperado: ${test.shouldBeCorrect ? 'Correcta' : 'Incorrecta'}, Obtenido: ${result ? 'Correcta' : 'Incorrecta'}`, 'red');
            }
        });

        log(`\n   Resultado: ${scenarioPassed}/${scenarioTests.length} tests pasaron`, 
            scenarioFailed === 0 ? 'green' : 'yellow');
    });

    // Resumen final
    log('\n' + '='.repeat(80), 'cyan');
    log('\n📊 RESUMEN FINAL\n', 'cyan');

    const totalTests = testCases.length;
    const percentage = Math.round((totalPassed / totalTests) * 100);

    log(`Total de tests: ${totalTests}`, 'cyan');
    log(`✅ Pasaron: ${totalPassed} (${percentage}%)`, totalPassed === totalTests ? 'green' : 'yellow');
    log(`❌ Fallaron: ${totalFailed}`, totalFailed === 0 ? 'green' : 'red');

    if (failedTests.length > 0) {
        log('\n⚠️  TESTS QUE FALLARON:\n', 'yellow');
        failedTests.forEach((test, index) => {
            log(`${index + 1}. ${test.description}`, 'yellow');
            log(`   Respuesta: "${test.userAnswer}"`, 'yellow');
            log(`   Esperado: ${test.shouldBeCorrect ? 'Aceptar' : 'Rechazar'}`, 'yellow');
        });
    }

    log('\n' + '='.repeat(80), 'cyan');

    if (totalFailed === 0) {
        log('\n🎉 ¡PERFECTO! TODOS LOS TESTS PASARON\n', 'green');
        log('✅ El sistema valida correctamente:', 'green');
        log('   • Números exactos', 'green');
        log('   • Respuestas con unidades (km/h, °, %, etc.)', 'green');
        log('   • Espacios extra', 'green');
        log('   • Mayúsculas/minúsculas', 'green');
        log('   • Tolerancia numérica', 'green');
        log('   • Múltiples respuestas correctas', 'green');
        log('   • Rechaza respuestas incorrectas', 'green');
        log('   • Casos edge (0, negativos, números grandes)\n', 'green');
        return true;
    } else {
        log(`\n⚠️  ${totalFailed} TEST(S) FALLARON - REVISAR SISTEMA\n`, 'red');
        return false;
    }
}

const success = runTests();
process.exit(success ? 0 : 1);
