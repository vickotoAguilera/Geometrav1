'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getStudyAiResponse } from '@/app/study-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Part } from 'genkit';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import type { Ejercicio } from '@/lib/ejercicios';
import { Switch } from './ui/switch';


interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

interface StudyChatAssistantProps {
    ejercicios: Ejercicio[];
}

const parseResponse = (content: string) => {
    const buttonRegex = /\[button:(.*?)\]/g;
    let parts = [];
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

export function StudyChatAssistant({ ejercicios }: StudyChatAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [activeEjercicio, setActiveEjercicio] = useState<Ejercicio | null>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const sendQuery = (query: string, history: ChatMessage[], material: string) => {
    startTransition(() => {
      const processAndRespond = async () => {
        try {
          const genkitHistory: GenkitMessage[] = history.map(m => ({
            role: m.role,
            content: [{ text: m.content }],
          }));
          
          const { response: aiResponse } = await getStudyAiResponse(query, genkitHistory, material);
          
          setMessages(prev => prev.slice(0, -1).concat({
            id: `assistant-${Date.now()}-final`,
            role: 'model',
            content: aiResponse,
          }));

        } catch (error: any) {
          console.error("Error in study chat:", error);
          toast({
            variant: "destructive",
            title: "Error del asistente",
            description: "No se pudo obtener una respuesta. Por favor, inténtalo de nuevo.",
          });
          setMessages(prev => prev.slice(0, -1));
        }
      };
      void processAndRespond();
    });
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    const form = document.getElementById("study-chat-form") as HTMLFormElement;
    if (form) {
      setTimeout(() => form.requestSubmit(), 0);
    }
  };

  const handleToggleEjercicio = (ejercicio: Ejercicio) => {
    const isActivating = activeEjercicio?.slug !== ejercicio.slug;
    setActiveEjercicio(isActivating ? ejercicio : null);
    setMessages([]); // Clear chat on any toggle
    setInput('');

    if (isActivating) {
      const autoPrompt = `Hola, he activado el archivo '${ejercicio.title}'. ¿De qué trata y qué puedo aprender de él?`;
      const assistantPlaceholder: ChatMessage = {
        id: `assistant-intro-${Date.now()}`,
        role: 'model',
        content: '...',
      };
      setMessages([assistantPlaceholder]);
      sendQuery(autoPrompt, [], ejercicio.content);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending || !activeEjercicio) return;

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

    const newMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(newMessages);
    sendQuery(currentInput, [...messages, userMessage], activeEjercicio.content);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Ambiente de Aprendizaje</CardTitle>
                    <CardDescription>
                        Activa un ejercicio para que la IA lo use como contexto.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {ejercicios.length > 0 ? (
                        ejercicios.map(ejercicio => (
                            <div key={ejercicio.slug} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate" title={ejercicio.title}>{ejercicio.title}</span>
                                </div>
                                <Switch
                                checked={activeEjercicio?.slug === ejercicio.slug}
                                onCheckedChange={() => handleToggleEjercicio(ejercicio)}
                                aria-label={`Activar contexto para ${ejercicio.title}`}
                                />
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-sm">No hay ejercicios disponibles.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        <Card className="lg:col-span-2 flex flex-col h-[600px]">
            <CardHeader>
                <CardTitle>Asistente de Estudio</CardTitle>
                <CardDescription>Esta conversación es temporal y se reinicia al recargar la página.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full" viewportRef={viewportRef}>
                    <div className="p-4 space-y-4">
                    {messages.length === 0 ? (
                         <div className="text-sm p-3 rounded-lg bg-secondary text-secondary-foreground">
                            {activeEjercicio 
                                ? `Haz una pregunta sobre '${activeEjercicio.title}'.`
                                : "Activa un ejercicio para comenzar a chatear."
                            }
                         </div>
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
                                <AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback>
                            </Avatar>
                            )}
                            <div
                            className={cn(
                                'p-3 rounded-lg max-w-[85%] text-sm',
                                message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            )}
                            >
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
                                            return <code key={index} className="bg-foreground/10 text-foreground font-semibold rounded-md px-2 py-1 block whitespace-pre-wrap">{part.value}</code>
                                        } else if (part.type === 'bold') {
                                            return <strong key={index}>{part.value}</strong>
                                        }
                                        return <span key={index}>{part.value}</span>;
                                    })}
                                </div>
                            )}
                            </div>
                            {message.role === 'user' && (
                             <Avatar className="w-8 h-8 border">
                                <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                            </Avatar>
                            )}
                        </div>
                        ))
                    )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <form
                    id="study-chat-form"
                    onSubmit={handleSubmit}
                    className="flex w-full items-center space-x-2"
                >
                    <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Haz una pregunta sobre el ejercicio..."
                    disabled={isPending || !activeEjercicio}
                    />
                    <Button type="submit" size="icon" disabled={isPending || !input.trim() || !activeEjercicio}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    </div>
  );
}
