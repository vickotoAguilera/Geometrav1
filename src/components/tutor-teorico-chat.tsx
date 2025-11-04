'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2, RefreshCw, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Part } from 'genkit';
import { useToast } from '@/hooks/use-toast';
import { teoriaCalculadoraAssistant } from '@/ai/flows/teoria-calculadora-assistant';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

interface TutorTeoricoChatProps {
  initialContext: string;
  groupId: string;
  contextFileName: string;
}

const parseResponse = (content: string) => {
    const codeRegex = /<code>(.*?)<\/code>/gs;
    const textSubParts: ({type: 'text' | 'code' | 'bold', value: string})[] = [];
    let lastTextIndex = 0;
    let combinedRegex = new RegExp(/<code>(.*?)<\/code>|\*\*(.*?)\*\*/gs);
    let textMatch;

    while((textMatch = combinedRegex.exec(content)) !== null) {
        if (textMatch.index > lastTextIndex) {
            textSubParts.push({type: 'text', value: content.substring(lastTextIndex, textMatch.index)});
        }
        if (textMatch[1]) {
            textSubParts.push({type: 'code', value: textMatch[1]});
        } else if (textMatch[2]) {
            textSubParts.push({type: 'bold', value: textMatch[2]});
        }
        lastTextIndex = textMatch.index + textMatch[0].length;
    }

    if (lastTextIndex < content.length) {
        textSubParts.push({ type: 'text', value: content.substring(lastTextIndex) });
    }
    return textSubParts;
};


export function TutorTeoricoChat({ initialContext, groupId, contextFileName }: TutorTeoricoChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const chatStorageKey = `chat-teorico-${groupId}`;
  
  const [isReady, setIsReady] = useState(false);

  const loadAndInitialize = (isReset: boolean = false) => {
    setIsReady(false);
    const savedMessagesRaw = localStorage.getItem(chatStorageKey);
    let currentHistory: ChatMessage[] = savedMessagesRaw && !isReset ? JSON.parse(savedMessagesRaw) : [];
    
    if (currentHistory.length === 0) {
      
      const autoPrompt = `He activado la guía de ejercicios. Explícame el primer paso para resolverlo con lápiz y papel.`;

      const userMessage: ChatMessage = { id: `user-context-${Date.now()}`, role: 'user', content: autoPrompt };
      const assistantPlaceholder: ChatMessage = { id: `assistant-context-${Date.now()}`, role: 'model', content: '...' };
      
      const updatedHistory = [userMessage];
      setMessages([...updatedHistory, assistantPlaceholder]);
      
      startTransition(() => {
        teoriaCalculadoraAssistant({
          history: updatedHistory.map(m => ({ role: m.role, content: [{ text: m.content }] })),
          contextoEjercicio: initialContext
        })
        .then(({ response }) => {
          const finalMessage: ChatMessage = { ...assistantPlaceholder, id: `assistant-final-${Date.now()}`, content: response };
          setMessages(prev => [...prev.slice(0, -1), finalMessage]);
        })
        .catch(error => {
          console.error("Error al iniciar chat teórico:", error);
          toast({ variant: "destructive", title: "Error del tutor", description: "No se pudo obtener una respuesta." });
          setMessages([]);
        })
        .finally(() => setIsReady(true));
      });
    } else {
        setMessages(currentHistory);
        setIsReady(true);
    }
  };

  useEffect(() => {
    loadAndInitialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContext, groupId]);

  useEffect(() => {
    if (isReady && messages.length > 0) {
      try {
        localStorage.setItem(chatStorageKey, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save to localStorage", error);
      }
    } else if (isReady && messages.length === 0) {
        localStorage.removeItem(chatStorageKey);
    }
  }, [messages, chatStorageKey, isReady]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 0);
    }
  }, [messages, isPending]);
  
  const handleResetConversation = () => {
    localStorage.removeItem(chatStorageKey);
    setMessages([]);
    loadAndInitialize(true); // Llama a la función de inicialización con 'reset' en true
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const currentInput = input;
    setInput('');
    
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: currentInput };
    const assistantPlaceholder: ChatMessage = { id: `assistant-${Date.now()}`, role: 'model', content: '...' };

    const newHistory = [...messages, userMessage];
    setMessages([...newHistory, assistantPlaceholder]);
    
    startTransition(async () => {
        try {
            const genkitHistory: GenkitMessage[] = newHistory.map(m => ({
              role: m.role,
              content: [{ text: m.content }],
            }));
            
            const { response: aiResponse } = await teoriaCalculadoraAssistant({
              history: genkitHistory,
              contextoEjercicio: initialContext,
            });

            setMessages(prev => prev.slice(0, -1).concat({
              id: `assistant-final-${Date.now()}`,
              role: 'model',
              content: aiResponse,
            }));

        } catch (error: any) {
            console.error("Error en chat teórico:", error);
            toast({ variant: "destructive", title: "Error del tutor", description: "No se pudo obtener una respuesta." });
            setMessages(prev => prev.slice(0, -1));
        }
    });
  };

  return (
    <div className="flex flex-col h-full bg-secondary/30 rounded-b-lg">
      <div className="flex justify-between items-center p-2 border-b bg-background rounded-t-lg">
        <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold ml-2">Tutor Teórico</h4>
            <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                <FileText className="w-3 h-3 mr-1.5"/>
                <span>Contexto: {contextFileName}</span>
            </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleResetConversation} title="Reiniciar conversación">
            <RefreshCw className="w-4 h-4"/>
        </Button>
      </div>

      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={cn('flex items-start gap-3', message.role === 'user' && 'justify-end')}>
              {message.role !== 'user' && (
                <Avatar className="w-8 h-8 border"><AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback></Avatar>
              )}
              <div className={cn('p-3 rounded-lg max-w-[85%] text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground border')}>
                {message.content === '...' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                ) : (
                  <div className="space-y-2 leading-relaxed">
                    {parseResponse(message.content).map((part, index) => {
                      if (part.type === 'code') {
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

      <div className="p-4 border-t bg-background rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntale al tutor teórico..."
            disabled={isPending || !isReady}
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim() || !isReady}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
