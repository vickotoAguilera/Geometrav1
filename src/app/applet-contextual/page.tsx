'use client';

import { GeoGebraAppletContextual } from '@/components/geogebra-applet-contextual';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { FuncionesChatAssistant } from '@/components/funciones-chat-assistant';
import { getGuiaEjercicio } from '@/app/funciones-matrices-actions';
import { ChatMessage } from '@/components/funciones-chat-assistant';

// This is the new contextual applet page for exercises.
function AppletContextualContent() {
  const searchParams = useSearchParams();
  const ejercicioId = searchParams.get('ejercicio');
  const grupoId = searchParams.get('grupo');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // State for chat messages is now managed here
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatStorageKey = `chat-history-${grupoId}`;
  
  // Ref to track if the initial load has been done
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!isChatOpen || !ejercicioId || !grupoId || initialLoadDone.current) return;

    const loadConversation = async () => {
      const savedMessagesRaw = localStorage.getItem(chatStorageKey);
      let currentHistory: ChatMessage[] = savedMessagesRaw ? JSON.parse(savedMessagesRaw) : [];
      const isNewExercise = !currentHistory.some(msg => msg.contextFile === ejercicioId);
      
      if (currentHistory.length === 0 || isNewExercise) {
        const autoPrompt = currentHistory.length === 0
          ? `He activado la guía '${ejercicioId}'. Por favor, dame la primera instrucción.`
          : `Ahora también he activado la guía '${ejercicioId}'. Considera este nuevo contexto y continúa nuestra conversación.`;

        const userMessage: ChatMessage = { id: `user-context-${Date.now()}`, role: 'user', content: autoPrompt, contextFile: ejercicioId };
        
        // Pass a callback to the child to handle the response
        setMessages(prev => [...prev, userMessage]);
      } else {
        setMessages(currentHistory);
      }
      initialLoadDone.current = true;
    };
    
    loadConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen, ejercicioId, grupoId]);

   // Effect to save messages to localStorage whenever they change
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(chatStorageKey, JSON.stringify(messages));
      }
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  }, [messages, chatStorageKey]);


  const handleResetConversation = () => {
      localStorage.removeItem(chatStorageKey);
      setMessages([]);
      initialLoadDone.current = false; // Allow re-initialization
      // The useEffect will trigger again when the chat is opened
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 relative w-full overflow-hidden">
        {grupoId && <GeoGebraAppletContextual groupId={grupoId} />}
        
        {ejercicioId && grupoId && (
          <>
            <Button 
              onClick={() => setIsChatOpen(true)}
              className="absolute top-6 left-1/2 -translate-x-1/2 rounded-full w-16 h-16 shadow-lg animate-bounce z-10"
              title="Ayuda con el ejercicio"
            >
              <Bot className="w-8 h-8" />
            </Button>
            <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
              <SheetContent className="w-full max-w-full lg:max-w-md p-0 flex flex-col h-full">
                {isChatOpen && (
                  <FuncionesChatAssistant 
                    ejercicioId={ejercicioId} 
                    grupoId={grupoId}
                    messages={messages}
                    setMessages={setMessages}
                    onReset={handleResetConversation}
                  />
                )}
              </SheetContent>
            </Sheet>
          </>
        )}
      </main>
    </div>
  );
}

export default function AppletContextualPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Cargando Pizarra de Ejercicio...</div>}>
            <AppletContextualContent />
        </Suspense>
    );
}