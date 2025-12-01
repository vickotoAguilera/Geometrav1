import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

interface ApiKeyStatus {
    keyNumber: number;
    apiKey: string;
    isExhausted: boolean;
    lastExhaustedAt?: string;
    requestCount: number;
}

interface ApiKeyState {
    keys: ApiKeyStatus[];
    lastResetDate: string;
}

/**
 * Gestor inteligente de API keys con:
 * - Detección automática de keys agotadas
 * - Reset automático a las 4 AM (hora Chile)
 * - Persistencia de estado entre ejecuciones
 * - Rotación solo entre keys disponibles
 */
export class ApiKeyManager {
    private keys: ApiKeyStatus[] = [];
    private currentIndex = 0;
    private stateFile: string;
    private readonly RESET_HOUR = 4; // 4 AM Chile
    private readonly CHILE_TIMEZONE = 'America/Santiago';

    constructor(stateFilePath?: string) {
        this.stateFile = stateFilePath || resolve(process.cwd(), '.api-keys-state.json');
        this.loadKeys();
        this.loadState();
        this.checkAndResetIfNeeded();
    }

    /**
     * Carga todas las API keys desde las variables de entorno
     */
    private loadKeys() {
        const keys: ApiKeyStatus[] = [];

        for (let i = 1; i <= 100; i++) {
            const apiKey = process.env[`GOOGLE_GENAI_API_KEY_${i}`];
            if (apiKey) {
                keys.push({
                    keyNumber: i,
                    apiKey,
                    isExhausted: false,
                    requestCount: 0
                });
            }
        }

        if (keys.length === 0) {
            throw new Error('No se encontraron API keys en las variables de entorno');
        }

        this.keys = keys;
        console.log(`📊 Cargadas ${keys.length} API keys`);
    }

    /**
     * Carga el estado persistente desde el archivo
     */
    private loadState() {
        if (!existsSync(this.stateFile)) {
            console.log('📝 No hay estado previo, iniciando desde cero');
            return;
        }

        try {
            const data = readFileSync(this.stateFile, 'utf-8');
            const state: ApiKeyState = JSON.parse(data);

            // Actualizar estado de las keys
            state.keys.forEach(savedKey => {
                const key = this.keys.find(k => k.keyNumber === savedKey.keyNumber);
                if (key) {
                    key.isExhausted = savedKey.isExhausted;
                    key.lastExhaustedAt = savedKey.lastExhaustedAt;
                    key.requestCount = savedKey.requestCount;
                }
            });

            console.log('✅ Estado cargado desde archivo');
        } catch (error) {
            console.error('⚠️  Error cargando estado:', error);
        }
    }

    /**
     * Guarda el estado actual en el archivo
     */
    private saveState() {
        const state: ApiKeyState = {
            keys: this.keys,
            lastResetDate: this.getCurrentChileDate()
        };

        try {
            writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
        } catch (error) {
            console.error('⚠️  Error guardando estado:', error);
        }
    }

    /**
     * Obtiene la fecha actual en hora de Chile
     */
    private getCurrentChileDate(): string {
        return new Date().toLocaleString('en-CA', {
            timeZone: this.CHILE_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).split(',')[0];
    }

    /**
     * Obtiene la hora actual en Chile
     */
    private getCurrentChileHour(): number {
        const chileTime = new Date().toLocaleString('en-US', {
            timeZone: this.CHILE_TIMEZONE,
            hour: 'numeric',
            hour12: false
        });
        return parseInt(chileTime);
    }

    /**
     * Verifica si es necesario resetear las keys (después de las 4 AM)
     */
    private checkAndResetIfNeeded() {
        if (!existsSync(this.stateFile)) {
            return;
        }

        try {
            const data = readFileSync(this.stateFile, 'utf-8');
            const state: ApiKeyState = JSON.parse(data);

            const currentDate = this.getCurrentChileDate();
            const currentHour = this.getCurrentChileHour();

            // Si cambió el día y ya pasaron las 4 AM, resetear
            if (state.lastResetDate !== currentDate && currentHour >= this.RESET_HOUR) {
                console.log('🔄 Nuevo día detectado (después de las 4 AM), reseteando todas las keys...');
                this.resetAllKeys();
            }
        } catch (error) {
            console.error('⚠️  Error verificando reset:', error);
        }
    }

    /**
     * Resetea todas las keys (marca como disponibles)
     */
    private resetAllKeys() {
        this.keys.forEach(key => {
            key.isExhausted = false;
            key.requestCount = 0;
            delete key.lastExhaustedAt;
        });

        this.currentIndex = 0;
        this.saveState();

        const available = this.getAvailableKeys().length;
        console.log(`✅ Todas las keys reseteadas. ${available} keys disponibles`);
    }

    /**
     * Obtiene las keys disponibles (no agotadas)
     */
    private getAvailableKeys(): ApiKeyStatus[] {
        return this.keys.filter(k => !k.isExhausted);
    }

    /**
     * Obtiene la siguiente API key disponible
     */
    getNextKey(): { keyNumber: number; apiKey: string } | null {
        const available = this.getAvailableKeys();

        if (available.length === 0) {
            console.error('❌ No hay API keys disponibles');
            return null;
        }

        // Rotar entre las keys disponibles
        const key = available[this.currentIndex % available.length];
        this.currentIndex++;

        return {
            keyNumber: key.keyNumber,
            apiKey: key.apiKey
        };
    }

    /**
     * Marca una key como agotada
     */
    markKeyAsExhausted(keyNumber: number) {
        const key = this.keys.find(k => k.keyNumber === keyNumber);
        if (key && !key.isExhausted) {
            key.isExhausted = true;
            key.lastExhaustedAt = new Date().toISOString();
            this.saveState();

            const available = this.getAvailableKeys().length;
            console.log(`⚠️  API Key #${keyNumber} marcada como agotada. Quedan ${available} keys disponibles`);
        }
    }

    /**
     * Incrementa el contador de requests de una key
     */
    incrementRequestCount(keyNumber: number) {
        const key = this.keys.find(k => k.keyNumber === keyNumber);
        if (key) {
            key.requestCount++;

            // Guardar estado cada 10 requests
            if (key.requestCount % 10 === 0) {
                this.saveState();
            }
        }
    }

    /**
     * Obtiene estadísticas de uso
     */
    getStats() {
        const available = this.getAvailableKeys();
        const exhausted = this.keys.filter(k => k.isExhausted);
        const totalRequests = this.keys.reduce((sum, k) => sum + k.requestCount, 0);

        return {
            total: this.keys.length,
            available: available.length,
            exhausted: exhausted.length,
            totalRequests,
            availableKeys: available.map(k => k.keyNumber),
            exhaustedKeys: exhausted.map(k => k.keyNumber)
        };
    }

    /**
     * Imprime un resumen del estado actual
     */
    printStatus() {
        const stats = this.getStats();

        console.log('\n' + '═'.repeat(70));
        console.log('📊 ESTADO DE API KEYS');
        console.log('═'.repeat(70));
        console.log(`Total de keys: ${stats.total}`);
        console.log(`✅ Disponibles: ${stats.available} keys`);
        if (stats.available > 0) {
            console.log(`   Keys: ${stats.availableKeys.join(', ')}`);
        }
        console.log(`⚠️  Agotadas: ${stats.exhausted} keys`);
        if (stats.exhausted > 0) {
            console.log(`   Keys: ${stats.exhaustedKeys.join(', ')}`);
        }
        console.log(`📈 Total requests: ${stats.totalRequests}`);
        console.log(`🕐 Próximo reset: Mañana a las 4:00 AM (Chile)`);
        console.log('═'.repeat(70) + '\n');
    }
}
