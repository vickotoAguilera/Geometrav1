/**
 * Script de Prueba: Sistema de Puntos y Niveles de Geometra
 * 
 * Este script verifica que el sistema de puntos funcione correctamente:
 * - Cálculo de niveles basado en puntos
 * - Progreso hacia el siguiente nivel
 * - Puntos por actividades
 * - Detección de subida de nivel
 * 
 * Ejecutar: npx tsx scripts/test-points-system.ts
 */

import {
    LEVELS,
    POINTS_RULES,
    calculateLevel,
    getLevelProgress,
    getPointsForActivity,
    didLevelUp,
    getNewLevel,
    calculateTotalPoints,
    getAllLevels,
    getLevelByNumber,
} from '../src/lib/points-system';

import {
    getUserLevel,
    getNextLevelPoints,
    getLevelProgress as getLevelProgressUtils,
    formatPoints,
} from '../src/lib/points-utils';

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

function log(message: string, color: keyof typeof colors = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
    log(`✅ ${message}`, 'green');
}

function logError(message: string) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message: string) {
    log(`ℹ️  ${message}`, 'cyan');
}

function logSection(title: string) {
    console.log('\n' + '='.repeat(60));
    log(title, 'magenta');
    console.log('='.repeat(60));
}

// ============================================================================
// PRUEBA 1: Verificar que los niveles estén correctamente definidos
// ============================================================================
function testLevelsDefinition() {
    logSection('PRUEBA 1: Definición de Niveles');

    const expectedLevels = 7;
    if (LEVELS.length === expectedLevels) {
        logSuccess(`Se encontraron ${expectedLevels} niveles correctamente`);
    } else {
        logError(`Se esperaban ${expectedLevels} niveles, pero se encontraron ${LEVELS.length}`);
        return false;
    }

    // Verificar que los niveles estén en orden ascendente
    let isOrdered = true;
    for (let i = 1; i < LEVELS.length; i++) {
        if (LEVELS[i].minPoints <= LEVELS[i - 1].minPoints) {
            logError(`Nivel ${i + 1} tiene minPoints menor o igual que el nivel ${i}`);
            isOrdered = false;
        }
    }

    if (isOrdered) {
        logSuccess('Los niveles están correctamente ordenados');
    }

    // Mostrar tabla de niveles
    console.log('\n📊 Tabla de Niveles:');
    console.log('┌─────┬──────────────┬──────────┬──────────┬──────┐');
    console.log('│ Niv │ Nombre       │ Min Pts  │ Max Pts  │ Icon │');
    console.log('├─────┼──────────────┼──────────┼──────────┼──────┤');
    LEVELS.forEach(level => {
        const maxPts = level.maxPoints === Infinity ? '∞' : level.maxPoints.toString();
        console.log(
            `│ ${level.level.toString().padEnd(3)} │ ${level.name.padEnd(12)} │ ${level.minPoints.toString().padEnd(8)} │ ${maxPts.padEnd(8)} │ ${level.icon}    │`
        );
    });
    console.log('└─────┴──────────────┴──────────┴──────────┴──────┘');

    return isOrdered;
}

// ============================================================================
// PRUEBA 2: Verificar cálculo de nivel basado en puntos
// ============================================================================
function testLevelCalculation() {
    logSection('PRUEBA 2: Cálculo de Nivel por Puntos');

    const testCases = [
        { points: 0, expectedLevel: 1, expectedName: 'Principiante' },
        { points: 50, expectedLevel: 1, expectedName: 'Principiante' },
        { points: 100, expectedLevel: 2, expectedName: 'Aprendiz' },
        { points: 250, expectedLevel: 2, expectedName: 'Aprendiz' },
        { points: 300, expectedLevel: 3, expectedName: 'Estudiante' },
        { points: 500, expectedLevel: 3, expectedName: 'Estudiante' },
        { points: 600, expectedLevel: 4, expectedName: 'Intermedio' },
        { points: 800, expectedLevel: 4, expectedName: 'Intermedio' },
        { points: 1000, expectedLevel: 5, expectedName: 'Avanzado' },
        { points: 1250, expectedLevel: 5, expectedName: 'Avanzado' },
        { points: 1500, expectedLevel: 6, expectedName: 'Experto' },
        { points: 2000, expectedLevel: 6, expectedName: 'Experto' },
        { points: 2500, expectedLevel: 7, expectedName: 'Maestro' },
        { points: 5000, expectedLevel: 7, expectedName: 'Maestro' },
        { points: 10000, expectedLevel: 7, expectedName: 'Maestro' },
    ];

    let allPassed = true;

    testCases.forEach(({ points, expectedLevel, expectedName }) => {
        const level = calculateLevel(points);
        const passed = level.level === expectedLevel && level.name === expectedName;

        if (passed) {
            logSuccess(`${points} pts → Nivel ${level.level} (${level.name}) ${level.icon}`);
        } else {
            logError(`${points} pts → Esperado: Nivel ${expectedLevel} (${expectedName}), Obtenido: Nivel ${level.level} (${level.name})`);
            allPassed = false;
        }
    });

    return allPassed;
}

// ============================================================================
// PRUEBA 3: Verificar progreso hacia el siguiente nivel
// ============================================================================
function testLevelProgress() {
    logSection('PRUEBA 3: Progreso hacia el Siguiente Nivel');

    const testCases = [
        { points: 0, expectedProgress: 0 },
        { points: 50, expectedProgress: 50 }, // 50/100 = 50%
        { points: 100, expectedProgress: 0 }, // Nuevo nivel
        { points: 200, expectedProgress: 50 }, // (200-100)/(300-100) = 100/200 = 50%
        { points: 300, expectedProgress: 0 }, // Nuevo nivel
        { points: 450, expectedProgress: 50 }, // (450-300)/(600-300) = 150/300 = 50%
        { points: 2500, expectedProgress: 100 }, // Nivel máximo
    ];

    let allPassed = true;

    testCases.forEach(({ points, expectedProgress }) => {
        const progress = getLevelProgress(points);
        const actualProgress = Math.round(progress.progressPercentage);
        const passed = actualProgress === expectedProgress;

        if (passed) {
            logSuccess(`${points} pts → Progreso: ${actualProgress}%`);
        } else {
            logError(`${points} pts → Esperado: ${expectedProgress}%, Obtenido: ${actualProgress}%`);
            allPassed = false;
        }
    });

    return allPassed;
}

// ============================================================================
// PRUEBA 4: Verificar puntos por actividades
// ============================================================================
function testPointsForActivities() {
    logSection('PRUEBA 4: Puntos por Actividades');

    console.log('\n📋 Tabla de Actividades y Puntos:');
    console.log('┌─────────────────────────────────────┬────────┐');
    console.log('│ Actividad                           │ Puntos │');
    console.log('├─────────────────────────────────────┼────────┤');

    let allPassed = true;

    POINTS_RULES.forEach(rule => {
        const points = getPointsForActivity(rule.activity);
        const passed = points === rule.points;

        if (passed) {
            console.log(`│ ${rule.description.padEnd(35)} │ ${points.toString().padStart(6)} │`);
        } else {
            logError(`Actividad "${rule.activity}" tiene puntos incorrectos`);
            allPassed = false;
        }
    });

    console.log('└─────────────────────────────────────┴────────┘');

    // Verificar actividad inexistente
    const invalidPoints = getPointsForActivity('actividad_inexistente');
    if (invalidPoints === 0) {
        logSuccess('Actividad inexistente retorna 0 puntos correctamente');
    } else {
        logError(`Actividad inexistente debería retornar 0, pero retornó ${invalidPoints}`);
        allPassed = false;
    }

    return allPassed;
}

// ============================================================================
// PRUEBA 5: Verificar detección de subida de nivel
// ============================================================================
function testLevelUp() {
    logSection('PRUEBA 5: Detección de Subida de Nivel');

    const testCases = [
        { previous: 50, new: 80, shouldLevelUp: false },
        { previous: 90, new: 110, shouldLevelUp: true }, // 1 → 2
        { previous: 250, new: 320, shouldLevelUp: true }, // 2 → 3
        { previous: 500, new: 550, shouldLevelUp: false },
        { previous: 550, new: 650, shouldLevelUp: true }, // 3 → 4
        { previous: 2400, new: 2600, shouldLevelUp: true }, // 6 → 7
        { previous: 3000, new: 3500, shouldLevelUp: false }, // Ya en nivel máximo
    ];

    let allPassed = true;

    testCases.forEach(({ previous, new: newPoints, shouldLevelUp }) => {
        const leveledUp = didLevelUp(previous, newPoints);
        const passed = leveledUp === shouldLevelUp;

        const previousLevel = calculateLevel(previous);
        const newLevel = calculateLevel(newPoints);

        if (passed) {
            if (shouldLevelUp) {
                logSuccess(`${previous} → ${newPoints} pts: ¡Subió de nivel! ${previousLevel.icon} → ${newLevel.icon}`);
            } else {
                logSuccess(`${previous} → ${newPoints} pts: Sin cambio de nivel ${previousLevel.icon}`);
            }
        } else {
            logError(`${previous} → ${newPoints} pts: Esperado ${shouldLevelUp ? 'subir' : 'no subir'}, pero ${leveledUp ? 'subió' : 'no subió'}`);
            allPassed = false;
        }
    });

    return allPassed;
}

// ============================================================================
// PRUEBA 6: Simulación de progreso de usuario
// ============================================================================
function testUserProgressSimulation() {
    logSection('PRUEBA 6: Simulación de Progreso de Usuario');

    logInfo('Simulando el progreso de un usuario desde 0 puntos...\n');

    let totalPoints = 0;
    const activities = [
        { activity: 'ejercicio_completado', count: 5 }, // 5 ejercicios = 50 pts
        { activity: 'racha_diaria', count: 7 }, // 7 días = 35 pts
        { activity: 'ejercicio_perfecto', count: 3 }, // 3 perfectos = 60 pts
        { activity: 'prueba_completada', count: 2 }, // 2 pruebas = 100 pts
        { activity: 'paes_completada', count: 1 }, // 1 PAES = 75 pts
        { activity: 'evaluacion_inicial', count: 1 }, // 1 evaluación = 30 pts
    ];

    console.log('📝 Actividades realizadas:');
    activities.forEach(({ activity, count }) => {
        const rule = POINTS_RULES.find(r => r.activity === activity);
        const points = getPointsForActivity(activity) * count;
        totalPoints += points;
        console.log(`   • ${rule?.description} x${count} = ${points} pts`);
    });

    console.log(`\n🎯 Total de puntos acumulados: ${totalPoints}`);

    const level = calculateLevel(totalPoints);
    const progress = getLevelProgress(totalPoints);

    console.log(`\n📊 Estado del usuario:`);
    console.log(`   Nivel: ${level.level} - ${level.name} ${level.icon}`);
    console.log(`   Progreso al siguiente nivel: ${Math.round(progress.progressPercentage)}%`);
    console.log(`   Puntos para siguiente nivel: ${progress.pointsToNextLevel}`);

    if (progress.nextLevel) {
        console.log(`   Siguiente nivel: ${progress.nextLevel.name} ${progress.nextLevel.icon}`);
    } else {
        console.log(`   ¡Ya alcanzó el nivel máximo! 👑`);
    }

    logSuccess('Simulación completada correctamente');
    return true;
}

// ============================================================================
// PRUEBA 7: Verificar formateo de puntos
// ============================================================================
function testPointsFormatting() {
    logSection('PRUEBA 7: Formateo de Puntos');

    const testCases = [
        { points: 0, expected: '0' },
        { points: 100, expected: '100' },
        { points: 1000, expected: '1.000' },
        { points: 10000, expected: '10.000' },
        { points: 100000, expected: '100.000' },
    ];

    let allPassed = true;

    testCases.forEach(({ points, expected }) => {
        const formatted = formatPoints(points);
        const passed = formatted === expected;

        if (passed) {
            logSuccess(`${points} → "${formatted}"`);
        } else {
            logError(`${points} → Esperado: "${expected}", Obtenido: "${formatted}"`);
            allPassed = false;
        }
    });

    return allPassed;
}

// ============================================================================
// EJECUTAR TODAS LAS PRUEBAS
// ============================================================================
async function runAllTests() {
    console.clear();
    log('\n🧪 SISTEMA DE PRUEBAS: PUNTOS Y NIVELES DE GEOMETRA\n', 'cyan');

    const tests = [
        { name: 'Definición de Niveles', fn: testLevelsDefinition },
        { name: 'Cálculo de Nivel', fn: testLevelCalculation },
        { name: 'Progreso de Nivel', fn: testLevelProgress },
        { name: 'Puntos por Actividades', fn: testPointsForActivities },
        { name: 'Detección de Subida de Nivel', fn: testLevelUp },
        { name: 'Simulación de Progreso', fn: testUserProgressSimulation },
        { name: 'Formateo de Puntos', fn: testPointsFormatting },
    ];

    const results: { name: string; passed: boolean }[] = [];

    for (const test of tests) {
        try {
            const passed = test.fn();
            results.push({ name: test.name, passed });
        } catch (error) {
            logError(`Error en prueba "${test.name}": ${error}`);
            results.push({ name: test.name, passed: false });
        }
    }

    // Resumen final
    logSection('RESUMEN DE PRUEBAS');

    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log('\n📋 Resultados:');
    results.forEach(({ name, passed }) => {
        if (passed) {
            logSuccess(name);
        } else {
            logError(name);
        }
    });

    console.log('\n' + '='.repeat(60));
    if (failedTests === 0) {
        log(`\n🎉 ¡TODAS LAS PRUEBAS PASARON! (${passedTests}/${totalTests})`, 'green');
        log('\n✅ El sistema de puntos y niveles funciona correctamente.\n', 'green');
    } else {
        log(`\n⚠️  ALGUNAS PRUEBAS FALLARON (${passedTests}/${totalTests} pasaron)`, 'yellow');
        log(`\n❌ ${failedTests} prueba(s) necesitan corrección.\n`, 'red');
    }
    console.log('='.repeat(60) + '\n');

    return failedTests === 0;
}

// Ejecutar pruebas
runAllTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        logError(`Error fatal: ${error}`);
        process.exit(1);
    });
