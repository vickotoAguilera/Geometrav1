'use client';

/**
 * Componente para mostrar el uso de almacenamiento R2 del usuario
 * Límite: 100MB por usuario
 * Expiración: 7 días
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HardDrive, File, Trash2, AlertTriangle, Clock, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserStorageStats, deleteUserFile, deleteExpiredFiles, type StorageStats } from '@/lib/r2-storage-manager';
import { formatBytes, getDaysUntilExpiration } from '@/lib/storage-utils';
import { useUser } from '@/firebase';

export function StorageManager() {
    const { user } = useUser();
    const { toast } = useToast();
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingFile, setDeletingFile] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: string; key: string } | null>(null);
    const [previewContent, setPreviewContent] = useState<string>('');
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    const loadStats = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const storageStats = await getUserStorageStats(user.uid);
            setStats(storageStats);
        } catch (error) {
            console.error('Error loading storage stats:', error);
            toast({
                title: '❌ Error',
                description: 'No se pudieron cargar las estadísticas de almacenamiento',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [user]);

    const handleDeleteFile = async (fileKey: string, fileName: string) => {
        if (!user) return;

        if (!confirm(`¿Estás seguro de eliminar "${fileName}"?`)) return;

        try {
            setDeletingFile(fileKey);
            await deleteUserFile(user.uid, fileKey);

            toast({
                title: '✅ Archivo eliminado',
                description: `"${fileName}" se ha eliminado correctamente`,
            });

            // Recargar estadísticas
            await loadStats();
        } catch (error) {
            console.error('Error deleting file:', error);
            toast({
                title: '❌ Error',
                description: 'No se pudo eliminar el archivo',
                variant: 'destructive',
            });
        } finally {
            setDeletingFile(null);
        }
    };

    const handleDeleteExpired = async () => {
        if (!user) return;

        try {
            const deletedCount = await deleteExpiredFiles(user.uid);

            toast({
                title: '✅ Archivos eliminados',
                description: `Se eliminaron ${deletedCount} archivo(s) expirado(s)`,
            });

            await loadStats();
        } catch (error) {
            console.error('Error deleting expired files:', error);
            toast({
                title: '❌ Error',
                description: 'No se pudieron eliminar los archivos expirados',
                variant: 'destructive',
            });
        }
    };

    const handlePreviewFile = async (file: { name: string; url: string; type: string; key: string }) => {
        setPreviewFile(file);
        setIsLoadingPreview(true);
        setPreviewContent('');

        try {
            // Solo previsualizar archivos de texto
            if (file.type === 'text' || file.name.endsWith('.txt')) {
                // Usar API route para evitar CORS
                const response = await fetch(`/api/r2-file?key=${encodeURIComponent(file.key)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch file');
                }
                const text = await response.text();
                setPreviewContent(text);
            } else if (file.type === 'image') {
                // Para imágenes, mostrar la URL directamente
                setPreviewContent('IMAGE');
            } else {
                setPreviewContent('PREVIEW_NOT_AVAILABLE');
            }
        } catch (error) {
            console.error('Error loading preview:', error);
            setPreviewContent('ERROR_LOADING');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleDownloadFile = async (fileKey: string, fileName: string) => {
        try {
            // Usar API route para descargar
            const response = await fetch(`/api/r2-file?key=${encodeURIComponent(fileKey)}&download=true`);

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            // Crear blob y descargar
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: '📥 Descarga iniciada',
                description: `"${fileName}" se está descargando`,
            });
        } catch (error) {
            console.error('Error downloading file:', error);
            toast({
                title: '❌ Error',
                description: 'No se pudo descargar el archivo',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Cargando...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (!stats) return null;

    const getProgressColor = () => {
        if (stats.usagePercentage >= 90) return 'bg-red-500';
        if (stats.usagePercentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="space-y-6">
            {/* Resumen de Almacenamiento */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5" />
                        Almacenamiento R2
                    </CardTitle>
                    <CardDescription>
                        Gestiona tus archivos subidos (límite: 100MB, expiración: 7 días)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Barra de progreso */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Uso de almacenamiento</span>
                            <span className="font-medium">
                                {stats.usedMB} MB / {stats.maxMB} MB ({stats.usagePercentage}%)
                            </span>
                        </div>
                        <Progress
                            value={stats.usagePercentage}
                            className="h-3"
                        />
                        {stats.usagePercentage >= 90 && (
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>¡Almacenamiento casi lleno! Elimina archivos antiguos.</span>
                            </div>
                        )}
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-sm text-muted-foreground">Total de archivos</p>
                            <p className="text-2xl font-bold">{stats.filesCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Espacio disponible</p>
                            <p className="text-2xl font-bold">
                                {formatBytes(stats.maxBytes - stats.usedBytes)}
                            </p>
                        </div>
                    </div>

                    {/* Botón para limpiar expirados */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteExpired}
                        className="w-full"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar archivos expirados
                    </Button>
                </CardContent>
            </Card>

            {/* Lista de Archivos */}
            <Card>
                <CardHeader>
                    <CardTitle>Mis Archivos ({stats.filesCount})</CardTitle>
                    <CardDescription>
                        Archivos subidos a R2 (se eliminan automáticamente después de 7 días)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.files.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No tienes archivos subidos
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {stats.files.map((file) => {
                                const daysLeft = getDaysUntilExpiration(file.expiresAt);
                                const isExpiringSoon = daysLeft <= 2;

                                return (
                                    <div
                                        key={file.key}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <File className="w-5 h-5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{file.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{formatBytes(file.size)}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {daysLeft > 0 ? `${daysLeft} días restantes` : 'Expirado'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isExpiringSoon && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Expira pronto
                                                </Badge>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePreviewFile({ name: file.name, url: file.url, type: file.type, key: file.key })}
                                                title="Vista previa"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownloadFile(file.key, file.name)}
                                                title="Descargar"
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteFile(file.key, file.name)}
                                                disabled={deletingFile === file.key}
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Diálogo de Vista Previa */}
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <File className="w-5 h-5" />
                            {previewFile?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Vista previa del archivo
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {isLoadingPreview ? (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-muted-foreground">Cargando vista previa...</p>
                            </div>
                        ) : previewContent === 'IMAGE' ? (
                            <div className="flex justify-center">
                                <img
                                    src={previewFile?.url}
                                    alt={previewFile?.name}
                                    className="max-w-full h-auto rounded-lg"
                                />
                            </div>
                        ) : previewContent === 'PREVIEW_NOT_AVAILABLE' ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground mb-4">
                                    Vista previa no disponible para este tipo de archivo
                                </p>
                                <Button onClick={() => previewFile && handleDownloadFile(previewFile.key, previewFile.name)}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar archivo
                                </Button>
                            </div>
                        ) : previewContent === 'ERROR_LOADING' ? (
                            <div className="text-center py-12 text-red-600">
                                <p>Error al cargar la vista previa</p>
                            </div>
                        ) : (
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                {previewContent}
                            </pre>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
