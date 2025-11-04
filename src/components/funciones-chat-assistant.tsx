'use client';

import { useState, useEffect, useRef, useTransition, Dispatch, SetStateAction } from 'react';
import { getFuncionesMatricesAiResponse, generateFuncionesMatricesSpeech, getGuiaEjercicio } from '@/app/funciones-matrices-actions';
import { SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2, Mic, Volume2, Waves, ArrowLeft, Camera, RefreshCw, FileText, AlertTriangle, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Part } from 'genkit';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import html2canvas from 'html2canvas';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  screenshot?: string;
  contextFile?: string;
}

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

interface FuncionesChatAssistantProps {
  ejercicioId: string;
  grupoId: string;
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  onReset: () => void;
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
            const codeRegex = /<code>(.*?)<\/code>/gs;
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

export function FuncionesChatAssistant({ ejercicioId, grupoId, messages, setMessages, onReset }: FuncionesChatAssistantProps) {
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [isAttentionCollapsed, setAttentionCollapsed] = useState(false);

  const [sendScreenshot, setSendScreenshot] = useState(false);
  const [audioState, setAudioState] = useState<{ id: string; src: string; isPlaying: boolean } | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition({
    onTranscript: (newTranscript) => {
        setInput(prev => (prev.endsWith(' ') ? prev : prev + ' ') + newTranscript);
    }
  });
  
  const getActiveGuideContext = async (history: ChatMessage[]): Promise<{ guideContent: string, activeGuides: string[] }> => {
    const activeGuideIds = [...new Set(history.map(m => m.contextFile).filter(Boolean))] as string[];
    
    let combinedContent = '';
    const loadedGuides: string[] = [];

    for (const guideId of activeGuideIds) {
        if (!guideId) continue;
        try {
            const result = await getGuiaEjercicio(guideId);
            if (!('error' in result)) {
                combinedContent += `--- INICIO GUÍA: ${guideId}.md ---\n${result.content}\n--- FIN GUÍA: ${guideId}.md ---\n\n`;
                if (!loadedGuides.includes(`${guideId}.md`)) {
                    loadedGuides.push(`${guideId}.md`);
                }
            }
        } catch (e) {
            console.error(`Failed to load guide ${guideId}`, e);
        }
    }
    return { guideContent: combinedContent, activeGuides: loadedGuides };
  };
  
  // This useEffect triggers the initial AI response when the component mounts with a user message
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'user') {
      const userMessage = messages[0];
      const assistantPlaceholder: ChatMessage = { id: `assistant-context-${Date.now()}`, role: 'model', content: '...', contextFile: userMessage.contextFile };
      setMessages(prev => [...prev, assistantPlaceholder]);

      startTransition(async () => {
        try {
            const { guideContent } = await getActiveGuideContext([userMessage]);
            const { response } = await getFuncionesMatricesAiResponse({
              history: [{ role: userMessage.role, content: [{ text: userMessage.content }] }],
              initialSystemPrompt: guideContent,
              userQuery: userMessage.content
            });
            const finalMessage: ChatMessage = { ...assistantPlaceholder, id: `assistant-final-${Date.now()}`, content: response };
            setMessages(prev => [...prev.slice(0, -1), finalMessage]);
        } catch (error) {
             console.error("Error starting/continuing chat:", error);
             setMessages([]); // Revert on error
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);


  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 0);
    }
  }, [messages, isPending]);

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
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; 
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);


  const takeScreenshot = async (): Promise<string | null> => {
    const mainElement = document.querySelector('main');
    if (!mainElement) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo encontrar el contenido principal para capturar.' });
        return null;
    }
    try {
        const canvas = await html2canvas(mainElement, { useCORS: true, logging: false, scale: window.devicePixelRatio });
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error taking screenshot:', error);
        toast({ variant: 'destructive', title: 'Error de Captura', description: 'No se pudo tomar la captura de pantalla.' });
        return null;
    }
  };

  const handleBackNavigation = () => {
    router.back();
  };

  const handleButtonClick = (value: string) => {
    if (value === 'Volver al Ejercicio') {
      handleBackNavigation();
    } else {
      setInput(value);
      const form = document.getElementById("funciones-chat-form") as HTMLFormElement;
      if (form) {
        setTimeout(() => form.requestSubmit(), 0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const currentInput = input;
    setInput('');
    
    let screenshotDataUri: string | null = null;
    if (sendScreenshot) {
      screenshotDataUri = await takeScreenshot();
      setSendScreenshot(false);
      if (!screenshotDataUri) return;
    }

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: currentInput, ...(screenshotDataUri && { screenshot: screenshotDataUri }), contextFile: ejercicioId };
    const assistantPlaceholder: ChatMessage = { id: `assistant-${Date.now()}`, role: 'model', content: '...', contextFile: ejercicioId };

    const newHistory = [...messages, userMessage];
    setMessages([...newHistory, assistantPlaceholder]);

    startTransition(async () => {
        try {
            const { guideContent } = await getActiveGuideContext(newHistory);
            
            const genkitHistory: GenkitMessage[] = newHistory.map(m => ({
              role: m.role,
              content: [{ text: m.content }],
            }));
            
            const { response: aiResponse } = await getFuncionesMatricesAiResponse({
              history: genkitHistory,
              userQuery: currentInput,
              screenshotDataUri: screenshotDataUri ?? undefined,
              initialSystemPrompt: guideContent,
            });

            setMessages(prev => prev.slice(0, -1).concat({
              id: `assistant-final-${Date.now()}`,
              role: 'model',
              content: aiResponse,
              contextFile: ejercicioId
            }));

        } catch (error: any) {
            console.error("Error in chat:", error);
            toast({ variant: "destructive", title: "Error del asistente", description: "No se pudo obtener una respuesta." });
            setMessages(prev => prev.slice(0, -1));
        }
    });
  };

   const handlePlayAudio = async (messageId: string, text: string) => {
    if (audioState?.id === messageId && audioState.isPlaying) {
      setAudioState(null);
      return;
    }

    const cleanText = text.replace(/<code>(.*?)<\/code>/gs, '$1').replace(/\*\*(.*?)\*\*/gs, '$1').replace(/\[button:(.*?)\]/g, '');
    setIsGeneratingAudio(messageId);
    try {
      const { audio } = await generateFuncionesMatricesSpeech(text);
      setAudioState({ id: messageId, src: audio, isPlaying: true });
    } catch (error) {
      console.error("Error generating speech:", error);
      toast({ variant: "destructive", title: "Error de audio", description: "No se pudo generar la voz." });
    } finally {
      setIsGeneratingAudio(null);
    }
  };

  const activeGuides = [...new Set(messages.map(m => m.contextFile).filter(Boolean))];

  return (
    <>
      <SheetHeader className="p-4 border-b">
        <SheetTitle className="flex items-center gap-2"><Bot /> Tutor de GeoGebra</SheetTitle>
        <SheetDescription>Sigue los pasos para resolver el ejercicio en la pizarra.</SheetDescription>
         <div className="absolute top-3 right-3 flex gap-1">
            <Button variant="ghost" size="icon" onClick={onReset} title="Reiniciar conversación">
                <RefreshCw className="w-5 h-5" />
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Volver al ejercicio">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Seguro que quieres salir?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Si vuelves, tu progreso no guardado en la pizarra de GeoGebra se perderá. Asegúrate de haberlo guardado si quieres conservarlo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBackNavigation}>Salir de todas formas</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </SheetHeader>
      
      <div className="p-3 border-b">
         <Accordion type="single" collapsible defaultValue='item-1' onValueChange={(value) => setAttentionCollapsed(!value)}>
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className={cn("py-2 px-3 rounded-md text-sm hover:no-underline", !isAttentionCollapsed ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-500 text-white')}>
                     <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-semibold">{isAttentionCollapsed ? 'Atención (Haz clic para expandir)' : 'Atención'}</span>
                     </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                    <Alert variant="destructive" className="bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>¡No pierdas tu progreso!</AlertTitle>
                        <AlertDescription className="text-xs">
                           Para guardar tu trabajo en la pizarra, usa el menú de GeoGebra (☰) -> 'Descargar como' -> 'Archivo GGB (.ggb)'. Para recuperarlo más tarde, usa la opción 'Abrir' del mismo menú.
                        </AlertDescription>
                    </Alert>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>

      {activeGuides.length > 0 && (
         <div className="p-3 border-b bg-background">
            <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline py-1">
                        Guías Activas en esta Sesión ({activeGuides.length})
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 space-y-1">
                         {activeGuides.map(guide => (
                            <div key={guide} className="flex items-center p-2 rounded-md bg-muted/50 text-sm">
                                <FileText className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                                <span className="truncate font-medium text-primary">{guide}.md</span>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      )}


      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={cn('flex items-start gap-3', message.role === 'user' && 'justify-end')}>
              {message.role !== 'user' && (
                <Avatar className="w-8 h-8 border"><AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback></Avatar>
              )}
              <div className={cn('p-3 rounded-lg max-w-[85%] text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                {message.screenshot && (
                    <div className="mb-2">
                        <img src={message.screenshot} alt="Captura de pantalla" className="rounded-md object-cover max-h-40"/>
                    </div>
                )}
                {message.content === '...' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                ) : (
                 <>
                  <div className="space-y-2 leading-relaxed">
                    {parseResponse(message.content).map((part, index) => {
                      if (part.type === 'button') {
                        return <Button key={index} variant="outline" size="sm" className="h-auto" onClick={() => handleButtonClick(part.value)}>{part.value}</Button>;
                      } else if (part.type === 'code') {
                        return <code key={index} className="bg-foreground/10 text-foreground font-semibold rounded-md px-2 py-1 block whitespace-pre-wrap">{part.value}</code>;
                      } else if (part.type === 'bold') {
                        return <strong key={index}>{part.value}</strong>;
                      }
                      return <span key={index}>{part.value}</span>;
                    })}
                  </div>
                   {message.role === 'model' && message.content !== '...' && (
                        <div className='-mb-2 -mr-2 mt-2 flex justify-end'>
                             <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-muted-foreground"
                                onClick={() => handlePlayAudio(message.id, message.content)}
                                disabled={!!isGeneratingAudio}
                            >
                                {isGeneratingAudio === message.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                ) : audioState?.id === message.id && audioState.isPlaying ? (
                                    <Waves className="h-4 w-4" />
                                ) : (
                                    <Volume2 className="h-4 w-4"/>
                                )}
                            </Button>
                        </div>
                    )}
                  </>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8 border"><AvatarFallback><User className="w-5 h-5" /></AvatarFallback></Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <SheetFooter className="p-4 border-t bg-background">
        <form id="funciones-chat-form" onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Button
                type="button"
                variant={sendScreenshot ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setSendScreenshot(prev => !prev)}
                disabled={isPending}
                title={sendScreenshot ? "Desactivar captura" : "Activar captura"}
            >
                <Camera className="w-5 h-5" />
            </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Escuchando..." : "Responde al tutor..."}
            disabled={isPending}
          />
           {isSupported && (
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
          <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </SheetFooter>
    </>
  );
}