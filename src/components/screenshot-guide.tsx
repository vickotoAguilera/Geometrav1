'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getScreenshotVozAiResponse } from '@/app/screenshot-actions';
import { generateSpeech } from '@/app/tts-actions';
import { SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2, Camera, Mic, Volume2, Waves, MessageSquareHeart } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Part } from 'genkit';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useUser } from '@/firebase';
import html2canvas from 'html2canvas';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  screenshot?: string;
}

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

const WelcomeMessage = () => {
    return (
      <div className="text-sm p-3 rounded-lg bg-secondary text-secondary-foreground w-full space-y-2">
        <p className="font-medium">
          ¡Hola! Soy tu guía de la aplicación Geometra.
        </p>
        <p>
            Puedes hacerme una pregunta sobre la página actual. Activa el ícono de la cámara 📸 si quieres que analice lo que ves en pantalla.
        </p>
      </div>
    );
  };

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


export function ScreenshotGuide() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const [sendScreenshot, setSendScreenshot] = useState(false);

  const [audioState, setAudioState] = useState<{ id: string, src: string } | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition({
    onTranscript: (newTranscript) => {
        setInput(prev => (prev.endsWith(' ') ? prev : prev + ' ') + newTranscript);
    }
  });

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

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


  const takeScreenshot = async (): Promise<string | null> => {
    const mainElement = document.querySelector('main');
    if (!mainElement) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo encontrar el contenido principal de la página.' });
        return null;
    }
    try {
        const canvas = await html2canvas(mainElement, {
            useCORS: true,
            logging: false,
            // Opciones para mejorar la calidad si es necesario
            scale: window.devicePixelRatio, 
        });
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error taking screenshot:', error);
        toast({ variant: 'destructive', title: 'Error de Captura', description: 'No se pudo tomar la captura de pantalla.' });
        return null;
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending || !user) return;

    const currentInput = input;
    setInput('');

    let screenshotDataUri: string | null = null;
    if (sendScreenshot) {
      screenshotDataUri = await takeScreenshot();
      if (!screenshotDataUri) {
        // Si la captura falla, no continuamos. El toast ya fue mostrado.
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentInput,
      ...(screenshotDataUri && { screenshot: screenshotDataUri })
    };

    const assistantPlaceholder: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'model',
      content: '...',
    };
    
    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);

    startTransition(() => {
      const processAndRespond = async () => {
        try {
          const history: GenkitMessage[] = messages.map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            content: [{ text: m.content }],
          }));
          
          const { response: aiResponse } = await getScreenshotVozAiResponse({
            query: currentInput,
            history: history,
            screenshotDataUri: screenshotDataUri || undefined,
          });
          
          setMessages(prev => prev.slice(0, -1).concat({
            id: `assistant-${Date.now()}-final`,
            role: 'model',
            content: aiResponse,
          }));

        } catch (error: any) {
          console.error("Error in guide chat:", error);
          const errorMessage = `Lo siento, ocurrió un error: ${error.message}`;
          setMessages(prev => prev.slice(0, -1).concat({
            id: `assistant-error-${Date.now()}`,
            role: 'model',
            content: errorMessage,
          }));
          toast({
            variant: "destructive",
            title: "Error del guía IA",
            description: "No se pudo obtener una respuesta. Por favor, inténtalo de nuevo.",
          });
        }
      };
      void processAndRespond();
    });
  };

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (audioState?.id === messageId) {
      setAudioState(null);
      return;
    }

    const cleanText = text.replace(/<code>(.*?)<\/code>/gs, '$1').replace(/\*\*(.*?)\*\*/gs, '$1');
    setIsGeneratingAudio(messageId);
    try {
      const { audio } = await generateSpeech(cleanText);
      setAudioState({ id: messageId, src: audio });
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

  return (
    <>
      <SheetHeader className="p-4 border-b">
        <SheetTitle className="flex items-center gap-2">
            <MessageSquareHeart /> Guía IA de Geometra
        </SheetTitle>
        <SheetDescription>
             {user ? (isListening ? 'Escuchando...' : 'Haz una pregunta sobre la página actual.') : 'Inicia sesión para usar el guía.'}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 space-y-6">
          {messages.length === 0 ? (
            <WelcomeMessage />
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
                    {message.screenshot && (
                        <div className="mb-2">
                            <img src={message.screenshot} alt="Captura de pantalla adjunta" className="rounded-md object-cover max-h-40"/>
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
                               if (part.type === 'code') {
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
                                ) : audioState?.id === message.id ? (
                                    <Waves className="h-4 w-4" />
                                ) : (
                                    <Volume2 className="h-4 w-4"/>
                                )}
                            </Button>
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

      <SheetFooter className="p-4 border-t bg-background">
          <form
            id="screenshot-guide-form"
            onSubmit={handleSubmit}
            className="flex w-full items-center space-x-2"
          >
            <Button
                type="button"
                variant={sendScreenshot ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setSendScreenshot(prev => !prev)}
                disabled={isPending || !user}
                title={sendScreenshot ? "Desactivar captura de pantalla" : "Activar captura de pantalla"}
            >
                <Camera className="w-5 h-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={user ? "Pregúntale al guía..." : "Inicia sesión para chatear"}
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
            <Button type="submit" size="icon" disabled={isPending || !input.trim() || !user}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
      </SheetFooter>
    </>
  );
}
