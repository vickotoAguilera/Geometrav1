'use client';

/**
 * Componente de debug para mostrar logs del upload de foto
 * Solo para desarrollo
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DebugLogs() {
    const [logs, setLogs] = useState<string[]>([]);
    const { toast } = useToast();

    // Interceptar console.log y console.error
    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args: any[]) => {
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');

            setLogs(prev => [...prev, `[LOG] ${new Date().toLocaleTimeString()}: ${message}`]);
            originalLog.apply(console, args);
        };

        console.error = (...args: any[]) => {
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');

            setLogs(prev => [...prev, `[ERROR] ${new Date().toLocaleTimeString()}: ${message}`]);
            originalError.apply(console, args);
        };

        console.warn = (...args: any[]) => {
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');

            setLogs(prev => [...prev, `[WARN] ${new Date().toLocaleTimeString()}: ${message}`]);
            originalWarn.apply(console, args);
        };

        // Agregar log inicial
        console.log('🔍 Debug Logs iniciado - Todos los logs aparecerán aquí');

        // Cleanup
        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    const copyLogs = () => {
        navigator.clipboard.writeText(logs.join('\n'));
        toast({
            title: '✅ Logs copiados',
            description: 'Los logs se han copiado al portapapeles',
        });
    };

    const clearLogs = () => {
        setLogs([]);
        console.log('🗑️ Logs limpiados');
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>🔍 Debug Logs (Solo Desarrollo)</span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={copyLogs} disabled={logs.length === 0}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                        </Button>
                        <Button size="sm" variant="outline" onClick={clearLogs} disabled={logs.length === 0}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Limpiar
                        </Button>
                    </div>
                </CardTitle>
                <CardDescription>
                    Logs de la consola del navegador para debugging. Total: {logs.length}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={logs.join('\n')}
                    readOnly
                    rows={15}
                    className="font-mono text-xs"
                    placeholder="Los logs aparecerán aquí automáticamente..."
                />
                {logs.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                        ✅ Capturando logs correctamente
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
