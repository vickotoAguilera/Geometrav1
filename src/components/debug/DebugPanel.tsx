'use client';

import { useState, useEffect } from 'react';
import { Terminal, X } from 'lucide-react';

interface DebugLog {
    timestamp: Date;
    level: 'info' | 'error' | 'success' | 'warning';
    message: string;
    data?: any;
}

const STORAGE_KEY = 'geometra_debug_logs';

// Cargar logs desde localStorage
function loadLogsFromStorage(): DebugLog[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.map((log: any) => ({
                ...log,
                timestamp: new Date(log.timestamp)
            }));
        }
    } catch (error) {
        console.error('Error loading logs:', error);
    }
    return [];
}

// Guardar logs en localStorage
function saveLogsToStorage(logs: DebugLog[]) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
        console.error('Error saving logs:', error);
    }
}

let globalLogs: DebugLog[] = loadLogsFromStorage();
let logListeners: ((logs: DebugLog[]) => void)[] = [];

export function addDebugLog(level: DebugLog['level'], message: string, data?: any) {
    const log: DebugLog = {
        timestamp: new Date(),
        level,
        message,
        data
    };

    globalLogs.push(log);

    // Mantener solo los últimos 100 logs
    if (globalLogs.length > 100) {
        globalLogs = globalLogs.slice(-100);
    }

    // Guardar en localStorage
    saveLogsToStorage(globalLogs);

    // Notificar a todos los listeners
    logListeners.forEach(listener => listener([...globalLogs]));

    // También loguear en consola
    const emoji = {
        info: 'ℹ️',
        error: '❌',
        success: '✅',
        warning: '⚠️'
    }[level];

    console.log(`${emoji} [${new Date().toLocaleTimeString()}] ${message}`, data || '');
}

export function clearDebugLogs() {
    globalLogs = [];
    saveLogsToStorage([]);
    logListeners.forEach(listener => listener([]));
}

export default function DebugPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<DebugLog[]>([]);

    // No mostrar en producción
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    // Cargar logs al montar
    useEffect(() => {
        setLogs(loadLogsFromStorage());
    }, []);

    // Suscribirse a cambios en los logs
    useEffect(() => {
        const listener = (newLogs: DebugLog[]) => setLogs(newLogs);
        logListeners.push(listener);
        return () => {
            logListeners = logListeners.filter(l => l !== listener);
        };
    }, []);

    const clearLogs = () => {
        clearDebugLogs();
    };

    const getLevelColor = (level: DebugLog['level']) => {
        switch (level) {
            case 'info': return 'text-blue-600 bg-blue-50';
            case 'error': return 'text-red-600 bg-red-50';
            case 'success': return 'text-green-600 bg-green-50';
            case 'warning': return 'text-yellow-600 bg-yellow-50';
        }
    };

    const getLevelEmoji = (level: DebugLog['level']) => {
        switch (level) {
            case 'info': return 'ℹ️';
            case 'error': return '❌';
            case 'success': return '✅';
            case 'warning': return '⚠️';
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 z-50 rounded-full bg-gray-800 p-3 text-white shadow-lg hover:bg-gray-700"
                title="Abrir panel de debug"
            >
                <Terminal className="h-5 w-5" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 rounded-lg bg-white shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-800 p-3 rounded-t-lg">
                <div className="flex items-center gap-2 text-white">
                    <Terminal className="h-4 w-4" />
                    <span className="font-semibold text-sm">Debug Logs</span>
                    <span className="text-xs text-gray-400">({logs.length})</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={clearLogs}
                        className="rounded px-2 py-1 text-xs text-white hover:bg-gray-700"
                    >
                        Limpiar
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded p-1 text-white hover:bg-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Logs */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1 bg-gray-50">
                {logs.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                        No hay logs aún
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div
                            key={index}
                            className={`rounded p-2 text-xs ${getLevelColor(log.level)}`}
                        >
                            <div className="flex items-start gap-2">
                                <span>{getLevelEmoji(log.level)}</span>
                                <div className="flex-1">
                                    <div className="font-mono text-xs text-gray-500">
                                        {log.timestamp.toLocaleTimeString()}
                                    </div>
                                    <div className="font-medium">{log.message}</div>
                                    {log.data && (
                                        <pre className="mt-1 overflow-x-auto text-xs bg-white/50 p-1 rounded">
                                            {JSON.stringify(log.data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
