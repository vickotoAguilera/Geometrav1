#!/usr/bin/env tsx

/**
 * Script de prueba para generar un pool pequeño de ejercicios
 * Genera 10 ejercicios con hints para testing
 */

// Cargar variables de entorno
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { generateExercises } from '../src/ai/flows/exercise-generator';
import { uploadExercisePool } from '../src/lib/r2-exercises';
import { generateHintsForExercise } from '../src/ai/flows/hints-generator';

const TEST_GRADE = 'primero-medio';
const TEST_SUBJECT = 'ecuaciones-lineales';
const TEST_COUNT = 10;

async function generateTestPool() {
    console.log(`\n🧪 Generando pool de prueba`);
    console.log(`📚 Curso: ${TEST_GRADE}`);
    console.log(`📖 Materia: ${TEST_SUBJECT}`);
    console.log(`📊 Cantidad: ${TEST_COUNT} ejercicios\n`);

    try {
        // 1. Generar ejercicios
        console.log(`📝 Generando ${TEST_COUNT} ejercicios...`);
        const exercises = await generateExercises({
            gradeId: TEST_GRADE,
            subjectId: TEST_SUBJECT,
            type: 'fill-in-blanks', // Usar tipo específico en lugar de mixed
            count: TEST_COUNT,
            difficulty: 'facil', // Empezar con facil para testing
        });

        console.log(`✅ Ejercicios generados: ${exercises.length}`);

        // 2. Generar hints para cada ejercicio
        console.log(`\n💡 Generando hints para cada ejercicio...`);
        const exercisesWithHints = [];

        for (let i = 0; i < exercises.length; i++) {
            const exercise = exercises[i];
            console.log(`  [${i + 1}/${exercises.length}] Generando hints para: ${exercise.title}`);

            try {
                const hints = await generateHintsForExercise(exercise);
                exercisesWithHints.push({
                    ...exercise,
                    hints,
                });
                console.log(`  ✅ Hints generados (${hints.length} niveles)`);
            } catch (error: any) {
                console.error(`  ⚠️ Error generando hints:`, error.message || error);
                // Si es rate limit, esperar más tiempo
                if (error.message?.includes('429') || error.message?.includes('quota')) {
                    console.log(`  ⏳ Rate limit detectado, esperando 30 segundos...`);
                    await new Promise(resolve => setTimeout(resolve, 30000));
                    // Reintentar
                    try {
                        const hints = await generateHintsForExercise(exercise);
                        exercisesWithHints.push({
                            ...exercise,
                            hints,
                        });
                        console.log(`  ✅ Hints generados en reintento (${hints.length} niveles)`);
                    } catch (retryError) {
                        console.error(`  ❌ Reintento falló, agregando sin hints`);
                        exercisesWithHints.push(exercise);
                    }
                } else {
                    exercisesWithHints.push(exercise);
                }
            }

            // Pausa más larga entre hints para evitar rate limit (3 segundos)
            if (i < exercises.length - 1) {
                console.log(`  ⏳ Esperando 3 segundos...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        // 3. Subir a R2
        console.log(`\n☁️ Subiendo pool de prueba a R2...`);
        const success = await uploadExercisePool(TEST_GRADE, TEST_SUBJECT, exercisesWithHints);

        if (success) {
            console.log(`\n✅ Pool de prueba completado exitosamente!`);
            console.log(`   📦 ${exercisesWithHints.length} ejercicios`);
            console.log(`   💡 Con hints de 3 niveles cada uno`);
            console.log(`   ☁️ Guardado en R2: exercises/${TEST_GRADE}/${TEST_SUBJECT}.json`);

            // Mostrar resumen de un ejercicio
            if (exercisesWithHints.length > 0) {
                const sample = exercisesWithHints[0];
                console.log(`\n📋 Ejemplo de ejercicio generado:`);
                console.log(`   Título: ${sample.title}`);
                console.log(`   Tipo: ${sample.type}`);
                console.log(`   Dificultad: ${sample.difficulty}`);
                console.log(`   Puntos: ${sample.points}`);
                if (sample.hints) {
                    console.log(`   Hints: ${sample.hints.length} niveles`);
                    sample.hints.forEach((hint: any) => {
                        console.log(`     - Nivel ${hint.level}: "${hint.text.substring(0, 50)}..." (-${hint.pointsPenalty} pts)`);
                    });
                }
            }

            return true;
        } else {
            console.error(`\n❌ Error subiendo pool a R2`);
            return false;
        }
    } catch (error) {
        console.error(`\n❌ Error generando pool de prueba:`, error);
        return false;
    }
}

// Ejecutar
console.log(`\n${'='.repeat(60)}`);
console.log(`🧪 GENERADOR DE POOL DE PRUEBA`);
console.log(`${'='.repeat(60)}`);

generateTestPool()
    .then(success => {
        console.log(`\n${'='.repeat(60)}`);
        if (success) {
            console.log(`✅ Proceso completado exitosamente`);
            console.log(`\nPróximo paso: Probar carga desde R2 en la aplicación`);
        } else {
            console.log(`❌ Proceso falló`);
        }
        console.log(`${'='.repeat(60)}\n`);
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
