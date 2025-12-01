#!/usr/bin/env tsx

/**
 * Script para generar pools de 100 ejercicios por materia y subirlos a R2
 * 
 * Uso:
 *   npm run generate-pool -- --grade=primero-medio --subject=ecuaciones-lineales
 *   npm run generate-pools (genera todos)
 */

import { generateExercises } from '../src/ai/flows/exercise-generator';
import { uploadExercisePool } from '../src/lib/r2-exercises';
import { generateHintsForExercise } from '../src/ai/flows/hints-generator';
import { curriculum } from '../src/data/curriculum';

const EXERCISES_PER_POOL = 100;

async function generatePool(gradeId: string, subjectId: string) {
    console.log(`\n🎯 Generando pool: ${gradeId}/${subjectId}`);
    console.log(`📊 Objetivo: ${EXERCISES_PER_POOL} ejercicios`);

    try {
        // Generar ejercicios en lotes de 10
        const batchSize = 10;
        const batches = Math.ceil(EXERCISES_PER_POOL / batchSize);
        const allExercises: any[] = [];

        for (let i = 0; i < batches; i++) {
            const remaining = EXERCISES_PER_POOL - allExercises.length;
            const currentBatchSize = Math.min(batchSize, remaining);

            console.log(`  📝 Lote ${i + 1}/${batches}: generando ${currentBatchSize} ejercicios...`);

            const exercises = await generateExercises({
                gradeId,
                subjectId,
                type: 'mixed',
                count: currentBatchSize,
                difficulty: 'medio',
            });

            allExercises.push(...exercises);
            console.log(`  ✅ Generados ${allExercises.length}/${EXERCISES_PER_POOL}`);

            // Pequeña pausa para no saturar la API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Generar hints para cada ejercicio
        console.log(`\n💡 Generando hints para ${allExercises.length} ejercicios...`);
        const exercisesWithHints = [];

        for (let i = 0; i < allExercises.length; i++) {
            const exercise = allExercises[i];
            console.log(`  Hints ${i + 1}/${allExercises.length}...`);

            try {
                const hints = await generateHintsForExercise(exercise);
                exercisesWithHints.push({
                    ...exercise,
                    hints,
                });
            } catch (error) {
                console.error(`  ⚠️ Error generando hints para ejercicio ${i + 1}:`, error);
                // Agregar sin hints
                exercisesWithHints.push(exercise);
            }

            // Pausa entre hints
            if (i < allExercises.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Subir a R2
        console.log(`\n☁️ Subiendo pool a R2...`);
        const success = await uploadExercisePool(gradeId, subjectId, exercisesWithHints);

        if (success) {
            console.log(`✅ Pool completado: ${gradeId}/${subjectId}`);
            console.log(`   📦 ${exercisesWithHints.length} ejercicios con hints`);
        } else {
            console.error(`❌ Error subiendo pool a R2`);
        }

        return success;
    } catch (error) {
        console.error(`❌ Error generando pool:`, error);
        return false;
    }
}

async function generateAllPools() {
    console.log('🚀 Generando todos los pools de ejercicios...\n');

    let totalGenerated = 0;
    let totalFailed = 0;

    for (const grade of curriculum) {
        console.log(`\n📚 ${grade.name}`);
        console.log(`   ${grade.subjects.length} materias`);

        for (const subject of grade.subjects) {
            const success = await generatePool(grade.id, subject.id);
            if (success) {
                totalGenerated++;
            } else {
                totalFailed++;
            }

            // Pausa entre materias
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\n\n📊 Resumen:`);
    console.log(`   ✅ Pools generados: ${totalGenerated}`);
    console.log(`   ❌ Pools fallidos: ${totalFailed}`);
    console.log(`   📦 Total ejercicios: ${totalGenerated * EXERCISES_PER_POOL}`);
}

// Parsear argumentos
const args = process.argv.slice(2);
const gradeArg = args.find(arg => arg.startsWith('--grade='))?.split('=')[1];
const subjectArg = args.find(arg => arg.startsWith('--subject='))?.split('=')[1];

// Ejecutar
if (gradeArg && subjectArg) {
    // Generar un solo pool
    generatePool(gradeArg, subjectArg)
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Error fatal:', error);
            process.exit(1);
        });
} else {
    // Generar todos los pools
    generateAllPools()
        .then(() => {
            console.log('\n✅ Proceso completado');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error fatal:', error);
            process.exit(1);
        });
}
