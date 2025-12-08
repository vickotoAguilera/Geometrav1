'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DriveFile } from '@/types/drive';
import { DriveFileItem } from '@/components/drive/DriveFileItem';
import { listDriveFiles } from '@/lib/drive-utils';
import { restoreFile, permanentlyDeleteFile, emptyTrash } from '@/lib/drive-storage';
import { Loader2, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function TrashPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (user) {
            loadAccessToken();
        }
    }, [user]);

    useEffect(() => {
        if (accessToken) {
            loadTrashedFiles();
        }
    }, [accessToken]);

    const loadAccessToken = async () => {
        if (!user) return;

        try {
            const driveConnectionRef = doc(firestore, `users/${user.uid}/integrations/google-drive`);
            const docSnap = await getDoc(driveConnectionRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const now = Date.now();

                if (data.expiresAt && data.expiresAt > now) {
                    setAccessToken(data.accessToken);
                    setIsConnected(true);
                } else {
                    setError('Tu conexión a Drive expiró. Ve a tu perfil para reconectar.');
                    setIsConnected(false);
                }
            } else {
                setError('No estás conectado a Google Drive. Ve a tu perfil para conectar.');
                setIsConnected(false);
            }
        } catch (err) {
            console.error('Error loading access token:', err);
            setError('Error al cargar conexión de Drive');
        }
    };

    const loadTrashedFiles = async () => {
        if (!accessToken) return;

        setLoading(true);
        setError(null);
        try {
            const response = await listDriveFiles(accessToken, {
                query: 'trashed=true',
                pageSize: 100,
                orderBy: 'modifiedTime desc',
            });
            setFiles(response.files);
        } catch (err) {
            console.error('Error loading trashed files:', err);
            setError('Error al cargar archivos eliminados');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (file: DriveFile) => {
        if (!accessToken) return;

        const confirmRestore = confirm(`¿Restaurar "${file.name}"?`);
        if (!confirmRestore) return;

        try {
            setLoading(true);
            await restoreFile(accessToken, file.id);
            alert(`✅ "${file.name}" restaurado`);
            loadTrashedFiles();
        } catch (err) {
            console.error('Error restoring file:', err);
            alert('Error al restaurar archivo');
        } finally {
            setLoading(false);
        }
    };

    const handlePermanentDelete = async (file: DriveFile) => {
        if (!accessToken) return;

        const confirmDelete = confirm(
            `⚠️ ¿Eliminar "${file.name}" PERMANENTEMENTE?\n\nEsta acción no se puede deshacer.`
        );
        if (!confirmDelete) return;

        try {
            setLoading(true);
            await permanentlyDeleteFile(accessToken, file.id);
            alert(`✅ "${file.name}" eliminado permanentemente`);
            loadTrashedFiles();
        } catch (err) {
            console.error('Error permanently deleting file:', err);
            alert('Error al eliminar archivo');
        } finally {
            setLoading(false);
        }
    };

    const handleEmptyTrash = async () => {
        if (!accessToken || files.length === 0) return;

        const confirmEmpty = confirm(
            `⚠️ ¿Vaciar papelera?\n\nSe eliminarán ${files.length} archivo(s) PERMANENTEMENTE.\nEsta acción no se puede deshacer.`
        );
        if (!confirmEmpty) return;

        try {
            setLoading(true);
            await emptyTrash(accessToken);
            alert(`✅ Papelera vaciada`);
            setFiles([]);
        } catch (err) {
            console.error('Error emptying trash:', err);
            alert('Error al vaciar papelera');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Papelera de Google Drive</CardTitle>
                        <CardDescription>Inicia sesión para acceder</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Papelera de Google Drive</CardTitle>
                        <CardDescription>Conecta tu cuenta de Google Drive</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <AlertDescription>{error || 'No estás conectado a Google Drive.'}</AlertDescription>
                        </Alert>
                        <Button className="mt-4" onClick={() => (window.location.href = '/perfil')}>
                            Ir a Perfil para Conectar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Trash2 className="w-6 h-6" />
                                Papelera ({files.length})
                            </CardTitle>
                            <CardDescription>Archivos eliminados de Google Drive</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => (window.location.href = '/drive-manager')}>
                                ← Volver
                            </Button>
                            {files.length > 0 && (
                                <Button variant="destructive" onClick={handleEmptyTrash} disabled={loading}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Vaciar papelera
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Error */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Lista de archivos */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Archivos en papelera</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Trash2 className="w-16 h-16 mb-4" />
                            <p className="text-lg">Papelera vacía</p>
                            <p className="text-sm">Los archivos eliminados aparecerán aquí</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {files.map((file) => (
                                <Card key={file.id} className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{file.mimeType.includes('folder') ? '📁' : '📄'}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Eliminado: {new Date(file.modifiedTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="default" onClick={() => handleRestore(file)}>
                                                <RotateCcw className="w-4 h-4 mr-1" />
                                                Restaurar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handlePermanentDelete(file)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
