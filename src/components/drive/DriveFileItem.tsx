'use client';

import { DriveFile } from '@/types/drive';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatFileSize, formatDate, getFileIcon } from '@/lib/drive-utils';
import { Download, ExternalLink, Paperclip, FolderOpen, Trash2 } from 'lucide-react';

interface DriveFileItemProps {
    file: DriveFile;
    viewMode?: 'list' | 'grid';
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (file: DriveFile, selected: boolean) => void;
    onAttach?: (file: DriveFile) => void;
    onFolderClick?: (folder: DriveFile) => void;
    onDelete?: (file: DriveFile) => void;
}

export function DriveFileItem({
    file,
    viewMode = 'list',
    selectable = false,
    selected = false,
    onSelect,
    onAttach,
    onFolderClick,
    onDelete,
}: DriveFileItemProps) {
    const handleCheckboxChange = (checked: boolean) => {
        if (onSelect) {
            onSelect(file, checked);
        }
    };

    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

    if (viewMode === 'grid') {
        return (
            <Card className={`p-4 hover:bg-accent transition-colors ${selected ? 'ring-2 ring-primary' : ''}`}>
                <div className="space-y-3">
                    {selectable && (
                        <div className="flex justify-end">
                            <Checkbox
                                checked={selected}
                                onCheckedChange={handleCheckboxChange}
                            />
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">{getFileIcon(file.mimeType)}</div>
                        <p className="text-sm font-medium text-center line-clamp-2" title={file.name}>
                            {file.name}
                        </p>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>{formatFileSize(file.size)}</p>
                        <p>{formatDate(file.modifiedTime)}</p>
                    </div>

                    <div className="flex gap-2">
                        {isFolder && onFolderClick ? (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => onFolderClick(file)}
                                className="flex-1"
                            >
                                <FolderOpen className="w-3 h-3 mr-1" />
                                Abrir
                            </Button>
                        ) : onAttach && !isFolder ? (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => onAttach(file)}
                                className="flex-1"
                            >
                                <Paperclip className="w-3 h-3 mr-1" />
                                Adjuntar
                            </Button>
                        ) : null}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(file.webViewLink, '_blank')}
                        >
                            <ExternalLink className="w-3 h-3" />
                        </Button>
                        {onDelete && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDelete(file)}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    // Vista de lista
    return (
        <Card className={`p-3 hover:bg-accent transition-colors ${selected ? 'ring-2 ring-primary' : ''}`}>
            <div className="flex items-center gap-3">
                {selectable && (
                    <Checkbox
                        checked={selected}
                        onCheckedChange={handleCheckboxChange}
                    />
                )}

                <div className="text-2xl">{getFileIcon(file.mimeType)}</div>

                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" title={file.name}>
                        {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {formatDate(file.modifiedTime)}
                    </p>
                    {file.owners && file.owners.length > 0 && !file.owners[0].me && (
                        <p className="text-xs text-orange-600 flex items-center gap-1">
                            👤 {file.owners[0].displayName || file.owners[0].emailAddress}
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    {isFolder && onFolderClick ? (
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => onFolderClick(file)}
                        >
                            <FolderOpen className="w-4 h-4 mr-1" />
                            Abrir
                        </Button>
                    ) : onAttach && !isFolder ? (
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => onAttach(file)}
                        >
                            <Paperclip className="w-4 h-4 mr-1" />
                            Adjuntar
                        </Button>
                    ) : null}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.webViewLink, '_blank')}
                    >
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                    {onDelete && (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(file)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
