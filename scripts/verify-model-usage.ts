#!/usr/bin/env tsx

/**
 * Script para verificar que todos los archivos usen el modelo correcto
 * Modelo esperado: gemini-2.0-flash (SIN -exp, SIN -001)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const EXPECTED_MODEL = 'gemini-2.0-flash';
const FORBIDDEN_MODELS = ['gemini-2.0-flash-exp', 'gemini-2.0-flash-001', 'gemini-1.5-flash', 'gemini-1.5-pro'];

interface ModelUsage {
    file: string;
    line: number;
    model: string;
    context: string;
}

function searchInDirectory(dir: string, results: ModelUsage[] = []): ModelUsage[] {
    const files = readdirSync(dir);

    for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            // Ignorar node_modules, .next, etc.
            if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
                searchInDirectory(fullPath, results);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // Buscar referencias a modelos Gemini
                const modelMatch = line.match(/model:\s*['"]googleai\/(gemini-[^'"]+)['"]/);
                if (modelMatch) {
                    results.push({
                        file: fullPath.replace(process.cwd(), '.'),
                        line: index + 1,
                        model: modelMatch[1],
                        context: line.trim(),
                    });
                }
            });
        }
    }

    return results;
}

console.log('\n' + '='.repeat(70));
console.log('🔍 VERIFICACIÓN DE MODELOS GEMINI EN USO');
console.log('='.repeat(70) + '\n');

console.log(`✅ Modelo esperado: ${EXPECTED_MODEL}`);
console.log(`❌ Modelos prohibidos: ${FORBIDDEN_MODELS.join(', ')}\n`);

const srcDir = join(process.cwd(), 'src');
const results = searchInDirectory(srcDir);

console.log(`📋 Encontradas ${results.length} referencias a modelos Gemini:\n`);

let correctCount = 0;
let incorrectCount = 0;

const incorrectUsages: ModelUsage[] = [];

results.forEach((usage) => {
    const isCorrect = usage.model === EXPECTED_MODEL;
    const isForbidden = FORBIDDEN_MODELS.includes(usage.model);

    if (isCorrect) {
        correctCount++;
        console.log(`✅ ${usage.file}:${usage.line}`);
        console.log(`   Modelo: ${usage.model}`);
    } else {
        incorrectCount++;
        incorrectUsages.push(usage);
        const icon = isForbidden ? '❌' : '⚠️';
        console.log(`${icon} ${usage.file}:${usage.line}`);
        console.log(`   Modelo: ${usage.model} ${isForbidden ? '(PROHIBIDO)' : '(DESCONOCIDO)'}`);
    }
    console.log();
});

console.log('='.repeat(70));
console.log('📊 RESUMEN');
console.log('='.repeat(70));
console.log(`✅ Correctos: ${correctCount}`);
console.log(`❌ Incorrectos: ${incorrectCount}`);
console.log('='.repeat(70) + '\n');

if (incorrectCount > 0) {
    console.log('⚠️ ACCIÓN REQUERIDA: Los siguientes archivos necesitan corrección:\n');
    incorrectUsages.forEach((usage) => {
        console.log(`   ${usage.file}:${usage.line}`);
        console.log(`   Cambiar: ${usage.model} → ${EXPECTED_MODEL}\n`);
    });
    process.exit(1);
} else {
    console.log('🎉 ¡Todos los archivos usan el modelo correcto!\n');
    process.exit(0);
}
