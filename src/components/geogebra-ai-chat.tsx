'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Loader2, MessageSquare, X } from 'lucide-react';
import { interpretGeoGebraCommand } from '@/app/geogebra-ai-actions';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function GeoGebraAIChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingConfirmation, setPendingConfirmation] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    // Estados para el botón draggable
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Inicializar posición del botón (esquina inferior derecha)
    useEffect(() => {
        setButtonPosition({
            x: window.innerWidth - 100,
            y: window.innerHeight - 100,
        });
    }, []);

    // Manejar inicio de arrastre
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!buttonRef.current) return;
        setIsDragging(true);
        const rect = buttonRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    // Manejar movimiento
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;

            // Limitar a los bordes de la pantalla
            const maxX = window.innerWidth - 56;
            const maxY = window.innerHeight - 56;

            setButtonPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    const executeGeoGebraCommands = async (commands: string[]) => {
        const ggbApplet = (window as any).ggbAppletFree;

        if (!ggbApplet) {
            console.error('GeoGebra no está cargado');
            return;
        }

        // Ejecutar comandos uno por uno con mensajes explicativos
        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];

            // Agregar mensaje explicativo antes de ejecutar el comando
            let explanation = '';
            if (cmd.includes('=')) {
                const pointName = cmd.split('=')[0].trim();
                const coords = cmd.split('=')[1].trim();
                explanation = `Ponemos el punto ${pointName} en ${coords}`;
            } else if (cmd.includes('Polygon')) {
                explanation = `Escribimos el comando ${cmd}`;
            } else if (cmd.includes('Circle')) {
                explanation = `Creamos el círculo con ${cmd}`;
            } else if (cmd.includes('ShowLabel')) {
                explanation = `Mostramos la etiqueta`;
            } else {
                explanation = `Ejecutando: ${cmd}`;
            }

            // Agregar mensaje de la IA
            const stepMessage: Message = {
                role: 'assistant',
                content: explanation,
            };
            setMessages(prev => [...prev, stepMessage]);

            // Esperar un momento para que el usuario vea el mensaje
            await new Promise(resolve => setTimeout(resolve, 800));

            try {
                console.log(`Ejecutando comando ${i + 1}/${commands.length}:`, cmd);
                ggbApplet.evalCommand(cmd);

                // Esperar 1 segundo antes del siguiente comando
                if (i < commands.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error('Error ejecutando comando:', cmd, error);
                const errorMsg: Message = {
                    role: 'assistant',
                    content: `⚠️ Error al ejecutar: ${cmd}`,
                };
                setMessages(prev => [...prev, errorMsg]);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.map(m => ({
                role: (m.role === 'assistant' ? 'model' : m.role) as 'user' | 'model',
                content: m.content,
            }));

            const result = await interpretGeoGebraCommand({
                userMessage: input,
                history,
                pendingConfirmation,
            });

            // Ejecutar comandos de GeoGebra (esperar a que terminen)
            if (result.commands.length > 0) {
                await executeGeoGebraCommands(result.commands);
            }

            // Agregar respuesta de la IA
            const assistantMessage: Message = {
                role: 'assistant',
                content: result.message,
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Actualizar estado de confirmación
            setPendingConfirmation(result.needsConfirmation || false);

        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Lo siento, hubo un error al procesar tu comando. Por favor, intenta de nuevo.',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Draggable Floating Chat Button */}
            {!chatOpen && (
                <Button
                    ref={buttonRef}
                    onMouseDown={handleMouseDown}
                    onClick={(e) => {
                        if (!isDragging) {
                            setChatOpen(true);
                        }
                    }}
                    className="fixed h-14 w-14 rounded-full shadow-lg z-50 cursor-move"
                    size="icon"
                    style={{
                        left: `${buttonPosition.x}px`,
                        top: `${buttonPosition.y}px`,
                        cursor: isDragging ? 'grabbing' : 'grab',
                    }}
                >
                    <MessageSquare className="h-6 w-6" />
                </Button>
            )}

            {/* Floating Chat Panel */}
            {chatOpen && (
                <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl flex flex-col z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold">Asistente IA GeoGebra</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setChatOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground text-sm py-8">
                                <p className="mb-2">¡Hola! Soy tu asistente de GeoGebra.</p>
                                <p className="text-xs">Ejemplos:</p>
                                <ul className="text-xs mt-2 space-y-1">
                                    <li>"hazme un triángulo rectángulo"</li>
                                    <li>"crea un círculo con radio 5"</li>
                                    <li>"dibuja un cuadrado"</li>
                                </ul>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Pensando...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    pendingConfirmation
                                        ? "Responde o pide cambios..."
                                        : "Escribe tu comando..."
                                }
                                className="min-h-[60px] max-h-[100px] resize-none text-sm"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isLoading}
                                size="icon"
                                className="h-[60px] w-[60px] flex-shrink-0"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
}
