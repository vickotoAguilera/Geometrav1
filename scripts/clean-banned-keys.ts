#!/usr/bin/env tsx

/**
 * Script para limpiar API keys baneadas del .env.local
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');

// Keys que funcionan
const workingKeys = [51, 52, 53, 54, 55, 56];

// Keys baneadas a eliminar
const bannedKeys = Array.from({ length: 49 }, (_, i) => i + 2); // 2-50

console.log('🧹 Limpiando API keys baneadas del .env.local...\n');

try {
    let content = readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    const newLines: string[] = [];
    let removedCount = 0;

    for (const line of lines) {
        let shouldKeep = true;

        // Verificar si la línea es una key baneada
        for (const keyNum of bannedKeys) {
            if (line.startsWith(`GOOGLE_GENAI_API_KEY_${keyNum}=`)) {
                shouldKeep = false;
                removedCount++;
                console.log(`❌ Eliminando key #${keyNum}`);
                break;
            }
        }

        if (shouldKeep) {
            newLines.push(line);
        }
    }

    // Escribir archivo limpio
    writeFileSync(envPath, newLines.join('\n'));

    console.log(`\n✅ Limpieza completada!`);
    console.log(`   Keys eliminadas: ${removedCount}`);
    console.log(`   Keys funcionando: ${workingKeys.length} (#${workingKeys.join(', #')})`);
    console.log('\n💡 El sistema ahora usará solo las 6 API keys que funcionan.');

} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}
