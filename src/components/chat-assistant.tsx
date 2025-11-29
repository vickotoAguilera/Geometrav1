'use client';

import { useState, useEffect, useRef, useTransition, useMemo } from 'react';
import { getAiResponse, getInitialPrompts } from '@/app/actions';
import { generateSpeech } from '@/app/tts-actions';
import { SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Trash2, Paperclip, X, FileText, Loader2, Info, GraduationCap, Sigma, Image as ImageIcon, Volume2, Waves, Mic, Files } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, Timestamp, addDoc, getDocs, writeBatch, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Part } from 'genkit';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import AIFeedback from '@/components/feedback/AIFeedback';


interface BaseMessage {
  id: string;
  role: 'user' | 'assistant';
  createdAt?: Timestamp;
}
interface TextMessage extends BaseMessage {
  type: 'text';
  content: string;
  imageUrl?: string;
}
interface FileContextMessage extends BaseMessage {
  type: 'fileContext';
  content: string;
  fileName: string;
  isActive: boolean;
  groupId?: string;
  partNumber?: number;
  totalParts?: number;
}

type Message = TextMessage | FileContextMessage;

interface GroupedFile {
  id: string;
  fileName: string;
  isActive: boolean;
  groupId: string;
  totalParts: number;
  messages: FileContextMessage[];
}

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

type TutorMode = 'math' | 'geogebra' | 'stepByStep' | 'socratic';

// Firestore's document size limit is 1 MiB (1,048,576 bytes).
// We set a chunk size just below this to account for other fields in the document.
const CHUNK_SIZE = 1000000; // 1,000,000 bytes

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
      const textSubParts: ({ type: 'text' | 'code' | 'bold', value: string })[] = [];
      let lastTextIndex = 0;
      let combinedRegex = new RegExp(/<code>(.*?)<\/code>|\*\*(.*?)\*\*/gs);
      let textMatch;

      while ((textMatch = combinedRegex.exec(part.value)) !== null) {
        if (textMatch.index > lastTextIndex) {
          textSubParts.push({ type: 'text', value: part.value.substring(lastTextIndex, textMatch.index) });
        }
        if (textMatch[1]) { // <code> match
          textSubParts.push({ type: 'code', value: textMatch[1] });
        } else if (textMatch[2]) { // **bold** match
          textSubParts.push({ type: 'bold', value: textMatch[2] });
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
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [tutorMode, setTutorMode] = useState<TutorMode>('math');
  const [previousTutorMode, setPreviousTutorMode] = useState<TutorMode>('math');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [audioState, setAudioState] = useState<{ id: string; src: string; isPlaying: boolean } | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition({
    onTranscript: (newTranscript) => {
      setInput(prev => (prev.endsWith(' ') ? prev : prev + ' ') + newTranscript);
    }
  });

  // Persistir modo de tutor en localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('geometra-tutor-mode');
    if (savedMode && ['math', 'geogebra', 'stepByStep', 'socratic'].includes(savedMode)) {
      setTutorMode(savedMode as TutorMode);
      setPreviousTutorMode(savedMode as TutorMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('geometra-tutor-mode', tutorMode);
  }, [tutorMode]);

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

  const textMessages = allMessages.filter(m => m.type === 'text') as TextMessage[];
  const fileContextMessages = allMessages.filter(m => m.type === 'fileContext') as FileContextMessage[];

  const groupedFiles: GroupedFile[] = useMemo(() => {
    const groups: { [key: string]: GroupedFile } = {};
    fileContextMessages.forEach(msg => {
      if (msg.groupId) {
        if (!groups[msg.groupId]) {
          groups[msg.groupId] = {
            id: msg.groupId,
            fileName: msg.fileName.replace(/ - Parte \d+\/\d+$/, ''),
            isActive: msg.isActive,
            groupId: msg.groupId,
            totalParts: msg.totalParts || 1,
            messages: []
          };
        }
        groups[msg.groupId].messages.push(msg);
        if (msg.isActive) { // If any part is active, the whole group is considered active for UI
          groups[msg.groupId].isActive = true;
        }
      } else {
        // Handle files uploaded before the grouping logic
        const individualGroupId = `individual-${msg.id}`;
        groups[individualGroupId] = {
          id: msg.id,
          fileName: msg.fileName,
          isActive: msg.isActive,
          groupId: individualGroupId,
          totalParts: 1,
          messages: [msg]
        };
      }
    });
    return Object.values(groups);
  }, [fileContextMessages]);


  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 0);
    }
  }, [allMessages, isPending]);

  useEffect(() => {
    if (audioState && audioState.src) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setAudioState(null);
      }
      audioRef.current.src = audioState.src;
      audioRef.current.play().catch(e => console.error("Audio playback error", e));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [audioState]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !user || !messagesRef || !firestore) return;

    try {
      const fileDataUri = await fileToDataUri(selectedFile);

      if (selectedFile.type.startsWith('image/')) {
        setAttachedImage(fileDataUri);
      } else {
        // Document handling (PDF, DOCX)
        if (fileDataUri.length > CHUNK_SIZE) {
          // Chunking logic
          const totalParts = Math.ceil(fileDataUri.length / CHUNK_SIZE);
          const groupId = `group-${Date.now()}`;
          const batch = writeBatch(firestore);

          for (let i = 0; i < totalParts; i++) {
            const chunkContent = fileDataUri.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            const docRef = doc(collection(firestore, 'users', user.uid, 'messages'));
            const fileMessageData: Omit<FileContextMessage, 'id'> = {
              role: 'user',
              type: 'fileContext',
              content: chunkContent,
              fileName: `${selectedFile.name} - Parte ${i + 1}/${totalParts}`,
              isActive: true,
              createdAt: serverTimestamp() as Timestamp,
              groupId,
              partNumber: i + 1,
              totalParts,
            };
            batch.set(docRef, fileMessageData);
          }
          await batch.commit();
          toast({
            title: "Archivo grande añadido",
            description: `${selectedFile.name} se dividió en ${totalParts} partes y se añadió al contexto.`,
          });

        } else {
          // Single file logic
          const fileMessageData: Omit<FileContextMessage, 'id'> = {
            role: 'user',
            type: 'fileContext',
            content: fileDataUri,
            fileName: selectedFile.name,
            isActive: true,
            createdAt: serverTimestamp() as Timestamp,
          };
          await addDoc(messagesRef, fileMessageData);
          toast({
            title: "Archivo añadido al contexto",
            description: `${selectedFile.name} está listo para ser usado.`,
          });
        }
      }
    } catch (err) {
      console.error("Failed to process file", err);
      toast({
        variant: "destructive",
        title: "Error al procesar archivo",
        description: "No se pudo leer o guardar el archivo.",
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    const form = document.getElementById('chat-form') as HTMLFormElement;
    if (form) {
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
    if ((!input.trim() && !attachedImage) || isPending || !user) {
      return;
    }

    const currentInput = input;
    const currentAttachedImage = attachedImage;
    setInput('');
    setAttachedImage(null);

    const userMessage: Omit<TextMessage, 'id'> = {
      role: 'user',
      type: 'text',
      content: currentInput,
      createdAt: serverTimestamp() as Timestamp,
      ...(currentAttachedImage && { imageUrl: currentAttachedImage }),
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

          const activeFiles = fileContextMessages
            .filter(f => f.isActive)
            .sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0))
            .map(f => ({ fileName: f.fileName, fileDataUri: f.content }));

          const concatenatedFiles: { fileName: string, fileDataUri: string }[] = [];
          if (activeFiles.length > 0) {
            const fileGroups: { [key: string]: { fileName: string, content: string[] } } = {};

            activeFiles.forEach(f => {
              const baseName = f.fileName.replace(/ - Parte \d+\/\d+$/, '');
              if (!fileGroups[baseName]) {
                fileGroups[baseName] = { fileName: baseName, content: [] };
              }
              // The content from Data URI is already a string, no need for Buffer
              fileGroups[baseName].content.push(f.fileDataUri);
            });

            for (const groupName in fileGroups) {
              concatenatedFiles.push({
                fileName: fileGroups[groupName].fileName,
                fileDataUri: fileGroups[groupName].content.join('')
              });
            }

            toast({
              title: "Usando contexto",
              description: `La IA está usando ${concatenatedFiles.length} archivo(s) como contexto.`,
            });
          }

          const history: GenkitMessage[] = (messages || [])
            .filter(m => m.type === 'text')
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              content: [{ text: (m as TextMessage).content }],
            }));

          // Detectar cambio de modo y agregar mensaje del sistema
          const modeNames = {
            math: 'Normal',
            geogebra: 'GeoGebra',
            stepByStep: 'Paso a Paso',
            socratic: 'Sócrates'
          };

          if (tutorMode !== previousTutorMode && history.length > 0) {
            // Agregar mensaje del sistema informando del cambio de modo
            history.push({
              role: 'user',
              content: [{
                text: `[CAMBIO DE MODO: El usuario ha cambiado del modo "${modeNames[previousTutorMode]}" al modo "${modeNames[tutorMode]}". Por favor, adapta tu siguiente respuesta al nuevo modo de enseñanza. Si el usuario hizo una pregunta, respóndela usando el nuevo enfoque.]`
              }]
            });
            setPreviousTutorMode(tutorMode);
          }

          const { response: aiResponse } = await getAiResponse(currentInput, history, tutorMode, currentAttachedImage ?? undefined, concatenatedFiles);

          await saveMessage({
            role: 'assistant',
            type: 'text',
            content: aiResponse,
            createdAt: serverTimestamp() as Timestamp,
          });

        } catch (error: any) {
          console.error("Error in chat:", error);
          const errorMessage = `Lo siento, ocurrió un error: ${error.message}`;
          await saveMessage({ role: 'assistant', type: 'text', content: errorMessage, createdAt: serverTimestamp() as Timestamp });
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

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (audioState?.id === messageId && audioState.isPlaying) {
      setAudioState(null); // Stop playing
      return;
    }

    const cleanText = text
      .replace(/<code>(.*?)<\/code>/gs, '$1')
      .replace(/\*\*(.*?)\*\*/gs, '$1')
      .replace(/\[button:(.*?)\]/g, '');

    setIsGeneratingAudio(messageId);
    try {
      const { audio } = await generateSpeech(cleanText);
      setAudioState({ id: messageId, src: audio, isPlaying: true });
    } catch (error) {
      console.error("Error generating speech:", error);
      toast({
        variant: "destructive",
        title: "Error de audio",
        description: "No se pudo generar la voz.",
      });
    } finally {
      setIsGeneratingAudio(null);
    }
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

  const toggleFileGroupActive = async (groupId: string, isActive: boolean) => {
    if (!messagesRef || !firestore) return;

    const querySnapshot = await getDocs(query(messagesRef, where('groupId', '==', groupId)));
    const batch = writeBatch(firestore);
    querySnapshot.forEach(doc => {
      batch.update(doc.ref, { isActive });
    });
    await batch.commit();
  };

  const toggleIndividualFileActive = async (fileId: string, isActive: boolean) => {
    if (!messagesRef) return;
    const docRef = doc(messagesRef, fileId);
    await updateDoc(docRef, { isActive });
  }

  const deleteFileGroup = async (groupId: string) => {
    if (!messagesRef || !firestore) return;
    try {
      const querySnapshot = await getDocs(query(messagesRef, where('groupId', '==', groupId)));
      const batch = writeBatch(firestore);
      querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      toast({
        title: "Archivo eliminado",
        description: "El archivo y todas sus partes han sido eliminados del contexto.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar el grupo de archivos.",
      });
    }
  };

  const deleteIndividualFile = async (fileId: string) => {
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
        <SheetTitle>Asistente Geometra</SheetTitle>
        <SheetDescription>
          {user ? (isListening ? 'Escuchando... Di tu pregunta.' : 'Adjunta un archivo para añadir contexto o haz una pregunta.') : 'Inicia sesión para usar el asistente y guardar tu historial.'}
        </SheetDescription>
        {user && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Borrar chat" className="absolute top-3 right-12">
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
      </SheetHeader>

      {user && groupedFiles.length > 0 && (
        <div className="p-3 border-b bg-background">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-2">
            <Info className="w-4 h-4" />
            Contexto de Archivos
          </h3>
          <div className="space-y-2">
            {groupedFiles.map(group => (
              <div key={group.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  {group.totalParts > 1 ? <Files className="w-4 h-4 flex-shrink-0" /> : <FileText className="w-4 h-4 flex-shrink-0" />}
                  <span className="truncate" title={group.fileName}>{group.fileName} {group.totalParts > 1 ? `(${group.totalParts} partes)` : ''}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Switch
                    checked={group.isActive}
                    onCheckedChange={(checked) => group.totalParts > 1 ? toggleFileGroupActive(group.groupId, checked) : toggleIndividualFileActive(group.id, checked)}
                    aria-label={`Activar contexto para ${group.fileName}`}
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => group.totalParts > 1 ? deleteFileGroup(group.groupId) : deleteIndividualFile(group.id)} title="Quitar archivo">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 space-y-6">
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
                    'p-3 rounded-lg max-w-[80%] text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {message.imageUrl && (
                    <div className="mb-2">
                      <Image src={message.imageUrl} alt="Imagen adjunta" width={200} height={200} className="rounded-md object-cover" />
                    </div>
                  )}
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
                  {message.role === 'assistant' && message.content !== '...' && (
                    <>
                      <div className='-mb-2 -mr-2 mt-2 flex justify-end'>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => handlePlayAudio(message.id, message.content)}
                          disabled={!!isGeneratingAudio}
                        >
                          {isGeneratingAudio === message.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : audioState?.id === message.id && audioState.isPlaying ? (
                            <Waves className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* AI Feedback Component */}
                      <AIFeedback
                        conversacionId={user?.uid || 'anonymous'}
                        mensajeId={message.id}
                        flujo={tutorMode === 'geogebra' ? 'geogebra-assistant' : 'math-assistant'}
                      />
                    </>
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
          {user && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Modo de Asistencia</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={tutorMode === 'math' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTutorMode('math')}
                  className="text-xs h-auto py-2"
                >
                  📚 Normal
                </Button>
                <Button
                  variant={tutorMode === 'geogebra' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTutorMode('geogebra')}
                  className="text-xs h-auto py-2"
                >
                  🔧 GeoGebra
                </Button>
                <Button
                  variant={tutorMode === 'stepByStep' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTutorMode('stepByStep')}
                  className="text-xs h-auto py-2"
                >
                  📝 Paso a Paso
                </Button>
                <Button
                  variant={tutorMode === 'socratic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTutorMode('socratic')}
                  className="text-xs h-auto py-2"
                >
                  💭 Sócrates
                </Button>
              </div>
            </div>
          )}
          {attachedImage && (
            <div className="relative w-24 h-24 mx-auto">
              <Image src={attachedImage} alt="Imagen para adjuntar" layout="fill" className="rounded-md object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => setAttachedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
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
              title="Adjuntar archivo o imagen"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={user ? (isListening ? "Escuchando..." : "Escribe tu pregunta...") : "Inicia sesión para chatear"}
              disabled={isPending || !user}
            />
            {isSupported && user && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={isListening ? stopListening : startListening}
                disabled={isPending}
                title={isListening ? "Dejar de grabar" : "Grabar voz"}
                className={cn(isListening && 'text-red-500 hover:text-red-600')}
              >
                <Mic className="w-5 h-5" />
              </Button>
            )}
            <Button type="submit" size="icon" disabled={isPending || (!input.trim() && !attachedImage) || !user}>
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
