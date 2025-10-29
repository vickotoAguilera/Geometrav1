'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getAiResponse, getInitialPrompts } from '@/app/actions';
import { SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Trash2, Paperclip, X, FileText, CheckCircle, Circle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, Timestamp, addDoc, getDocs, writeBatch, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Part } from 'genkit';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'file';
  content: string;
  createdAt?: Timestamp;
  metadata?: {
    fileName?: string;
    active?: boolean;
  }
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

  const { data: messagesData, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  const messages: Message[] = messagesData || [];
  const fileMessages = messages.filter(m => m.role === 'file');

  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  useEffect(() => {
    setOptimisticMessages([]);
  }, [messagesData]);
  
  const allMessages = [...messages.filter(m => m.role !== 'file'), ...optimisticMessages];

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [allMessages, isPending]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !messagesRef) return;

    startTransition(() => {
      const processFile = async () => {
        try {
          let text = '';
          if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const data = await pdfParse(Buffer.from(arrayBuffer));
            text = data.text;
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            text = result.value;
          } else {
            toast({
              variant: 'destructive',
              title: 'Formato no soportado',
              description: 'Por favor, sube un archivo PDF o DOCX.',
            });
            return;
          }

          if (!text.trim()) {
            toast({
              variant: 'destructive',
              title: 'Archivo vacío',
              description: 'No se pudo extraer texto del archivo.',
            });
            return;
          }
          
          // Deactivate other files
          if (firestore) {
            const batch = writeBatch(firestore);
            fileMessages.forEach(msg => {
              if (msg.metadata?.active) {
                const docRef = doc(messagesRef, msg.id);
                batch.update(docRef, { 'metadata.active': false });
              }
            });
            await batch.commit();
          }

          await saveMessage('file', text, { fileName: file.name, active: true });
          
          toast({
            title: "Archivo procesado",
            description: `Se extrajo el texto de "${file.name}" y está activo para el chat.`,
          });

        } catch (error) {
          console.error("Error processing file:", error);
          toast({
            variant: "destructive",
            title: "Error al procesar archivo",
            description: "No se pudo leer el contenido del archivo.",
          });
        }
      }
      processFile();
    });

    // Reset file input
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const saveMessage = async (role: 'user' | 'assistant' | 'file', content: string, metadata?: Message['metadata']) => {
    if (!messagesRef || !user) return;
    const messageData: any = {
      role,
      content,
      createdAt: serverTimestamp(),
      ...(metadata && { metadata })
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
  
          // Include active file content if available
          const activeFile = fileMessages.find(m => m.metadata?.active);
          let queryWithContext = currentInput;
          if (activeFile) {
            queryWithContext = `Usando el siguiente contexto, responde la pregunta.\n\nCONTEXTO:\n---\n${activeFile.content}\n---\n\nPREGUNTA: ${currentInput}`;
          }

          const history: GenkitMessage[] = (messagesData?.filter(m => m.role !== 'file') || [])
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              content: [{ text: m.content as string }],
            }));
  
          const { response: aiResponse } = await getAiResponse(queryWithContext, history);
          await saveMessage('assistant', aiResponse);
  
        } catch (error: any) {
          console.error("Error in chat:", error);
          const errorMessage = `Lo siento, ocurrió un error: ${error.message}`;
          await saveMessage('assistant', errorMessage);
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
        description: "Tu historial de chat y los archivos asociados han sido eliminados.",
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

  const handleDeleteFile = async (fileId: string) => {
    if (!messagesRef) return;
    try {
      await deleteDoc(doc(messagesRef, fileId));
      toast({
        title: "Archivo eliminado",
        description: "El contexto del archivo ha sido eliminado del chat.",
      });
    } catch (error) {
       console.error("Error deleting file:", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar archivo",
        description: "No se pudo eliminar el archivo.",
      });
    }
  };

  const toggleActiveFile = async (fileId: string) => {
    if (!messagesRef || !firestore) return;

    const batch = writeBatch(firestore);
    let currentlyActive = false;

    fileMessages.forEach(msg => {
        const docRef = doc(messagesRef, msg.id);
        if (msg.id === fileId) {
            currentlyActive = !!msg.metadata?.active;
            // Toggle the selected one
            batch.update(docRef, { 'metadata.active': !msg.metadata?.active });
        } else if (msg.metadata?.active) {
            // Deactivate any other active file
            batch.update(docRef, { 'metadata.active': false });
        }
    });

    try {
        await batch.commit();
        toast({
          title: `Archivo ${currentlyActive ? 'desactivado' : 'activado'}`,
          description: `El contexto del archivo ahora está ${currentlyActive ? 'inactivo' : 'activo'}.`
        })
    } catch (error) {
        console.error("Error toggling active file:", error);
        toast({
            variant: "destructive",
            title: "Error al cambiar estado",
            description: "No se pudo actualizar el estado del archivo.",
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
                            Esta acción no se puede deshacer. Se borrará permanentemente todo tu historial de chat y los archivos asociados de nuestros servidores.
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
            {user ? 'Adjunta un PDF/DOCX o haz una pregunta sobre matemáticas y GeoGebra.' : 'Inicia sesión para usar el asistente y guardar tu historial.'}
        </SheetDescription>
      </SheetHeader>

      {user && fileMessages.length > 0 && (
        <div className="p-4 border-b bg-background">
          <h3 className="text-sm font-medium mb-2">Contexto de Archivos</h3>
          <div className="space-y-2">
            {fileMessages.map(file => (
              <div key={file.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate" title={file.metadata?.fileName}>{file.metadata?.fileName}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleActiveFile(file.id)} title={file.metadata?.active ? 'Desactivar contexto' : 'Activar contexto'}>
                    {file.metadata?.active ? <CheckCircle className="w-4 h-4 text-green-500"/> : <Circle className="w-4 h-4 text-muted-foreground"/>}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteFile(file.id)} title="Eliminar archivo">
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
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending || !user}
                title="Adjuntar PDF o DOCX"
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
                <Send className="w-4 h-4" />
                <span className="sr-only">Enviar</span>
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx"
              />
            </form>
          </div>
      </SheetFooter>
    </>
  );
}
