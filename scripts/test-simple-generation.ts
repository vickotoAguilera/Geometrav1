#!/usr/bin/env tsx

/**
 * Test simple de generación de ejercicios
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { generateExercises } from '../src/ai/flows/exercise-generator';

async function test() {
    console.log('🧪 Test de generación de ejercicios\n');

    try {
        const exercises = await generateExercises({
            gradeId: 'primero-medio',
            subjectId: 'ecuaciones-lineales',
            type: 'fill-in-blanks',
            count: 2,
            difficulty: 'facil',
        });

        console.log(`✅ Generados: ${exercises.length} ejercicios\n`);

        exercises.forEach((ex, i) => {
            console.log(`${i + 1}. ${ex.title}`);
            console.log(`   Tipo: ${ex.type}`);
            console.log(`   Dificultad: ${ex.difficulty}`);
            console.log(`   Puntos: ${ex.points}\n`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

test();
