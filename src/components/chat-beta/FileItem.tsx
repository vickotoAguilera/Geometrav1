import { Message } from './types';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FileText, Image as ImageIcon, Trash2, HardDrive } from "lucide-react";

interface FileItemProps {
    file: Message;
    onToggle: (id: string, isActive: boolean) => void;
    onDelete: (id: string) => void;
}

export function FileItem({ file, onToggle, onDelete }: FileItemProps) {
    const isImage = file.mimeType?.startsWith('image/');
    const isDrive = file.source === 'google-drive';

    return (
        <div className="flex items-center justify-between p-2 rounded-md border bg-card mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex-shrink-0">
                    {isImage ? (
                        <div className="w-8 h-8 rounded overflow-hidden bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={file.thumbnailBase64 || file.extractedContent || ''}
                                alt={file.fileName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate max-w-[150px]" title={file.fileName}>
                        {file.fileName}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {isDrive && <HardDrive className="h-3 w-3" />}
                        <span>{isDrive ? 'Drive' : 'Local'}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    checked={file.isActive}
                    onCheckedChange={(checked) => onToggle(file.id, checked)}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                    onClick={() => onDelete(file.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
