'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DriveFile } from '@/types/drive';
import { DriveFileItem } from '@/components/drive/DriveFileItem';
import { StorageIndicator } from '@/components/drive/StorageIndicator';
import { listDriveFiles, searchDriveFiles, createFolder } from '@/lib/drive-utils';
import { uploadFileToDrive, validateFile } from '@/lib/drive-upload';
import { deleteFile, permanentlyDeleteFile } from '@/lib/drive-storage';
import { UploadProgress, UploadItem } from '@/components/drive/UploadProgress';
import { Loader2, Search, FolderOpen, Grid3x3, List, RefreshCw, ChevronRight, Home, FolderPlus, Upload, Trash2, ArrowUpDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { doc, getDoc, collection, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { processGoogleDriveFile } from '@/app/actions';

export default function DriveManagerPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Estados para navegación de carpetas
    const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
    const [folderPath, setFolderPath] = useState<{ id: string | undefined; name: string }[]>([
        { id: undefined, name: 'Mi Drive' }
    ]);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Estados para drag & drop y uploads
    const [isDragging, setIsDragging] = useState(false);
    const [uploads, setUploads] = useState<UploadItem[]>([]);

    // Estados para ordenamiento y filtros
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
    const [filterType, setFilterType] = useState<'all' | 'folder' | 'document' | 'image' | 'video' | 'audio'>('all');

    // Cargar access token
    useEffect(() => {
        if (user) {
            loadAccessToken();
        }
    }, [user]);

    // Cargar archivos cuando tengamos el token o cambie la carpeta
    useEffect(() => {
        if (accessToken) {
            loadFiles();
        }
    }, [accessToken, currentFolderId]);

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

    const loadFiles = async () => {
        if (!accessToken) return;

        setLoading(true);
        setError(null);
        try {
            const response = await listDriveFiles(accessToken, {
                folderId: currentFolderId,
                pageSize: 50,
                orderBy: 'modifiedTime desc',
            });
            setFiles(response.files);
        } catch (err) {
            console.error('Error loading files:', err);
            setError('Error al cargar archivos de Drive');
        } finally {
            setLoading(false);
        }
    };

    const handleFolderClick = (folder: DriveFile) => {
        setCurrentFolderId(folder.id);
        setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
        setSearchQuery(''); // Limpiar búsqueda al navegar
    };

    const handleBreadcrumbClick = (index: number) => {
        const newPath = folderPath.slice(0, index + 1);
        setFolderPath(newPath);
        setCurrentFolderId(newPath[newPath.length - 1].id);
        setSearchQuery('');
    };

    const handleCreateFolder = async () => {
        if (!accessToken || !newFolderName.trim()) return;

        try {
            setLoading(true);
            await createFolder(accessToken, newFolderName, currentFolderId);
            setNewFolderName('');
            setShowCreateFolder(false);
            loadFiles(); // Recargar archivos
            alert(`✅ Carpeta "${newFolderName}" creada exitosamente!`);
        } catch (err) {
            console.error('Error creating folder:', err);
            alert('Error al crear carpeta');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!accessToken) return;

        if (!searchQuery.trim()) {
            loadFiles();
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const results = await searchDriveFiles(accessToken, searchQuery);
            setFiles(results);
        } catch (err) {
            console.error('Error searching files:', err);
            setError('Error al buscar archivos');
        } finally {
            setLoading(false);
        }
    };

    const handleAttachFile = async (file: DriveFile) => {
        if (!user || !accessToken) return;

        try {
            setLoading(true);
            const result = await processGoogleDriveFile(file.id, user.uid, accessToken);

            if (result.success && result.data) {
                const processedData = result.data;
                const fileContent = processedData.extractedContent || processedData.visualDescription || '';
                
                // Guardar en Firestore (Chat Context)
                const messagesRef = collection(firestore, 'users', user.uid, 'messages');
                
                // Límite de Firestore: 1MB. Usamos 900KB para estar seguros.
                const CHUNK_SIZE = 900000; 

                if (fileContent.length > CHUNK_SIZE) {
                    // Lógica de Chunking
                    const totalParts = Math.ceil(fileContent.length / CHUNK_SIZE);
                    const groupId = `group-${Date.now()}`;
                    const batch = writeBatch(firestore);

                    for (let i = 0; i < totalParts; i++) {
                        const chunkContent = fileContent.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                        const docRef = doc(collection(firestore, 'users', user.uid, 'messages'));
                        
                        const fileMessageData = {
                            role: 'user',
                            type: 'fileContext',
                            content: chunkContent,
                            fileName: `${file.name} - Parte ${i + 1}/${totalParts}`,
                            isActive: true,
                            createdAt: serverTimestamp(),
                            groupId,
                            partNumber: i + 1,
                            totalParts,
                            // Metadata adicional
                            driveFileId: file.id,
                            mimeType: file.mimeType,
                            fileSize: file.size
                        };
                        batch.set(docRef, fileMessageData);
                    }
                    await batch.commit();
                    alert(`✅ Archivo "${file.name}" procesado y adjuntado en ${totalParts} partes!`);
                } else {
                    // Archivo único
                    await addDoc(messagesRef, {
                        role: 'user',
                        type: 'fileContext',
                        content: fileContent,
                        fileName: file.name,
                        isActive: true,
                        createdAt: serverTimestamp(),
                        // Metadata adicional
                        driveFileId: file.id,
                        mimeType: file.mimeType,
                        fileSize: file.size,
                        summary: processedData.contentSummary
                    });
                    alert(`✅ Archivo "${file.name}" adjuntado al chat exitosamente!`);
                }

            } else {
                alert(`❌ Error: ${result.error || 'No se pudo obtener el contenido del archivo'}`);
            }
        } catch (err) {
            console.error('Error processing file:', err);
            alert('Error al procesar archivo');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFile = async (file: DriveFile) => {
        if (!accessToken) return;

        const confirmDelete = confirm(`¿Eliminar "${file.name}"?\n\nEl archivo se moverá a la papelera.`);
        if (!confirmDelete) return;

        try {
            setLoading(true);
            // Intentar mover a papelera primero
            await deleteFile(accessToken, file.id);
            alert(`✅ "${file.name}" movido a la papelera`);
            loadFiles();
        } catch (err: any) {
            console.error('Error deleting file:', err);

            // Detectar si es un error de permisos
            const isPermissionError = err.message && (
                err.message.includes('insufficient permissions') ||
                err.message.includes('pertenece a otra persona') ||
                err.message.includes('otra aplicación')
            );

            if (isPermissionError) {
                // Mensaje simple para archivos de otras personas
                alert(
                    `❌ Este archivo pertenece a otra persona.\n\n` +
                    `Solo el propietario puede eliminarlo.\n\n` +
                    `Elimínalo desde drive.google.com`
                );
            } else {
                // Si falla por otro motivo (archivo muy grande), ofrecer eliminar permanentemente
                const confirmPermanent = confirm(
                    `⚠️ No se pudo mover a la papelera.\n\n` +
                    `¿Deseas ELIMINAR PERMANENTEMENTE "${file.name}"?\n\n` +
                    `Esta acción NO se puede deshacer.`
                );

                if (confirmPermanent) {
                    try {
                        await permanentlyDeleteFile(accessToken, file.id);
                        alert(`✅ "${file.name}" eliminado permanentemente`);
                        loadFiles();
                    } catch (permErr: any) {
                        console.error('Error permanently deleting file:', permErr);

                        // Detectar si también es error de permisos
                        const isPermErr = permErr.message && (
                            permErr.message.includes('insufficient permissions') ||
                            permErr.message.includes('pertenece a otra persona')
                        );

                        if (isPermErr) {
                            alert(`❌ Este archivo pertenece a otra persona. Solo el propietario puede eliminarlo.`);
                        } else {
                            alert('Error al eliminar archivo permanentemente');
                        }
                    }
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // Drag & Drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFilesUpload(droppedFiles);
    };

    const handleFilesUpload = async (filesToUpload: File[]) => {
        if (!accessToken) return;

        // Validar archivos
        const validFiles: File[] = [];
        for (const file of filesToUpload) {
            const validation = validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                alert(validation.error);
            }
        }

        if (validFiles.length === 0) return;

        // Crear items de upload
        const newUploads: UploadItem[] = validFiles.map(file => ({
            id: `${Date.now()}-${file.name}`,
            file,
            progress: 0,
            status: 'pending',
            speed: 0,
            timeRemaining: 0,
        }));

        setUploads(prev => [...prev, ...newUploads]);

        // Subir archivos uno por uno
        for (const uploadItem of newUploads) {
            try {
                // Actualizar estado a uploading
                setUploads(prev => prev.map(u =>
                    u.id === uploadItem.id ? { ...u, status: 'uploading' } : u
                ));

                await uploadFileToDrive(
                    uploadItem.file,
                    accessToken,
                    currentFolderId,
                    (progress) => {
                        setUploads(prev => prev.map(u =>
                            u.id === uploadItem.id
                                ? {
                                    ...u,
                                    progress: progress.percentage,
                                    speed: progress.speed,
                                    timeRemaining: progress.timeRemaining,
                                }
                                : u
                        ));
                    }
                );

                // Marcar como completado
                setUploads(prev => prev.map(u =>
                    u.id === uploadItem.id ? { ...u, status: 'completed', progress: 100 } : u
                ));
            } catch (err) {
                console.error('Error uploading file:', err);
                setUploads(prev => prev.map(u =>
                    u.id === uploadItem.id
                        ? { ...u, status: 'error', error: 'Error al subir archivo' }
                        : u
                ));
            }
        }

        // Recargar lista de archivos
        loadFiles();
    };

    // Funciones de ordenamiento y filtrado
    const getFileType = (mimeType: string): string => {
        if (mimeType.includes('folder')) return 'folder';
        if (mimeType.includes('image')) return 'image';
        if (mimeType.includes('video')) return 'video';
        if (mimeType.includes('audio')) return 'audio';
        return 'document';
    };

    const filteredAndSortedFiles = () => {
        let result = [...files];

        // Aplicar filtro por tipo
        if (filterType !== 'all') {
            result = result.filter(file => getFileType(file.mimeType) === filterType);
        }

        // Aplicar ordenamiento
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    return new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime();
                case 'size':
                    return (b.size || 0) - (a.size || 0);
                case 'type':
                    return getFileType(a.mimeType).localeCompare(getFileType(b.mimeType));
                default:
                    return 0;
            }
        });

        return result;
    };

    if (!user) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Gestor de Google Drive</CardTitle>
                        <CardDescription>Inicia sesión para acceder a tus archivos</CardDescription>
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
                        <CardTitle>Gestor de Google Drive</CardTitle>
                        <CardDescription>Conecta tu cuenta de Google Drive</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <AlertDescription>
                                {error || 'No estás conectado a Google Drive.'}
                            </AlertDescription>
                        </Alert>
                        <Button className="mt-4" onClick={() => window.location.href = '/perfil'}>
                            Ir a Perfil para Conectar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div
                className={`container mx-auto p-6 max-w-6xl space-y-6 transition-colors ${isDragging ? 'bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-500 ring-inset' : ''
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragging && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-blue-500/10 pointer-events-none">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border-2 border-blue-500 border-dashed">
                            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                            <p className="text-xl font-semibold text-center">Suelta los archivos aquí</p>
                            <p className="text-sm text-muted-foreground text-center mt-2">
                                Se subirán a {folderPath[folderPath.length - 1].name}
                            </p>
                        </div>
                    </div>
                )}
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FolderOpen className="w-6 h-6" />
                                    Gestor de Google Drive
                                </CardTitle>
                                <CardDescription>
                                    Explora y gestiona tus archivos de Google Drive
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/drive-manager/trash'}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Ver papelera
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                                >
                                    {viewMode === 'list' ? <Grid3x3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={loadFiles}
                                    disabled={loading}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Indicador de Almacenamiento */}
                {accessToken && <StorageIndicator accessToken={accessToken} />}

                {/* Búsqueda */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar archivos en Drive..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={loading}>
                                Buscar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Filtros y Ordenamiento */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm font-medium mr-2">Ordenar por:</span>
                            <Button
                                variant={sortBy === 'name' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('name')}
                            >
                                Nombre
                            </Button>
                            <Button
                                variant={sortBy === 'date' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('date')}
                            >
                                Fecha
                            </Button>
                            <Button
                                variant={sortBy === 'size' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('size')}
                            >
                                Tamaño
                            </Button>
                            <Button
                                variant={sortBy === 'type' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy('type')}
                            >
                                Tipo
                            </Button>

                            <div className="w-px h-6 bg-border mx-2" />

                            <span className="text-sm font-medium mr-2">Filtrar:</span>
                            <Button
                                variant={filterType === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('all')}
                            >
                                Todos
                            </Button>
                            <Button
                                variant={filterType === 'folder' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('folder')}
                            >
                                📁 Carpetas
                            </Button>
                            <Button
                                variant={filterType === 'document' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('document')}
                            >
                                📄 Documentos
                            </Button>
                            <Button
                                variant={filterType === 'image' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('image')}
                            >
                                🖼️ Imágenes
                            </Button>
                            <Button
                                variant={filterType === 'video' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('video')}
                            >
                                🎥 Videos
                            </Button>
                            <Button
                                variant={filterType === 'audio' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('audio')}
                            >
                                🎵 Audio
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Breadcrumbs y Crear Carpeta */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            {/* Breadcrumbs */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {folderPath.map((folder, index) => (
                                    <div key={folder.id || 'root'} className="flex items-center gap-2">
                                        {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                        <Button
                                            variant={index === folderPath.length - 1 ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => handleBreadcrumbClick(index)}
                                            className="flex items-center gap-2"
                                        >
                                            {index === 0 && <Home className="w-4 h-4" />}
                                            {folder.name}
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Botón Crear Carpeta */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCreateFolder(!showCreateFolder)}
                            >
                                <FolderPlus className="w-4 h-4 mr-2" />
                                Nueva Carpeta
                            </Button>
                        </div>

                        {/* Input para crear carpeta */}
                        {showCreateFolder && (
                            <div className="flex gap-2 mt-4">
                                <Input
                                    placeholder="Nombre de la carpeta..."
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                />
                                <Button onClick={handleCreateFolder} disabled={!newFolderName.trim() || loading}>
                                    Crear
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    setShowCreateFolder(false);
                                    setNewFolderName('');
                                }}>
                                    Cancelar
                                </Button>
                            </div>
                        )}
                    </CardContent>
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
                        <CardTitle className="text-lg">
                            Archivos Recientes ({files.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) : files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <FolderOpen className="w-16 h-16 mb-4" />
                                <p className="text-lg">No se encontraron archivos</p>
                                <p className="text-sm">Intenta buscar o crear archivos en Google Drive</p>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
                                {filteredAndSortedFiles().map((file) => (
                                    <DriveFileItem
                                        key={file.id}
                                        file={file}
                                        viewMode={viewMode}
                                        onAttach={handleAttachFile}
                                        onFolderClick={file.mimeType === 'application/vnd.google-apps.folder' ? handleFolderClick : undefined}
                                        onDelete={handleDeleteFile}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Ventana de progreso de uploads */}
            <UploadProgress
                uploads={uploads}
                onClose={() => setUploads([])}
            />
        </>
    );
}
