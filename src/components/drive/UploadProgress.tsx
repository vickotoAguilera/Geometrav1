'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, AlertCircle, Loader2, Minimize2 } from 'lucide-react';
import { formatSpeed, formatTime } from '@/lib/drive-upload';
import { formatFileSize } from '@/lib/drive-utils';

export interface UploadItem {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    speed: number;
    timeRemaining: number;
    error?: string;
}

interface UploadProgressProps {
    uploads: UploadItem[];
    onClose: () => void;
    onMinimize?: () => void;
}

export function UploadProgress({ uploads, onClose, onMinimize }: UploadProgressProps) {
    if (uploads.length === 0) return null;

    const completedCount = uploads.filter(u => u.status === 'completed').length;
    const errorCount = uploads.filter(u => u.status === 'error').length;
    const uploadingCount = uploads.filter(u => u.status === 'uploading').length;

    // Calcular progreso total ponderado por tamaño
    const totalSize = uploads.reduce((sum, u) => sum + u.file.size, 0);
    const totalLoaded = uploads.reduce((sum, u) => sum + (u.file.size * u.progress / 100), 0);
    const totalProgress = totalSize > 0 ? (totalLoaded / totalSize) * 100 : 0;

    // Calcular velocidad total
    const totalSpeed = uploads
        .filter(u => u.status === 'uploading')
        .reduce((sum, u) => sum + u.speed, 0);

    // Calcular tiempo restante total
    const remainingBytes = uploads
        .filter(u => u.status !== 'completed')
        .reduce((sum, u) => sum + (u.file.size * (100 - u.progress) / 100), 0);
    const totalTimeRemaining = totalSpeed > 0 ? remainingBytes / totalSpeed : 0;

    const allCompleted = completedCount === uploads.length;
    const hasErrors = errorCount > 0;

    return (
        <Card className="fixed bottom-4 right-4 w-96 shadow-lg z-50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        {allCompleted ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                Subida completada
                            </>
                        ) : hasErrors ? (
                            <>
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                Error en subida
                            </>
                        ) : (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Subiendo {uploads.length} archivo(s)
                            </>
                        )}
                    </CardTitle>
                    <div className="flex gap-1">
                        {onMinimize && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMinimize}>
                                <Minimize2 className="w-4 h-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Lista de archivos */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                    {uploads.map((upload) => (
                        <div key={upload.id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {upload.status === 'completed' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    ) : upload.status === 'error' ? (
                                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    ) : upload.status === 'uploading' ? (
                                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-muted flex-shrink-0" />
                                    )}
                                    <span className="truncate" title={upload.file.name}>
                                        {upload.file.name}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground ml-2">
                                    {formatFileSize(upload.file.size)}
                                </span>
                            </div>

                            {upload.status === 'error' ? (
                                <p className="text-xs text-red-600">{upload.error}</p>
                            ) : upload.status !== 'completed' ? (
                                <>
                                    <Progress value={upload.progress} className="h-1" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{Math.round(upload.progress)}%</span>
                                        {upload.status === 'uploading' && (
                                            <span>
                                                {formatSpeed(upload.speed)} • {formatTime(upload.timeRemaining)}
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-1 bg-green-600 rounded-full" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Progreso total */}
                {!allCompleted && uploads.length > 1 && (
                    <div className="pt-3 border-t space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Total</span>
                            <span>{Math.round(totalProgress)}%</span>
                        </div>
                        <Progress value={totalProgress} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                                {completedCount}/{uploads.length} completados
                            </span>
                            {uploadingCount > 0 && (
                                <span>
                                    {formatSpeed(totalSpeed)} • {formatTime(totalTimeRemaining)}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Mensaje final */}
                {allCompleted && (
                    <p className="text-sm text-green-600 text-center">
                        ✅ {uploads.length} archivo(s) subido(s) exitosamente
                    </p>
                )}
                {hasErrors && !allCompleted && (
                    <p className="text-sm text-red-600 text-center">
                        ⚠️ {errorCount} archivo(s) con error
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
