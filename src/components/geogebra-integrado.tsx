'use client';

import { useState, useEffect, useRef } from 'react';
import { GeoGebraAppletContextual } from '@/components/geogebra-applet-contextual';
import { FuncionesChatAssistant, type ChatMessage } from '@/components/funciones-chat-assistant';

interface GeogebraIntegradoProps {
  ejercicioId: string | string[];
  grupoId: string;
  enunciado: React.ReactNode;
}

export function GeogebraIntegrado({ ejercicioId, grupoId, enunciado }: GeogebraIntegradoProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatStorageKey = `chat-history-${grupoId}`;
  const initialLoadDone = useRef(false);
  const currentEjercicioId = Array.isArray(ejercicioId) ? ejercicioId[0] : ejercicioId;


  useEffect(() => {
    if (!currentEjercicioId || !grupoId || initialLoadDone.current) return;

    const loadConversation = async () => {
      const savedMessagesRaw = localStorage.getItem(chatStorageKey);
      let currentHistory: ChatMessage[] = savedMessagesRaw ? JSON.parse(savedMessagesRaw) : [];
      const isNewExercise = !currentHistory.some(msg => msg.contextFile === currentEjercicioId);
      
      if (currentHistory.length === 0 || isNewExercise) {
        const autoPrompt = currentHistory.length === 0
          ? `He activado la guía '${currentEjercicioId}'. Por favor, dame la primera instrucción.`
          : `Ahora también he activado la guía '${currentEjercicioId}'. Considera este nuevo contexto y continúa nuestra conversación.`;

        const userMessage: ChatMessage = { id: `user-context-${Date.now()}`, role: 'user', content: autoPrompt, contextFile: currentEjercicioId };
        setMessages(prev => [...prev, userMessage]);
      } else {
        setMessages(currentHistory);
      }
      initialLoadDone.current = true;
    };
    
    loadConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEjercicioId, grupoId]);

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
      
      {/* 2. Applet de GeoGebra y Chat del Tutor en dos columnas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Columna de GeoGebra */}
        <div className="lg:w-2/3 w-full h-1/2 lg:h-full relative border-r">
          <GeoGebraAppletContextual groupId={grupoId} />
        </div>

        {/* Columna del Chat */}
        <div className="lg:w-1/3 w-full h-1/2 lg:h-full flex flex-col">
          <FuncionesChatAssistant 
              ejercicioId={Array.isArray(ejercicioId) ? ejercicioId.join(',') : ejercicioId}
              grupoId={grupoId}
              messages={messages}
              setMessages={setMessages}
              onReset={handleResetConversation}
          />
        </div>
      </div>
    </div>
  );
}
