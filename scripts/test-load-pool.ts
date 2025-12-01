#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { getExercisePool, selectRandomExercises } from '../src/lib/r2-exercises';

async function testLoad() {
    console.log('\n🔍 Test de carga desde R2\n');

    const pool = await getExercisePool('primero-medio', 'ecuaciones-lineales');

    console.log(`✅ Pool cargado: ${pool.length} ejercicios\n`);

    if (pool.length > 0) {
        console.log('📋 Ejemplo de ejercicio:');
        const ex = pool[0];
        console.log(`   Título: ${ex.title}`);
        console.log(`   Tipo: ${ex.type}`);
        console.log(`   Dificultad: ${ex.difficulty}`);
        console.log(`   Puntos: ${ex.points}`);
        if ((ex as any).hints) {
            console.log(`   Hints: ${(ex as any).hints.length} niveles`);
        }

        console.log('\n🎲 Selección aleatoria de 5:');
        const random = selectRandomExercises(pool, 5);
        random.forEach((r, i) => {
            console.log(`   ${i + 1}. ${r.title}`);
        });
    }

    console.log('\n✅ Sistema completo funcionando!\n');
}

testLoad();
