#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { ApiKeyManager } from './lib/api-key-manager';

async function testApiKeyManager() {
    console.log('🧪 Probando el sistema de gestión de API keys\n');

    // Crear el manager
    const manager = new ApiKeyManager();

    // Mostrar estado inicial
    manager.printStatus();

    // Simular uso de keys
    console.log('📝 Simulando uso de API keys...\n');

    for (let i = 0; i < 5; i++) {
        const key = manager.getNextKey();
        if (key) {
            console.log(`🔑 Usando API Key #${key.keyNumber}`);
            manager.incrementRequestCount(key.keyNumber);
        }
    }

    console.log('\n📝 Simulando agotamiento de una key...\n');
    const keyToExhaust = manager.getNextKey();
    if (keyToExhaust) {
        console.log(`⚠️  Marcando key #${keyToExhaust.keyNumber} como agotada`);
        manager.markKeyAsExhausted(keyToExhaust.keyNumber);
    }

    // Mostrar estado final
    manager.printStatus();

    console.log('✅ Test completado\n');
    console.log('💡 El estado se ha guardado en .api-keys-state.json');
    console.log('   Las keys agotadas se resetearán automáticamente mañana a las 4 AM\n');
}

testApiKeyManager()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
