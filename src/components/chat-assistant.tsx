'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import {
  getAiResponse,
  getInitialPrompts,
} from '@/app/actions';
import {
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Paperclip } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, Timestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Part } from 'genkit';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string; 
  createdAt?: Timestamp;
}

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

const WelcomeMessage = ({ onPromptClick }: { onPromptClick: (prompt: string) => void }) => {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const { examplePrompts } = await getInitialPrompts();
        setPrompts(examplePrompts);
      } catch (error) {
        // En caso de error, no mostramos nada.
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrompts();
  }, []);

  return (
    <div className="text-sm p-3 rounded-lg bg-secondary text-secondary-foreground w-full space-y-2">
      <p className="font-medium">
        ¡Hola! Soy tu asistente de Geometra. ¿En qué puedo ayudarte hoy?
      </p>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {prompts.slice(0, 4).map((prompt, i) => (
            <Button
              key={i}
              size="sm"
              variant="outline"
              onClick={() => onPromptClick(prompt)}
              className="text-xs h-auto py-1 px-2"
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};


export function ChatAssistant() {
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const messagesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'messages');
  }, [user, firestore]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesRef) return null;
    return query(messagesRef, orderBy('createdAt', 'asc'));
  }, [messagesRef]);

  const { data: messagesData, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);

  const messages: Message[] = messagesData || [];
  
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  useEffect(() => {
    setOptimisticMessages([]);
  }, [messagesData]);
  
  const allMessages = [...messages, ...optimisticMessages];

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [allMessages, isPending]);


  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!messagesRef || !user) return;
    const messageData = {
      userId: user.uid,
      role,
      content,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(messagesRef, messageData);
    } catch (err) {
      console.error("Failed to save message", err);
      toast({
        variant: "destructive",
        title: "Error al guardar mensaje",
        description: "No se pudo guardar tu mensaje. Por favor, inténtalo de nuevo.",
      });
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Reset file input to allow re-uploading the same file
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    startTransition(() => {
      const processAndRespond = async () => {
        const userMessageContent = `Analiza el archivo: ${file.name}`;
        
        const optimisticUserMessage: Message = {
          id: `optimistic-user-${Date.now()}`,
          role: 'user',
          content: userMessageContent,
          createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0),
        };
        const optimisticAssistantMessage: Message = {
          id: `optimistic-assistant-${Date.now()}`,
          role: 'assistant',
          content: '...',
          createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0),
        };
        setOptimisticMessages(prev => [...prev, optimisticUserMessage, optimisticAssistantMessage]);

        try {
          await saveMessage('user', userMessageContent);

          const storage = getStorage();
          const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}-${file.name}`);
          
          toast({
            title: "Subiendo archivo...",
            description: `Tu archivo "${file.name}" se está subiendo.`,
          });

          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);

          toast({
            title: "Archivo subido",
            description: "Analizando con la IA...",
          });

          const history: GenkitMessage[] = (messagesData || [])
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              content: [{ text: m.content as string }],
            }));
            
          const photoDataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          });
          
          const { response: aiResponse } = await getAiResponse(userMessageContent, history, photoDataUri);
          await saveMessage('assistant', aiResponse);

        } catch (error) {
          console.error("Error processing file:", error);
          const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
          await saveMessage('assistant', `Lo siento, ocurrió un error al procesar el archivo: ${errorMessage}`);
          toast({
            variant: "destructive",
            title: "Error al procesar archivo",
            description: errorMessage,
          });
        } finally {
            setOptimisticMessages([]);
        }
      };
      processAndRespond();
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending || !user) return;
  
    const currentInput = input;
    setInput('');
  
    const optimisticUserMessage: Message = {
      id: `optimistic-user-${Date.now()}`,
      role: 'user',
      content: currentInput,
      createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0),
    };
    const optimisticAssistantMessage: Message = {
        id: `optimistic-assistant-${Date.now()}`,
        role: 'assistant',
        content: '...',
        createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0),
    };
    setOptimisticMessages(prev => [...prev, optimisticUserMessage, optimisticAssistantMessage]);

    startTransition(() => {
      const processAndRespond = async () => {
        try {
          await saveMessage('user', currentInput);
  
          const history: GenkitMessage[] = (messagesData || [])
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              content: [{ text: m.content as string }],
            }));
  
          const { response: aiResponse } = await getAiResponse(currentInput, history);
          await saveMessage('assistant', aiResponse);
  
        } catch (error) {
          console.error("Error in chat submission:", error);
          const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
          await saveMessage('assistant', `Lo siento, ocurrió un error: ${errorMessage}`);
          toast({
            variant: "destructive",
            title: "Error en el chat",
            description: errorMessage,
          });
        } finally {
            setOptimisticMessages([]);
        }
      };
      processAndRespond();
    });
  };

  if (isUserLoading) {
     return (
        <div className="flex-1 p-4 space-y-6 flex items-end">
            <div className="flex items-start gap-3 w-full">
              <Avatar className="w-8 h-8 border">
                <AvatarFallback>
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-lg bg-muted max-w-[80%] w-full space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
        </div>
     )
  }

  return (
    <>
      <SheetHeader className="p-4 border-b">
        <SheetTitle className="font-headline flex items-center gap-2">
            <Bot /> Asistente Geometra
        </SheetTitle>
        <SheetDescription>
            {user ? 'Usa este chat para hacer preguntas sobre matemáticas y GeoGebra.' : 'Inicia sesión para usar el asistente y guardar tu historial.'}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6" ref={viewportRef}>
          {!user ? (
             <div className="text-sm p-3 rounded-lg bg-secondary text-secondary-foreground w-full">
               Inicia sesión con Google para comenzar a chatear.
             </div>
          ) : isLoadingMessages ? (
             <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback>
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted max-w-[80%] w-full space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
          ) : allMessages.length === 0 ? (
            <WelcomeMessage onPromptClick={handlePromptClick} />
          ) : (
            allMessages.map((message) => (
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
                      'p-3 rounded-lg max-w-[80%] text-sm whitespace-pre-wrap',
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
                        message.content
                    )}
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
          <div className="w-full">
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-center space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={user ? "Escribe tu pregunta..." : "Inicia sesión para chatear"}
                disabled={isPending || !user}
              />
              <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isPending || !user}>
                <Paperclip className="w-4 h-4" />
                <span className="sr-only">Adjuntar archivo</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                disabled={isPending || !user}
              />
              <Button type="submit" size="icon" disabled={isPending || !input.trim() || !user}>
                <Send className="w-4 h-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </div>
      </SheetFooter>
    </>
  );
}
