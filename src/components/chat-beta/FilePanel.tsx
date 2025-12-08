import { Message } from './types';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FileText, X, Info, Files } from "lucide-react";
import { useMemo } from 'react';

interface FilePanelProps {
    files: Message[];
    onToggle: (id: string, isActive: boolean) => void;
    onDelete: (id: string) => void;
}

interface GroupedFile {
    id: string;
    fileName: string;
    isActive: boolean;
    groupId: string;
    totalParts: number;
    messages: Message[];
}

export function FilePanel({ files, onToggle, onDelete }: FilePanelProps) {
    // Group files by groupId
    const groupedFiles: GroupedFile[] = useMemo(() => {
        const groups: { [key: string]: GroupedFile } = {};

        files.forEach(msg => {
            if (msg.groupId) {
                // File is part of a group (chunked file)
                if (!groups[msg.groupId]) {
                    groups[msg.groupId] = {
                        id: msg.groupId,
                        fileName: msg.fileName?.replace(/ - Parte \d+\/\d+$/, '') || 'unknown',
                        isActive: msg.isActive || false,
                        groupId: msg.groupId,
                        totalParts: msg.totalParts || 1,
                        messages: []
                    };
                }
                groups[msg.groupId].messages.push(msg);
                if (msg.isActive) {
                    groups[msg.groupId].isActive = true;
                }
            } else {
                // Individual file (not chunked)
                const individualGroupId = `individual-${msg.id}`;
                groups[individualGroupId] = {
                    id: msg.id,
                    fileName: msg.fileName || 'unknown',
                    isActive: msg.isActive || false,
                    groupId: individualGroupId,
                    totalParts: 1,
                    messages: [msg]
                };
            }
        });

        return Object.values(groups);
    }, [files]);

    if (groupedFiles.length === 0) return null;

    const handleToggleGroup = async (group: GroupedFile, checked: boolean) => {
        // Toggle all parts of the group
        for (const msg of group.messages) {
            await onToggle(msg.id, checked);
        }
    };

    const handleDeleteGroup = async (group: GroupedFile) => {
        // Delete all parts of the group
        for (const msg of group.messages) {
            await onDelete(msg.id);
        }
    };

    return (
        <div className="p-3 border-b bg-background">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                Contexto de Archivos
            </h3>
            <div className="space-y-2">
                {groupedFiles.map(group => (
                    <div key={group.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {group.totalParts > 1 ? (
                                <Files className="w-4 h-4 flex-shrink-0" />
                            ) : (
                                <FileText className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="truncate" title={group.fileName}>
                                {group.fileName}
                                {group.totalParts > 1 && ` (${group.totalParts} partes)`}
                                {group.messages[0]?.source === 'google-drive' && ' (Drive)'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={group.isActive}
                                onCheckedChange={(checked) => handleToggleGroup(group, checked)}
                                aria-label={`Activar contexto para ${group.fileName}`}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleDeleteGroup(group)}
                                title="Quitar archivo"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
