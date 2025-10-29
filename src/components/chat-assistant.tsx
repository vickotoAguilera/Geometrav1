'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getAiResponse, getInitialPrompts } from '@/app/actions';
import { SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Trash2, Paperclip, X, FileText, Loader2, Info, GraduationCap, Sigma } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, Timestamp, addDoc, getDocs, writeBatch, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Part } from 'genkit';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface BaseMessage {
  id: string;
  role: 'user' | 'assistant';
  createdAt?: Timestamp;
}
interface TextMessage extends BaseMessage {
  type: 'text';
  content: string;
}
interface FileMessage extends BaseMessage {
  type: 'file';
  content: string; // This will store the data URI
  fileName: string;
  isActive: boolean; // To mark if it's the active context
}

type Message = TextMessage | FileMessage;

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

type TutorMode = 'math' | 'geogebra';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
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

  const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  const allMessages = [...(messages || []), ...optimisticMessages];

  const textMessages = allMessages.filter(m => m.type === 'text');
  const fileMessages = allMessages.filter(m => m.type === 'file') as FileMessage[];

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [textMessages, isPending]);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !user || !messagesRef || !firestore) return;
  
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        variant: "destructive",
        title: "Archivo demasiado grande",
        description: "Por favor, selecciona un archivo de menos de 5MB.",
      });
      return;
    }
    
    try {
        const fileDataUri = await fileToDataUri(selectedFile);

        const batch = writeBatch(firestore);
        fileMessages.forEach(fileMsg => {
            if(fileMsg.isActive) {
                const docRef = doc(messagesRef, fileMsg.id);
                batch.update(docRef, { isActive: false });
            }
        });
        await batch.commit();

        const fileMessageData: Omit<FileMessage, 'id'> = {
            role: 'user',
            type: 'file',
            content: fileDataUri,
            fileName: selectedFile.name,
            isActive: true,
            createdAt: serverTimestamp() as Timestamp,
        };

        await addDoc(messagesRef, fileMessageData);

        toast({
            title: "Archivo añadido",
            description: `${selectedFile.name} está listo para ser usado como contexto.`,
        });

    } catch (err) {
      console.error("Failed to save file message", err);
      toast({
        variant: "destructive",
        title: "Error al procesar archivo",
        description: "No se pudo leer o guardar el archivo. Por favor, inténtalo de nuevo.",
      });
    }

    if(fileInputRef.current) fileInputRef.current.value = '';
  };


  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    const form = document.getElementById('chat-form') as HTMLFormElement;
    if(form) {
        setTimeout(() => {
            form.requestSubmit();
        }, 0);
    }
  };
  
  const saveMessage = async (message: Omit<TextMessage, 'id'>) => {
    if (!messagesRef) return;
    try {
      await addDoc(messagesRef, message);
    } catch (err) {
      console.error("Failed to save message", err);
      toast({
        variant: "destructive",
        title: "Error al guardar mensaje",
        description: "No se pudo guardar tu mensaje. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending || !user) return;
  
    const currentInput = input;
    setInput('');
    
    const userMessage: Omit<TextMessage, 'id'> = {
      role: 'user',
      type: 'text',
      content: currentInput,
      createdAt: serverTimestamp() as Timestamp,
    };

    const optimisticUserMessage: TextMessage = {
      ...userMessage,
      id: `optimistic-user-${Date.now()}`,
      createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0),
    };
    
    const optimisticAssistantMessage: TextMessage = {
        id: `optimistic-assistant-${Date.now()}`,
        role: 'assistant',
        type: 'text',
        content: '...',
        createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0),
    };

    setOptimisticMessages(prev => [...prev, optimisticUserMessage, optimisticAssistantMessage]);

    startTransition(() => {
      const processAndRespond = async () => {
        try {
          await saveMessage(userMessage);

          const activeFile = fileMessages.find(f => f.isActive);
          let fileDataUri: string | undefined;
          let fileName: string | undefined;
          
          if (activeFile) {
             toast({
              title: "Usando contexto",
              description: `La IA está usando '${activeFile.fileName}' como contexto.`,
            });
            fileDataUri = activeFile.content;
            fileName = activeFile.fileName;
          }
          
          const history: GenkitMessage[] = (messages || [])
            .filter(m => m.type === 'text')
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              content: [{ text: (m as TextMessage).content }],
            }));
            
          const { response: aiResponse } = await getAiResponse(currentInput, history, tutorMode, fileDataUri, fileName);
          
          await saveMessage({
            role: 'assistant',
            type: 'text',
            content: aiResponse,
            createdAt: serverTimestamp() as Timestamp,
          });
  
        } catch (error: any) {
          console.error("Error in chat:", error);
          const errorMessage = `Lo siento, ocurrió un error: ${error.message}`;
          await saveMessage({role: 'assistant', type: 'text', content: errorMessage, createdAt: serverTimestamp() as Timestamp});
          toast({
            variant: "destructive",
            title: "Error del asistente",
            description: "No se pudo obtener una respuesta. Por favor, inténtalo de nuevo.",
          });
        } finally {
            setOptimisticMessages([]);
        }
      };
      processAndRespond();
    });
  };

  const handleDeleteChat = async () => {
    if (!user || !firestore || !messagesRef) return;
  
    try {
      const messagesSnapshot = await getDocs(messagesRef);
      const batch = writeBatch(firestore);
      messagesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
  
      toast({
        title: "Chat borrado",
        description: "Tu historial de chat ha sido eliminado.",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        variant: "destructive",
        title: "Error al borrar el chat",
        description: "No se pudo completar la eliminación. Por favor, inténtalo de nuevo.",
      });
    }
  };
  
  const toggleFileActive = async (fileId: string) => {
    if (!messagesRef || !firestore) return;
  
    const fileToToggle = fileMessages.find(f => f.id === fileId);
    if (!fileToToggle) return;
  
    const batch = writeBatch(firestore);
    
    // If the clicked file is already active, just deactivate it.
    if (fileToToggle.isActive) {
      const docRef = doc(messagesRef, fileId);
      batch.update(docRef, { isActive: false });
    } else {
      // If the clicked file is not active, deactivate all others and activate this one.
      fileMessages.forEach(file => {
        const docRef = doc(messagesRef, file.id);
        batch.update(docRef, { isActive: file.id === fileId });
      });
    }
  
    await batch.commit();
  };

  const deleteFile = async (fileId: string) => {
    if (!messagesRef) return;
    try {
      await deleteDoc(doc(messagesRef, fileId));
      toast({
        title: "Archivo eliminado",
        description: "El archivo ha sido eliminado del contexto.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar el archivo.",
      });
    }
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
        <div className="flex justify-between items-center">
            <SheetTitle className="font-headline flex items-center gap-2">
                <Bot /> Asistente Geometra
            </SheetTitle>
            {user && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Borrar chat">
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se borrará permanentemente todo tu historial de chat de nuestros servidores.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteChat}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
        <SheetDescription>
            {user ? 'Adjunta un archivo para añadir contexto o haz una pregunta.' : 'Inicia sesión para usar el asistente y guardar tu historial.'}
        </SheetDescription>
      </SheetHeader>

      {user && fileMessages.length > 0 && (
        <div className="p-3 border-b bg-background">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-2">
            <Info className="w-4 h-4"/>
            Contexto de Archivos
          </h3>
          <div className="space-y-2">
            {fileMessages.map(file => (
              <div key={file.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate" title={file.fileName}>{file.fileName}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Button 
                    variant={file.isActive ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => toggleFileActive(file.id)}
                  >
                    {file.isActive ? 'Activo' : 'Activar'}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteFile(file.id)} title="Quitar archivo">
                      <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          ) : textMessages.length === 0 ? (
            <WelcomeMessage onPromptClick={handlePromptClick} />
          ) : (
            textMessages.map((message) => (
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
            { user && (
              <div className="flex items-center justify-center gap-4 text-sm">
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <Sigma className={cn('w-5 h-5', tutorMode === 'math' && 'text-primary')}/>
                    <Label htmlFor="tutor-mode">Tutor de Mates</Label>
                  </div>
                  <Switch
                    id="tutor-mode"
                    checked={tutorMode === 'geogebra'}
                    onCheckedChange={(checked) => setTutorMode(checked ? 'geogebra' : 'math')}
                  />
                  <div className='flex items-center gap-2 text-muted-foreground'>
                     <GraduationCap className={cn('w-5 h-5', tutorMode === 'geogebra' && 'text-primary')}/>
                     <Label htmlFor="tutor-mode">Tutor de GeoGebra</Label>
                  </div>
              </div>
            )}
            <form
              id="chat-form"
              onSubmit={handleSubmit}
              className="flex w-full items-center space-x-2"
            >
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending || !user}
                title="Adjuntar archivo"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={user ? "Escribe tu pregunta..." : "Inicia sesión para chatear"}
                disabled={isPending || !user}
              />
              <Button type="submit" size="icon" disabled={isPending || !input.trim() || !user}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="sr-only">Enviar</span>
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.png,.jpg,.jpeg,.webp"
              />
            </form>
          </div>
      </SheetFooter>
    </>
  );
}
