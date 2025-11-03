'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Part } from 'genkit';
import { useToast } from '@/hooks/use-toast';
import { teoriaCalculadoraAssistant } from '@/ai/flows/teoria-calculadora-assistant';
import { getGuiaEjercicio } from '@/app/funciones-matrices-actions';

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
  activeContextFiles: string[];
  groupId: string;
}

const parseResponse = (content: string) => {
    const textSubParts: ({type: 'text' | 'code' | 'bold', value: string})[] = [];
    let lastTextIndex = 0;
    let combinedRegex = new RegExp(/<code>(.*?)<\/code>|\*\*(.*?)\*\*/gs);
    let textMatch;

    while((textMatch = combinedRegex.exec(content)) !== null) {
        if (textMatch.index > lastTextIndex) {
            textSubParts.push({type: 'text', value: content.substring(lastTextIndex, textMatch.index)});
        }
        if (textMatch[1]) { // <code> match
            textSubParts.push({type: 'code', value: textMatch[1]});
        } else if (textMatch[2]) { // **bold** match
            textSubParts.push({type: 'bold', value: textMatch[2]});
        }
        lastTextIndex = textMatch.index + textMatch[0].length;
    }

    if (lastTextIndex < content.length) {
        textSubParts.push({ type: 'text', value: content.substring(lastTextIndex) });
    }
    return textSubParts;
};


export function TutorTeoricoChat({ activeContextFiles, groupId }: TutorTeoricoChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const chatStorageKey = `chat-teorico-${groupId}`;
  
  const [isReady, setIsReady] = useState(false);
  const initializedExercisesRef = useRef<Set<string>>(new Set());

  // Load history from localStorage on component mount
   useEffect(() => {
    const savedMessagesRaw = localStorage.getItem(chatStorageKey);
    if (savedMessagesRaw) {
      const savedMessages = JSON.parse(savedMessagesRaw);
      setMessages(savedMessages);
      // Populate already initialized exercises to avoid re-triggering intro prompts
      const initialized = new Set<string>();
      savedMessages.forEach((msg: any) => {
        // This logic assumes we add a contextFile property to messages
        // For now, we will re-initialize on every mount, which is inefficient but safe.
        // A better approach would be to store which files are in context.
      });
      initializedExercisesRef.current = initialized;
    }
    setIsReady(true);
  }, [chatStorageKey]);
  
  // React to new context files being activated
  useEffect(() => {
    if (!isReady) return;

    const newContextFiles = activeContextFiles.filter(file => !initializedExercisesRef.current.has(file));
    
    if (newContextFiles.length > 0) {
      
      const fileToInitialize = newContextFiles[0]; // Process one by one
      initializedExercisesRef.current.add(fileToInitialize);
      
      const autoPrompt = messages.length === 0
        ? `He activado la guía '${fileToInitialize}'. Por favor, dame la primera instrucción para resolverlo con lápiz y papel.`
        : `Ahora también he activado la guía '${fileToInitialize}'. ¿Cómo se relaciona con lo que ya hemos discutido?`;
        
      const userMessage: ChatMessage = { id: `user-context-${Date.now()}`, role: 'user', content: autoPrompt };
      const assistantPlaceholder: ChatMessage = { id: `assistant-context-${Date.now()}`, role: 'model', content: '...' };

      const currentHistory = [...messages, userMessage];
      setMessages([...currentHistory, assistantPlaceholder]);
      
      startTransition(async () => {
        try {
          const result = await getGuiaEjercicio(fileToInitialize);
          if ('error' in result) {
              throw new Error(result.error);
          }
          
          const newFileContent = `--- INICIO GUÍA: ${fileToInitialize}.md ---\n${result.content}\n--- FIN GUÍA: ${fileToInitialize}.md ---\n\n`;

          const genkitHistory: GenkitMessage[] = currentHistory.map(m => ({
            role: m.role,
            content: [{ text: m.content }],
          }));
          
          const { response } = await teoriaCalculadoraAssistant({
            history: genkitHistory,
            contextoEjercicio: newFileContent
          });

          setMessages(prev => [...prev.slice(0, -1), { ...assistantPlaceholder, id: `assistant-final-${Date.now()}`, content: response }]);
        } catch (error) {
          console.error("Error al iniciar/continuar chat teórico:", error);
          toast({ variant: "destructive", title: "Error del tutor", description: "No se pudo obtener una respuesta." });
          setMessages(messages); // Revert on error
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeContextFiles, isReady]);

  // Save conversation to localStorage
  useEffect(() => {
    if (isReady) {
      localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    }
  }, [messages, chatStorageKey, isReady]);

  // Auto-scroll to bottom
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
    initializedExercisesRef.current.clear();
    setMessages([]);
    toast({ title: 'Conversación reiniciada', description: 'El historial de este chat ha sido borrado.' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending || activeContextFiles.length === 0) return;

    const currentInput = input;
    setInput('');
    
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: currentInput };
    const assistantPlaceholder: ChatMessage = { id: `assistant-${Date.now()}`, role: 'model', content: '...' };

    const newHistory = [...messages, userMessage];
    setMessages([...newHistory, assistantPlaceholder]);
    
    startTransition(async () => {
        try {
            // We only send the new user message, assuming the AI maintains context via history.
            // The system prompt of the AI is designed to be cumulative.
            const genkitHistory: GenkitMessage[] = newHistory.map(m => ({
              role: m.role,
              content: [{ text: m.content }],
            }));
            
            const { response: aiResponse } = await teoriaCalculadoraAssistant({
              history: genkitHistory,
              contextoEjercicio: "El contexto ya fue proporcionado. Céntrate en la última pregunta del usuario y el historial."
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
        <h4 className="text-sm font-semibold ml-2">Tutor Teórico</h4>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleResetConversation} title="Reiniciar conversación">
            <RefreshCw className="w-4 h-4"/>
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-[200px]" viewportRef={viewportRef}>
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
            placeholder={activeContextFiles.length > 0 ? "Pregúntale al tutor..." : "Activa una actividad para empezar"}
            disabled={isPending || !isReady || activeContextFiles.length === 0}
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim() || !isReady || activeContextFiles.length === 0}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
