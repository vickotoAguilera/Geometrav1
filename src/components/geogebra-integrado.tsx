'use client';

import { useState, useEffect, useRef } from 'react';
import { GeoGebraAppletContextual } from '@/components/geogebra-applet-contextual';
import { FuncionesChatAssistant, type ChatMessage } from '@/components/funciones-chat-assistant';

interface GeogebraIntegradoProps {
  ejercicioId: string;
  grupoId: string;
  enunciado: React.ReactNode;
}

export function GeogebraIntegrado({ ejercicioId, grupoId, enunciado }: GeogebraIntegradoProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatStorageKey = `chat-history-${grupoId}`;
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!ejercicioId || !grupoId || initialLoadDone.current) return;

    const loadConversation = async () => {
      const savedMessagesRaw = localStorage.getItem(chatStorageKey);
      let currentHistory: ChatMessage[] = savedMessagesRaw ? JSON.parse(savedMessagesRaw) : [];
      const isNewExercise = !currentHistory.some(msg => msg.contextFile === ejercicioId);
      
      if (currentHistory.length === 0 || isNewExercise) {
        const autoPrompt = currentHistory.length === 0
          ? `He activado la guía '${ejercicioId}'. Por favor, dame la primera instrucción.`
          : `Ahora también he activado la guía '${ejercicioId}'. Considera este nuevo contexto y continúa nuestra conversación.`;

        const userMessage: ChatMessage = { id: `user-context-${Date.now()}`, role: 'user', content: autoPrompt, contextFile: ejercicioId };
        setMessages(prev => [...prev, userMessage]);
      } else {
        setMessages(currentHistory);
      }
      initialLoadDone.current = true;
    };
    
    loadConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ejercicioId, grupoId]);

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
      initialLoadDone.current = false; 
  };

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* 1. Enunciado del Problema */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Enunciado del Ejercicio</h3>
        <div className="text-sm text-muted-foreground">{enunciado}</div>
      </div>
      
      {/* 2. Applet de GeoGebra (flexible) */}
      <div className="flex-1 w-full relative">
        <GeoGebraAppletContextual groupId={grupoId} />
      </div>

      {/* 3. Chat del Tutor (altura fija) */}
      <div className="h-[40vh] border-t">
        <FuncionesChatAssistant 
            ejercicioId={ejercicioId} 
            grupoId={grupoId}
            messages={messages}
            setMessages={setMessages}
            onReset={handleResetConversation}
        />
      </div>
    </div>
  );
}
