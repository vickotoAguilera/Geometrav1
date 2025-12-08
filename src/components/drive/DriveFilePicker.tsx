'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DriveFile } from '@/types/drive';
import { DriveFileItem } from './DriveFileItem';
import { listDriveFiles, searchDriveFiles } from '@/lib/drive-utils';
import { Loader2, Search, FolderOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DriveFilePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectFiles: (files: DriveFile[]) => void;
    multiSelect?: boolean;
    accessToken: string;
}

export function DriveFilePicker({
    isOpen,
    onClose,
    onSelectFiles,
    multiSelect = true,
    accessToken,
}: DriveFilePickerProps) {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Cargar archivos al abrir el modal
    useEffect(() => {
        if (isOpen && accessToken) {
            loadFiles();
        }
    }, [isOpen, accessToken]);

    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await listDriveFiles(accessToken, {
                pageSize: 20,
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

    const handleSearch = async () => {
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

    const handleFileSelect = (file: DriveFile, selected: boolean) => {
        if (multiSelect) {
            setSelectedFiles(prev =>
                selected
                    ? [...prev, file]
                    : prev.filter(f => f.id !== file.id)
            );
        } else {
            setSelectedFiles(selected ? [file] : []);
        }
    };

    const handleAttach = () => {
        onSelectFiles(selectedFiles);
        setSelectedFiles([]);
        onClose();
    };

    const handleAttachSingle = (file: DriveFile) => {
        onSelectFiles([file]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        Seleccionar archivos de Google Drive
                    </DialogTitle>
                    <DialogDescription>
                        {multiSelect
                            ? 'Selecciona uno o más archivos para adjuntar'
                            : 'Selecciona un archivo para adjuntar'}
                    </DialogDescription>
                </DialogHeader>

                {/* Búsqueda */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar archivos..."
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

                {/* Error */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Lista de archivos */}
                <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <FolderOpen className="w-12 h-12 mb-2" />
                            <p>No se encontraron archivos</p>
                        </div>
                    ) : (
                        files.map((file) => (
                            <DriveFileItem
                                key={file.id}
                                file={file}
                                viewMode="list"
                                selectable={multiSelect}
                                selected={selectedFiles.some(f => f.id === file.id)}
                                onSelect={handleFileSelect}
                                onAttach={multiSelect ? undefined : handleAttachSingle}
                            />
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                        {selectedFiles.length > 0 && (
                            <span>{selectedFiles.length} archivo(s) seleccionado(s)</span>
                        )}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        {multiSelect && (
                            <Button
                                onClick={handleAttach}
                                disabled={selectedFiles.length === 0}
                            >
                                Adjuntar {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
