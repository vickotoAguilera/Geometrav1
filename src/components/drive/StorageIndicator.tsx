'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { getStorageQuota, formatBytes, getStorageColor, StorageQuota } from '@/lib/drive-storage';

interface StorageIndicatorProps {
    accessToken: string;
    onQuotaLoaded?: (quota: StorageQuota) => void;
}

export function StorageIndicator({ accessToken, onQuotaLoaded }: StorageIndicatorProps) {
    const [quota, setQuota] = useState<StorageQuota | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStorageQuota();
    }, [accessToken]);

    const loadStorageQuota = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getStorageQuota(accessToken);
            setQuota(data);
            onQuotaLoaded?.(data);
        } catch (err) {
            console.error('Error loading storage quota:', err);
            setError('Error al cargar capacidad');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <HardDrive className="w-5 h-5 text-muted-foreground animate-pulse" />
                        <span className="text-sm text-muted-foreground">Cargando...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !quota) {
        return (
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-600">{error || 'Error'}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const percentage = (quota.usage / quota.limit) * 100;
    const { bgColor, textColor } = getStorageColor(percentage);
    const isAlmostFull = percentage >= 90;

    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Almacenamiento</span>
                        </div>
                        {isAlmostFull && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                    </div>

                    <Progress value={percentage} className="h-2" indicatorClassName={bgColor} />

                    <div className="flex items-center justify-between text-xs">
                        <span className={textColor}>
                            {formatBytes(quota.usage)} de {formatBytes(quota.limit)}
                        </span>
                        <span className={textColor + ' font-medium'}>
                            {Math.round(percentage)}%
                        </span>
                    </div>

                    {isAlmostFull && (
                        <p className="text-xs text-red-600">
                            ⚠️ Espacio casi lleno. Considera eliminar archivos.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
