// Sistema inteligente de gestión de API keys para Gemini
// - Detecta automáticamente keys agotadas
// - Reset automático a las 4 AM (hora Chile)
// - Persistencia de estado entre ejecuciones
// - Solo usa keys con capacidad disponible

import { ai } from '@/ai/genkit';
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

class ApiKeyManager {
    private keys: ApiKeyStatus[] = [];
    private currentIndex = 0;
    private stateFile: string;
    private readonly RESET_HOUR = 4; // 4 AM Chile
    private readonly CHILE_TIMEZONE = 'America/Santiago';
    private static instance: ApiKeyManager | null = null;

    private constructor() {
        this.stateFile = resolve(process.cwd(), '.api-keys-state.json');
        this.loadKeys();
        this.loadState();
        this.checkAndResetIfNeeded();
    }

    static getInstance(): ApiKeyManager {
        if (!ApiKeyManager.instance) {
            ApiKeyManager.instance = new ApiKeyManager();
        }
        return ApiKeyManager.instance;
    }

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
    }

    private loadState() {
        if (!existsSync(this.stateFile)) {
            return;
        }

        try {
            const data = readFileSync(this.stateFile, 'utf-8');
            const state: ApiKeyState = JSON.parse(data);

            state.keys.forEach(savedKey => {
                const key = this.keys.find(k => k.keyNumber === savedKey.keyNumber);
                if (key) {
                    key.isExhausted = savedKey.isExhausted;
                    key.lastExhaustedAt = savedKey.lastExhaustedAt;
                    key.requestCount = savedKey.requestCount;
                }
            });
        } catch (error) {
            console.error('⚠️  Error cargando estado:', error);
        }
    }

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

    private getCurrentChileDate(): string {
        return new Date().toLocaleString('en-CA', {
            timeZone: this.CHILE_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).split(',')[0];
    }

    private getCurrentChileHour(): number {
        const chileTime = new Date().toLocaleString('en-US', {
            timeZone: this.CHILE_TIMEZONE,
            hour: 'numeric',
            hour12: false
        });
        return parseInt(chileTime);
    }

    private checkAndResetIfNeeded() {
        if (!existsSync(this.stateFile)) {
            return;
        }

        try {
            const data = readFileSync(this.stateFile, 'utf-8');
            const state: ApiKeyState = JSON.parse(data);

            const currentDate = this.getCurrentChileDate();
            const currentHour = this.getCurrentChileHour();

            if (state.lastResetDate !== currentDate && currentHour >= this.RESET_HOUR) {
                console.log('🔄 Nuevo día detectado (después de las 4 AM), reseteando todas las keys...');
                this.resetAllKeys();
            }
        } catch (error) {
            console.error('⚠️  Error verificando reset:', error);
        }
    }

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

    private getAvailableKeys(): ApiKeyStatus[] {
        return this.keys.filter(k => !k.isExhausted);
    }

    getNextKey(): { keyNumber: number; apiKey: string } | null {
        const available = this.getAvailableKeys();

        if (available.length === 0) {
            console.error('❌ No hay API keys disponibles');
            return null;
        }

        const key = available[this.currentIndex % available.length];
        this.currentIndex++;

        return {
            keyNumber: key.keyNumber,
            apiKey: key.apiKey
        };
    }

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

    incrementRequestCount(keyNumber: number) {
        const key = this.keys.find(k => k.keyNumber === keyNumber);
        if (key) {
            key.requestCount++;

            if (key.requestCount % 10 === 0) {
                this.saveState();
            }
        }
    }

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
}

// Instancia singleton
const manager = ApiKeyManager.getInstance();

/**
 * Genera contenido con IA usando el sistema inteligente de API keys
 */
export async function generateWithFallback(params: {
    model: string;
    prompt: string;
    config?: any;
}) {
    const { model, prompt, config } = params;
    const stats = manager.getStats();
    const maxAttempts = stats.available;

    if (maxAttempts === 0) {
        throw new Error('No hay API keys disponibles. Las cuotas se resetean a las 4 AM (Chile).');
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const keyInfo = manager.getNextKey();

        if (!keyInfo) {
            throw new Error('No se pudo obtener una API key disponible');
        }

        // Obtener el conteo actual de keys disponibles
        const currentStats = manager.getStats();
        const availableCount = currentStats.available;

        try {
            console.log(`🔑 Intentando con API key #${keyInfo.keyNumber} (${availableCount} disponibles)`);

            const result = await ai.generate({
                model,
                prompt,
                config: {
                    ...config,
                    apiKey: keyInfo.apiKey,
                },
            });

            // Incrementar contador de requests exitosos
            manager.incrementRequestCount(keyInfo.keyNumber);
            return result;

        } catch (error: any) {
            const errorMessage = error.message || String(error);

            // Detectar rate limit / quota exceeded
            if (errorMessage.includes('429') ||
                errorMessage.includes('quota') ||
                errorMessage.includes('RESOURCE_EXHAUSTED') ||
                errorMessage.includes('Too Many Requests')) {

                console.warn(`⚠️  API Key #${keyInfo.keyNumber} agotada`);
                manager.markKeyAsExhausted(keyInfo.keyNumber);

                // Mostrar cuántas keys quedan después de agotar esta
                const updatedStats = manager.getStats();
                console.log(`   📊 Keys restantes: ${updatedStats.available}`);

                // Continuar con la siguiente key
                continue;
            }

            // Si es otro tipo de error, lanzarlo
            throw error;
        }
    }

    throw new Error('Todas las API keys disponibles han sido agotadas');
}

/**
 * Obtiene estadísticas de uso
 */
export function getKeyStats() {
    return manager.getStats();
}

/**
 * Fuerza un reset manual de todas las keys (solo para testing)
 */
export function forceResetAllKeys() {
    const newManager = new (ApiKeyManager as any)();
    (newManager as any).resetAllKeys();
    console.log('🔄 Reset manual ejecutado');
}

