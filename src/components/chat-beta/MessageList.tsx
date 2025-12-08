import { Message } from './types';
import { Paperclip, Loader2 } from 'lucide-react';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    fileMessages: Message[];
}

export function MessageList({ messages, isLoading, fileMessages }: MessageListProps) {
    // Get active files at the time of each message
    const getActiveFilesAtMessage = (msgIndex: number) => {
        // For user messages, check which files were active
        const msg = messages[msgIndex];
        if (msg.role === 'user') {
            // Get files that were created before this message
            const activeFiles = fileMessages.filter(f =>
                f.isActive && f.createdAt && msg.createdAt &&
                f.createdAt.seconds <= msg.createdAt.seconds
            );
            return activeFiles;
        }
        return [];
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isLoading && (
                <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
                    No hay mensajes aún. ¡Empieza una conversación!
                </div>
            )}

            {messages.map((msg, index) => {
                const activeFiles = getActiveFilesAtMessage(index);
                const hasFiles = activeFiles.length > 0;

                return (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                            }`}>

                            {/* Show screenshot if present (only for user messages) */}
                            {msg.role === 'user' && msg.screenshot && (
                                <div className="mb-2">
                                    <img
                                        src={msg.screenshot}
                                        alt="Captura de pantalla"
                                        className="rounded-md object-cover max-h-40 w-full"
                                    />
                                </div>
                            )}

                            {/* Show file attachments indicator */}
                            {hasFiles && msg.role === 'user' && (
                                <div className="flex items-center gap-1 text-xs opacity-70 mb-2 pb-2 border-b border-primary-foreground/20">
                                    <Paperclip className="h-3 w-3" />
                                    <span>{activeFiles.length} archivo{activeFiles.length > 1 ? 's' : ''} adjunto{activeFiles.length > 1 ? 's' : ''}</span>
                                </div>
                            )}

                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                );
            })}

            {isLoading && (
                <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Pensando...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
