'use client';
import { useState, useRef, useEffect, useTransition } from 'react';
import { HelpCircle, Bot, X, Send, Loader2, Mic, Volume2, Waves } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { getSiteGuideResponse } from '@/app/site-guide-actions';
import { generateSpeech } from '@/app/tts-actions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User } from 'lucide-react';
import { Part } from 'genkit';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

const WelcomeMessage = () => (
  <div className="text-sm p-3 rounded-lg bg-secondary text-secondary-foreground w-full space-y-2">
    <p className="font-medium">
      ¡Hola! Soy tu guía. Pregúntame para qué sirve cada sección, como "Glosario" o "PAES".
    </p>
  </div>
);

const parseResponse = (content: string) => {
    const boldRegex = /\*\*(.*?)\*\*/gs;
    const parts: ({ type: 'text' | 'bold', value: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
        }
        parts.push({ type: 'bold', value: match[1] });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push({ type: 'text', value: content.substring(lastIndex) });
    }
    return parts;
};

export default function FloatingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const [audioState, setAudioState] = useState<{ id: string; src: string; isPlaying: boolean } | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition({
    onTranscript: (newTranscript) => {
      setInput(prev => (prev.endsWith(' ') ? prev : prev + ' ') + newTranscript);
    }
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      setTimeout(() => { viewport.scrollTop = viewport.scrollHeight; }, 0);
    }
  }, [messages, isPending]);

   useEffect(() => {
    if (audioState?.src) {
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


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const currentInput = input;
    setInput('');

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: currentInput };
    const assistantPlaceholder: ChatMessage = { id: `assistant-${Date.now()}`, role: 'model', content: '...' };

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);

    startTransition(async () => {
      const history: GenkitMessage[] = messages.map(m => ({ role: m.role, content: [{ text: m.content }] }));
      try {
        const { response } = await getSiteGuideResponse(currentInput, history);
        setMessages(prev => prev.slice(0, -1).concat({ ...assistantPlaceholder, id: `${assistantPlaceholder.id}-final`, content: response }));
      } catch (error) {
        console.error("Site guide error:", error);
        setMessages(prev => prev.slice(0, -1).concat({ ...assistantPlaceholder, id: `${assistantPlaceholder.id}-error`, content: "Lo siento, no pude procesar tu solicitud." }));
      }
    });
  };

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (audioState?.id === messageId && audioState.isPlaying) {
      setAudioState(null);
      return;
    }
    setIsGeneratingAudio(messageId);
    try {
      const { audio } = await generateSpeech(text);
      setAudioState({ id: messageId, src: audio, isPlaying: true });
    } catch (error) {
      console.error("Speech generation error:", error);
    } finally {
      setIsGeneratingAudio(null);
    }
  };


  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 rounded-full shadow-lg h-14 w-14"
      >
        <HelpCircle className="h-7 w-7" />
      </Button>
    );
  }

  return (
    <Card
      className="fixed bottom-5 right-5 z-50 w-[380px] h-[550px] flex flex-col shadow-xl"
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
        <CardTitle className="text-md flex items-center gap-2">
            <Bot className="h-5 w-5" /> Geometra Guía
        </CardTitle>
        <div className="flex items-center gap-1">
            {isSupported && (
                <Button variant="ghost" size="icon" className={cn("h-8 w-8", isListening && 'text-red-500')} onClick={isListening ? stopListening : startListening} disabled={isPending}>
                    <Mic className="h-5 w-5"/>
                </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div className="p-4 space-y-4">
             {messages.length === 0 ? <WelcomeMessage /> : messages.map((message) => (
               <div key={message.id} className={cn('flex items-start gap-3', message.role === 'user' && 'justify-end')}>
                 {message.role !== 'user' && <Avatar className="w-8 h-8 border"><AvatarFallback><Bot className="w-5 w-5" /></AvatarFallback></Avatar>}
                 <div className={cn('p-3 rounded-lg max-w-[85%] text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                   {message.content === '...' ? (
                     <div className="flex items-center space-x-2"><div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-current rounded-full animate-bounce"></div></div>
                   ) : (
                     <>
                        <div className="whitespace-pre-wrap space-y-2">
                            {parseResponse(message.content).map((part, index) =>
                                part.type === 'bold' ? <strong key={index}>{part.value}</strong> : <span key={index}>{part.value}</span>
                            )}
                        </div>
                        {message.role === 'model' && (
                            <div className='-mb-2 -mr-2 mt-2 flex justify-end'>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => handlePlayAudio(message.id, message.content)} disabled={!!isGeneratingAudio}>
                                    {isGeneratingAudio === message.id ? <Loader2 className="h-4 w-4 animate-spin"/> : audioState?.id === message.id && audioState.isPlaying ? <Waves className="h-4 w-4" /> : <Volume2 className="h-4 w-4"/>}
                                </Button>
                            </div>
                        )}
                     </>
                   )}
                 </div>
                 {message.role === 'user' && <Avatar className="w-8 h-8 border"><AvatarFallback><User className="w-5 h-5" /></AvatarFallback></Avatar>}
               </div>
             ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder={isListening ? "Escuchando..." : "Pregúntame algo..."} disabled={isPending} />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
