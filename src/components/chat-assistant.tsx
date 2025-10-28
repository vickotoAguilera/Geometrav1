'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getAiResponse, getInitialPrompts } from '@/app/actions';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Send, CornerDownLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: React.ReactNode;
}

export function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const fetchInitialPrompts = async () => {
    const { examplePrompts } = await getInitialPrompts();
    setMessages([
      {
        id: Date.now(),
        role: 'system',
        content: (
          <div className="space-y-2">
            <p className="font-medium">
              ¡Hola! Soy tu asistente de Geometra. ¿En qué puedo ayudarte hoy?
              Aquí tienes algunas ideas:
            </p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.slice(0, 4).map((prompt, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  onClick={() => handlePromptClick(prompt)}
                  className="text-xs h-auto py-1 px-2"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ),
      },
    ]);
  };

  useEffect(() => {
    fetchInitialPrompts();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    startTransition(async () => {
      try {
        const { response } = await getAiResponse(currentInput);
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content:
            'Lo siento, ocurrió un error. Por favor, intenta de nuevo.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    });
  };

  return (
    <Card className="w-full h-[60vh] flex flex-col shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Bot /> Asistente Matemático
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' && 'justify-end'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                {message.role === 'system' ? (
                  <div className="text-sm p-3 rounded-lg bg-secondary text-secondary-foreground w-full">
                    {message.content}
                  </div>
                ) : (
                  <div
                    className={cn(
                      'p-3 rounded-lg max-w-[80%] text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {message.content}
                  </div>
                )}
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isPending && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted max-w-[80%] w-full">
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta de matemáticas..."
            disabled={isPending}
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
