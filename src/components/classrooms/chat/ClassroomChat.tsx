// Componente de chat del aula

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatMessages } from '@/firebase/hooks/useChatMessages';
import { ChatInput } from './ChatInput';
import { ChatMessageItem } from './ChatMessageItem';
import { Loader2 } from 'lucide-react';

interface ClassroomChatProps {
    classroomId: string;
    userId: string;
    userName: string;
    userRole: 'teacher' | 'student';
    userPhotoURL?: string;
}

export function ClassroomChat({
    classroomId,
    userId,
    userName,
    userRole,
    userPhotoURL,
}: ClassroomChatProps) {
    const { messages, isLoading } = useChatMessages(classroomId);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    // Auto-scroll al último mensaje
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, autoScroll]);

    return (
        <Card className="flex flex-col h-[600px]">
            {/* Header del chat */}
            <div className="p-4 border-b">
                <h3 className="font-semibold">Chat del Aula</h3>
                <p className="text-sm text-muted-foreground">
                    {messages.length} mensajes
                </p>
            </div>

            {/* Mensajes */}
            <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No hay mensajes aún. ¡Sé el primero en escribir!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <ChatMessageItem
                                key={message.id}
                                message={message}
                                currentUserId={userId}
                                currentUserRole={userRole}
                                classroomId={classroomId}
                            />
                        ))}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Input de mensaje */}
            <div className="p-4 border-t">
                <ChatInput
                    classroomId={classroomId}
                    userId={userId}
                    userName={userName}
                    userRole={userRole}
                    userPhotoURL={userPhotoURL}
                />
            </div>
        </Card>
    );
}
