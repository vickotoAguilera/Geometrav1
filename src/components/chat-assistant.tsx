'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import {
  getAiResponse,
  getInitialPrompts,
  uploadAndProcessDocument,
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
import { Bot, User, Send, Paperclip, X, FileText, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, Timestamp, addDoc } from 'firebase/firestore';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Part } from 'genkit';
import Link from 'next/link';

interface FileInfo {
  name: string;
  type: string;
  path: string;
  downloadUrl: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string; // Keep content simple string for Firestore
  fileInfo?: FileInfo;
  createdAt?: Timestamp;
}

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

interface DocumentPreview {
  name: string;
  type: string;
  dataUri: string;
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<DocumentPreview | null>(null);
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

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string, fileInfo?: FileInfo) => {
    if (!messagesRef || !user) return;
    const messageData = {
      userId: user.uid,
      role,
      content,
      createdAt: serverTimestamp(),
      ...(fileInfo && { fileInfo }),
    };
    try {
      await addDoc(messagesRef, messageData);
    } catch(err) {
      console.error("Failed to save message", err);
      toast({
        variant: "destructive",
        title: "Error de guardado",
        description: "No se pudo guardar el mensaje en la base de datos."
      });
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        if (file.type.startsWith('image/')) {
          setImagePreview(dataUri);
          setDocumentPreview(null);
        } else {
          setDocumentPreview({ name: file.name, dataUri, type: file.type });
          setImagePreview(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAttachments = () => {
    setImagePreview(null);
    setDocumentPreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && !imagePreview && !documentPreview) || isPending || !user) return;

    const currentInput = input;
    const currentImage = imagePreview;
    const currentDocument = documentPreview;

    setInput('');
    resetAttachments();

    startTransition(async () => {
      try {
        let aiQuery = currentInput;
        let finalImageUri = currentImage;
        let userMessageContent = currentInput;

        // Start with the existing message history, correctly formatted
        const history: GenkitMessage[] = messages
          .filter(m => typeof m.content === 'string') // Ensure content is a string
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: [{ text: m.content }],
          }));
        
        // Handle file upload and processing
        if (currentDocument) {
          toast({ title: "Subiendo y procesando archivo...", description: `Por favor espera.` });
          const { textContent, downloadUrl, storagePath } = await uploadAndProcessDocument(
            currentDocument.dataUri,
            currentDocument.name,
            currentDocument.type,
            user.uid
          );
          
          toast({
            title: "Archivo procesado",
            description: `Se ha extraído el texto de "${currentDocument.name}". Ahora puedes hacer preguntas sobre él.`,
          });
          
          userMessageContent = `Adjunto el documento "${currentDocument.name}".\n\n${currentInput || 'Por favor, resume el contenido del documento.'}`;
          aiQuery = `Contexto del documento "${currentDocument.name}":\n---\n${textContent}\n---\n\nMi pregunta: ${currentInput || 'Resume el contenido del documento.'}`;
          
          await saveMessage('user', userMessageContent, {
            name: currentDocument.name,
            type: currentDocument.type,
            downloadUrl,
            path: storagePath,
          });

        } else if (currentImage) {
           userMessageContent = currentInput || '[Imagen adjunta]';
           await saveMessage('user', userMessageContent);
        } else {
          await saveMessage('user', currentInput);
        }
        
        const { response } = await getAiResponse(aiQuery, history, finalImageUri ?? undefined);
        await saveMessage('assistant', response);
        
      } catch (error) {
        console.error("Error in transition:", error);
        const errorMessage = error instanceof Error ? error.message : 'Por favor, intenta de nuevo.';
        await saveMessage('assistant', `Lo siento, ocurrió un error: ${errorMessage}`);
        toast({
          variant: "destructive",
          title: "Error en la solicitud",
          description: errorMessage,
        });
      }
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
            {user ? 'Usa este chat para hacer preguntas sobre matemáticas y GeoGebra. Puedes adjuntar imágenes o documentos.' : 'Inicia sesión para usar el asistente y guardar tu historial.'}
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
          ) : messages.length === 0 ? (
            <WelcomeMessage onPromptClick={handlePromptClick} />
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
                      'p-3 rounded-lg max-w-[80%] text-sm whitespace-pre-wrap',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {message.content}
                    {message.fileInfo && (
                       <div className="mt-2 p-2 bg-black/10 rounded-md flex items-center justify-between gap-2">
                          <div className='flex items-center gap-2 truncate'>
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate text-xs font-medium">{message.fileInfo.name}</span>
                          </div>
                          <Link href={message.fileInfo.downloadUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-black/20">
                            <Download className="h-4 w-4" />
                          </Link>
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
          {isPending && (
             <div className="flex items-start gap-3">
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
          )}
        </div>
      </ScrollArea>

      <SheetFooter className="p-4 border-t bg-background">
          <div className="w-full">
            {imagePreview && (
              <div className="mb-2 relative w-24 h-24 rounded-md overflow-hidden border">
                <Image src={imagePreview} alt="Vista previa" layout="fill" objectFit="cover" />
                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={resetAttachments}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {documentPreview && (
                <div className="mb-2 relative w-full p-2 pr-10 rounded-md border bg-muted/50 text-sm flex items-center">
                    <FileText className="h-5 w-5 mr-2 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium text-foreground">{documentPreview.name}</span>
                    <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7" onClick={resetAttachments}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-center space-x-2"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept="image/*,application/pdf,.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt" 
                className="hidden" 
              />
              <Button 
                type="button" 
                size="icon" 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending || !user}
              >
                <Paperclip className="w-4 h-4" />
                <span className="sr-only">Adjuntar archivo</span>
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={user ? "Escribe tu pregunta..." : "Inicia sesión para chatear"}
                disabled={isPending || !user}
              />
              <Button type="submit" size="icon" disabled={isPending || (!input.trim() && !imagePreview && !documentPreview) || !user}>
                <Send className="w-4 h-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </div>
      </SheetFooter>
    </>
  );
}
