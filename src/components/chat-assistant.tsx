
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getAiResponse, getInitialPrompts } from '@/app/actions';
import { SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Trash2, Paperclip, GraduationCap, Sigma, X, FileWarning, MessageSquare, File } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, getDocs, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Badge } from './ui/badge';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface FirestoreMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: any;
  uid: string;
}

type TutorMode = 'math' | 'geogebra';

interface GenkitMessage {
  role: 'user' | 'model';
  content: any[];
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
        ¡Hola! Soy tu asistente Geometra. ¿En qué puedo ayudarte hoy?
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

export function ChatAssistant() {
  const [input, setInput] = useState('');
  const [tutorMode, setTutorMode] = useState<TutorMode>('math');
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [attachedFile, setAttachedFile] = useState<{ name: string; dataUri: string; } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'messages');
  }, [firestore, user]);
  
  const messagesQuery = useMemoFirebase(() => {
    if (!messagesCollectionRef) return null;
    return query(messagesCollectionRef, orderBy('createdAt', 'asc'));
  }, [messagesCollectionRef]);

  const { data: messages, isLoading: isLoadingMessages } = useCollection<FirestoreMessage>(messagesQuery);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;


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
    const form = document.getElementById('chat-form') as HTMLFormElement;
    if(form) {
        setTimeout(() => {
            form.requestSubmit();
        }, 0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUri = loadEvent.target?.result as string;
        if (dataUri) {
          setAttachedFile({ name: file.name, dataUri });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    toast({
        title: "Archivo quitado",
        description: "El archivo adjunto ha sido eliminado.",
    });
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && !attachedFile) || isPending || !user || !messagesCollectionRef) return;
  
    const currentInput = input;
    const currentFile = attachedFile;
    setInput('');
    setAttachedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';

    startTransition(() => {
      const processAndRespond = async () => {
        const userMessageContent = currentFile 
            ? `${currentInput} (Archivo adjunto: ${currentFile.name})`
            : currentInput;

        const userMessage: FirestoreMessage = {
          role: 'user',
          content: userMessageContent,
          createdAt: serverTimestamp(),
          uid: user.uid,
        };
        await addDoc(messagesCollectionRef, userMessage);

        try {
          const currentMessages = messagesRef.current || [];
          const history: GenkitMessage[] = currentMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: [{ text: m.content }],
          }));
          
          let queryContent: (string | { text: string } | { media: { url: string } })[] = [{ text: currentInput }];
          if (currentFile) {
            queryContent.push({ media: { url: currentFile.dataUri } });
          } else {
            queryContent = currentInput;
          }

          const { response: aiResponse } = await getAiResponse(queryContent, history, tutorMode);
          
          const newAssistantMessage: FirestoreMessage = {
            role: 'assistant',
            content: aiResponse,
            createdAt: serverTimestamp(),
            uid: 'ai-assistant',
          };
          await addDoc(messagesCollectionRef, newAssistantMessage);
  
        } catch (error: any) {
          console.error("Error in chat:", error);
          const errorMessageContent = `Lo siento, ocurrió un error: ${error.message}`;
           const errorMessage: FirestoreMessage = {
            role: 'assistant',
            content: errorMessageContent,
            createdAt: serverTimestamp(),
            uid: 'ai-assistant-error',
          };
          await addDoc(messagesCollectionRef, errorMessage);
          toast({
            variant: "destructive",
            title: "Error del asistente",
            description: "No se pudo obtener una respuesta. Por favor, inténtalo de nuevo.",
          });
        }
      };
      processAndRespond();
    });
  };

  const handleDeleteChat = async () => {
    if (!messagesCollectionRef) return;

    try {
        const q = query(messagesCollectionRef);
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        toast({
            title: "Chat borrado",
            description: "Tu historial de chat ha sido eliminado de la base de datos.",
        });
    } catch (error) {
        console.error("Error deleting chat history: ", error);
        toast({
            variant: "destructive",
            title: "Error al borrar",
            description: "No se pudo eliminar el historial de chat.",
        });
    }
  };

  const ManageChatDialog = () => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
    if (showDeleteConfirmation) {
      return (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar historial de chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se borrará permanentemente tu historial de chat de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirmation(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              handleDeleteChat();
              setShowDeleteConfirmation(false);
            }}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      );
    }
  
    return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Gestionar Chat</AlertDialogTitle>
          <AlertDialogDescription>
            Selecciona la acción que quieres realizar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col space-y-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirmation(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Borrar Historial de Chat
            </Button>
            {attachedFile && (
                <Button variant="destructive" onClick={removeFile}>
                    <FileWarning className="mr-2 h-4 w-4" />
                    Quitar &quot;{attachedFile.name}&quot;
                </Button>
            )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  };

  if (isUserLoading || (user && isLoadingMessages)) {
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
        <div className="flex justify-between items-center">
            <SheetTitle className="font-headline flex items-center gap-2">
                <Bot /> Asistente Geometra
            </SheetTitle>
            {user && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Gestionar chat">
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <ManageChatDialog />
                </AlertDialog>
            )}
        </div>
        <SheetDescription>
            {user ? 'Haz una pregunta sobre matemáticas o GeoGebra.' : 'Inicia sesión para usar el asistente.'}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 space-y-6">
          {!user ? (
             <div className="text-sm p-3 rounded-lg bg-secondary text-secondary-foreground w-full">
               Inicia sesión para comenzar a chatear.
             </div>
          ) : (!messages || messages.length === 0) && !isPending ? (
            <WelcomeMessage onPromptClick={handlePromptClick} />
          ) : (
            messages?.map((message) => (
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
                   {isPending && messagesRef.current?.at(-1)?.id === message.id ? (
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
             { user && attachedFile && (
                <div className="flex items-center justify-between p-2 rounded-md bg-muted text-sm">
                    <Badge variant="secondary" className="truncate flex-1 mr-2">
                        <File className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{attachedFile.name}</span>
                    </Badge>
                </div>
            )}
            { user && (
              <>
                <div className="flex items-center justify-center gap-4 text-sm">
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <Sigma className={cn('w-5 h-5', tutorMode === 'math' && 'text-destructive')}/>
                      <Label htmlFor="tutor-mode">Tutor de Mates</Label>
                    </div>
                    <Switch
                      id="tutor-mode"
                      checked={tutorMode === 'geogebra'}
                      onCheckedChange={(checked) => setTutorMode(checked ? 'geogebra' : 'math')}
                      disabled={isPending}
                      className={cn(
                        'data-[state=unchecked]:bg-destructive',
                        'data-[state=checked]:bg-primary'
                      )}
                    />
                    <div className='flex items-center gap-2 text-muted-foreground'>
                       <GraduationCap className={cn('w-5 h-5', tutorMode === 'geogebra' && 'text-primary')}/>
                       <Label htmlFor="tutor-mode">Tutor de GeoGebra</Label>
                    </div>
                </div>
              </>
            )}
            <form
              id="chat-form"
              onSubmit={handleSubmit}
              className="flex w-full items-center space-x-2"
            >
              <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" accept="image/*,application/pdf,.docx,.doc" />
              <Button type="button" variant="ghost" size="icon" disabled={!user || isPending} asChild>
                <Label htmlFor="file-upload" className={cn("cursor-pointer", !user || isPending ? "cursor-not-allowed opacity-50" : "")}>
                    <Paperclip className="w-5 h-5" />
                    <span className="sr-only">Adjuntar archivo</span>
                </Label>
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={user ? "Escribe tu pregunta..." : "Inicia sesión para chatear"}
                disabled={isPending || !user}
              />
              <Button type="submit" size="icon" disabled={isPending || (!input.trim() && !attachedFile) || !user}>
                <Send className="w-4 h-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </div>
      </SheetFooter>
    </>
  );
}

    