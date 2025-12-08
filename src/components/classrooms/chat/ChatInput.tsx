// Componente de input para el chat

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { sendChatMessage } from '@/lib/chat-utils';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
    classroomId: string;
    userId: string;
    userName: string;
    userRole: 'teacher' | 'student';
    userPhotoURL?: string;
}

export function ChatInput({
    classroomId,
    userId,
    userName,
    userRole,
    userPhotoURL,
}: ChatInputProps) {
    const { toast } = useToast();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;

        setIsSending(true);
        try {
            const result = await sendChatMessage(
                classroomId,
                userId,
                userName,
                userRole,
                message.trim(),
                userPhotoURL
            );

            if (result.success) {
                setMessage('');
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo enviar el mensaje',
                variant: 'destructive',
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex gap-2">
            <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="min-h-[60px] resize-none"
                disabled={isSending}
            />
            <Button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                size="icon"
                className="h-[60px] w-[60px]"
            >
                <Send className="h-5 w-5" />
            </Button>
        </div>
    );
}
