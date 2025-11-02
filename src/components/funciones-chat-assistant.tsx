'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getFuncionesMatricesAiResponse } from '@/app/funciones-matrices-actions';
import { SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Part } from 'genkit';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

interface FuncionesChatAssistantProps {
  ejercicioId: string;
}

const parseResponse = (content: string) => {
    const buttonRegex = /\[button:(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;
  
    while ((match = buttonRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'button', value: match[1] });
      lastIndex = match.index + match[0].length;
    }
  
    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.substring(lastIndex) });
    }
  
    const finalParts = parts.map(part => {
        if (part.type === 'text') {
            const codeRegex = /<code>(.*?)<\/code>/gs;
            const textSubParts: ({type: 'text' | 'code' | 'bold', value: string})[] = [];
            let lastTextIndex = 0;
            let combinedRegex = new RegExp(/<code>(.*?)<\/code>|\*\*(.*?)\*\*/gs);
            let textMatch;

            while((textMatch = combinedRegex.exec(part.value)) !== null) {
                if (textMatch.index > lastTextIndex) {
                    textSubParts.push({type: 'text', value: part.value.substring(lastTextIndex, textMatch.index)});
                }
                if (textMatch[1]) {
                    textSubParts.push({type: 'code', value: textMatch[1]});
                } else if (textMatch[2]) {
                    textSubParts.push({type: 'bold', value: textMatch[2]});
                }
                lastTextIndex = textMatch.index + textMatch[0].length;
            }

            if (lastTextIndex < part.value.length) {
                textSubParts.push({ type: 'text', value: part.value.substring(lastTextIndex) });
            }
            return textSubParts;
        }
        return part;
    }).flat();

    return finalParts;
};

export function FuncionesChatAssistant({ ejercicioId }: FuncionesChatAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 0);
    }
  }, [messages, isPending]);

  useEffect(() => {
    // Enviar consulta inicial al montar el componente
    const initialAssistantMessage: ChatMessage = {
      id: `assistant-intro-${Date.now()}`,
      role: 'model',
      content: '...',
    };
    setMessages([initialAssistantMessage]);

    startTransition(() => {
      const processAndRespond = async () => {
        try {
          const { response: aiResponse } = await getFuncionesMatricesAiResponse({
            ejercicioId: ejercicioId,
            history: [],
          });
          setMessages([{ id: `assistant-intro-final-${Date.now()}`, role: 'model', content: aiResponse }]);
        } catch (error: any) {
          console.error("Error in initial chat:", error);
          setMessages([{ id: 'error-initial', role: 'model', content: "Error al iniciar el asistente." }]);
        }
      };
      processAndRespond();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ejercicioId]);

  const handleButtonClick = (value: string) => {
    if (value === 'Volver al Ejercicio') {
      router.back();
    } else {
      setInput(value);
      const form = document.getElementById("funciones-chat-form") as HTMLFormElement;
      if (form) {
        setTimeout(() => form.requestSubmit(), 0);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const currentInput = input;
    setInput('');

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: currentInput };
    const assistantPlaceholder: ChatMessage = { id: `assistant-${Date.now()}`, role: 'model', content: '...' };

    const newMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(newMessages);

    startTransition(() => {
      const processAndRespond = async () => {
        try {
          const genkitHistory: GenkitMessage[] = messages.map(m => ({
            role: m.role,
            content: [{ text: m.content }],
          }));

          const { response: aiResponse } = await getFuncionesMatricesAiResponse({
            ejercicioId: ejercicioId,
            history: genkitHistory,
            userQuery: currentInput,
          });

          setMessages(prev => prev.slice(0, -1).concat({
            id: `assistant-final-${Date.now()}`,
            role: 'model',
            content: aiResponse
          }));

        } catch (error: any) {
          console.error("Error in chat:", error);
          toast({ variant: "destructive", title: "Error del asistente", description: "No se pudo obtener una respuesta." });
          setMessages(prev => prev.slice(0, -1));
        }
      };
      processAndRespond();
    });
  };

  return (
    <>
      <SheetHeader className="p-4 border-b">
        <SheetTitle className="flex items-center gap-2"><Bot /> Tutor de GeoGebra</SheetTitle>
        <SheetDescription>Sigue los pasos para resolver el ejercicio en la pizarra.</SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={cn('flex items-start gap-3', message.role === 'user' && 'justify-end')}>
              {message.role !== 'user' && (
                <Avatar className="w-8 h-8 border"><AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback></Avatar>
              )}
              <div className={cn('p-3 rounded-lg max-w-[85%] text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                {message.content === '...' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                ) : (
                  <div className="space-y-2 leading-relaxed">
                    {parseResponse(message.content).map((part, index) => {
                      if (part.type === 'button') {
                        return <Button key={index} variant="outline" size="sm" className="h-auto" onClick={() => handleButtonClick(part.value)}>{part.value}</Button>;
                      } else if (part.type === 'code') {
                        return <code key={index} className="bg-foreground/10 text-foreground font-semibold rounded-md px-2 py-1 block whitespace-pre-wrap">{part.value}</code>;
                      } else if (part.type === 'bold') {
                        return <strong key={index}>{part.value}</strong>;
                      }
                      return <span key={index}>{part.value}</span>;
                    })}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8 border"><AvatarFallback><User className="w-5 h-5" /></AvatarFallback></Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <SheetFooter className="p-4 border-t bg-background">
        <form id="funciones-chat-form" onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Responde al tutor..."
            disabled={isPending}
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </SheetFooter>
    </>
  );
}
