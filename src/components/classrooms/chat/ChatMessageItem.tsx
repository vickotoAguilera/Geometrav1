// Componente individual de mensaje del chat

'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat-types';
import { deleteChatMessage, pinChatMessage } from '@/lib/chat-utils';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageItemProps {
    message: ChatMessage;
    currentUserId: string;
    currentUserRole: 'teacher' | 'student';
    classroomId: string;
}

export function ChatMessageItem({
    message,
    currentUserId,
    currentUserRole,
    classroomId,
}: ChatMessageItemProps) {
    const { toast } = useToast();
    const isOwnMessage = message.userId === currentUserId;
    const canDelete = isOwnMessage || currentUserRole === 'teacher';
    const canPin = currentUserRole === 'teacher';

    const timeAgo = message.timestamp
        ? formatDistanceToNow(message.timestamp.toDate(), {
            addSuffix: true,
            locale: es,
        })
        : '';

    const handleDelete = async () => {
        const confirmed = confirm('¿Estás seguro de eliminar este mensaje?');
        if (!confirmed) return;

        const result = await deleteChatMessage(classroomId, message.id, currentUserId);

        if (result.success) {
            toast({
                title: 'Mensaje eliminado',
            });
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
        }
    };

    const handlePin = async () => {
        const result = await pinChatMessage(classroomId, message.id, currentUserId);

        if (result.success) {
            toast({
                title: 'Mensaje fijado',
            });
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
        }
    };

    if (message.isDeleted) {
        return (
            <div className="flex gap-3 opacity-50">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="text-sm italic text-muted-foreground">
                        [Mensaje eliminado]
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex gap-3 group',
                message.isPinned && 'bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg'
            )}
        >
            <Avatar className="h-8 w-8">
                <AvatarImage src={message.userPhotoURL} />
                <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{message.userName}</span>
                    <Badge
                        variant={message.userRole === 'teacher' ? 'default' : 'secondary'}
                        className="text-xs"
                    >
                        {message.userRole === 'teacher' ? 'Profesor' : 'Alumno'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    {message.isPinned && (
                        <Badge variant="outline" className="text-xs">
                            <Pin className="h-3 w-3 mr-1" />
                            Fijado
                        </Badge>
                    )}
                </div>

                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Acciones (visible al hover) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canPin && !message.isPinned && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePin}
                            className="h-6 text-xs"
                        >
                            <Pin className="h-3 w-3 mr-1" />
                            Fijar
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            className="h-6 text-xs text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
