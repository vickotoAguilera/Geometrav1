'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getAiResponse } from '@/app/actions';
import { SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Part } from 'genkit';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Define el tipo para los mensajes de la conversación local
interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

// Define el tipo para los mensajes que se envían a la API de Genkit
interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
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
          const textSubParts: ({type: 'text' | 'code' | 'bold', value: string})[] = [];
          let lastTextIndex = 0;
          let combinedRegex = new RegExp(/<code>(.*?)<\/code>|\*\*(.*?)\*\*/gs);
          let textMatch;

          while((textMatch = combinedRegex.exec(part.value)) !== null) {
              if (textMatch.index > lastTextIndex) {
                  textSubParts.push({type: 'text', value: part.value.substring(lastTextIndex, textMatch.index)});
              }
              if (textMatch[1]) { // <code> match
                  textSubParts.push({type: 'code', value: textMatch[1]});
              } else if (textMatch[2]) { // **bold** match
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


const WelcomeMessage = ({ onHelpClick }: { onHelpClick: () => void }) => {
  return (
    <div className="text-sm p-3 rounded-lg bg-secondary text-secondary-foreground w-full space-y-3">
      <p className="font-medium">
        ¡Hola! Soy tu tutor de IA.
      </p>
      <p>
        Puedes hacerme cualquier pregunta de matemáticas. Este chat es temporal y no se guardará.
      </p>
    </div>
  );
};


export function ChatAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 0);
    }
  }, [messages, isPending]);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    const form = document.getElementById('local-chat-form') as HTMLFormElement;
    if (form) {
      setTimeout(() => {
        form.requestSubmit();
      }, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const currentInput = input;
    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentInput,
    };

    const assistantPlaceholder: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'model',
      content: '...',
    };

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);

    startTransition(() => {
      const processAndRespond = async () => {
        try {
          const history: GenkitMessage[] = messages.map(m => ({
            role: m.role,
            content: [{ text: m.content }],
          }));
          
          const { response: aiResponse } = await getAiResponse(currentInput, history, 'math');
          
          setMessages(prev => prev.slice(0, -1).concat({
            id: `assistant-${Date.now()}-final`,
            role: 'model',
            content: aiResponse,
          }));

        } catch (error: any) {
          console.error("Error in local chat:", error);
          const errorMessage = `Lo siento, ocurrió un error: ${error.message}`;
          setMessages(prev => prev.slice(0, -1).concat({
            id: `assistant-error-${Date.now()}`,
            role: 'model',
            content: errorMessage,
          }));
          toast({
            variant: "destructive",
            title: "Error del asistente",
            description: "No se pudo obtener una respuesta. Por favor, inténtalo de nuevo.",
          });
        }
      };
      void processAndRespond();
    });
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="p-4 border-b">
        <div className="flex justify-between items-center">
            <SheetTitle className="font-headline flex items-center gap-2">
                <Bot /> Asistente de Mates (Local)
            </SheetTitle>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Reiniciar chat">
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Reiniciar conversación?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción borrará la conversación actual. El historial no se guarda, por lo que se perderá.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetChat}>Reiniciar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 space-y-6">
          {messages.length === 0 ? (
            <WelcomeMessage onHelpClick={() => {}} />
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' && 'justify-end'
                )}
              >
                {message.role !== 'user' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback>
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                  <div
                    className={cn(
                      'p-3 rounded-lg max-w-[80%] text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <div className="whitespace-pre-wrap">
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
                                return (
                                    <Button key={index} variant="outline" size="sm" className="h-auto" onClick={() => handlePromptClick(part.value)}>
                                    {part.value}
                                    </Button>
                                );
                                } else if (part.type === 'code') {
                                    return (
                                        <code key={index} className="bg-foreground/10 text-foreground font-semibold rounded-md px-2 py-1 block whitespace-pre-wrap">
                                            {part.value}
                                        </code>
                                    )
                                } else if (part.type === 'bold') {
                                    return <strong key={index}>{part.value}</strong>
                                }
                                return <span key={index}>{part.value}</span>;
                            })}
                        </div>
                    )}
                    </div>
                  </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <SheetFooter className="p-4 border-t bg-background">
          <div className="w-full space-y-3">
            <form
              id="local-chat-form"
              onSubmit={handleSubmit}
              className="flex w-full items-center space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                disabled={isPending}
              />
              <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </div>
      </SheetFooter>
    </div>
  );
}