import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, HardDrive, Mic, MicOff, Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';

interface ChatInputProps {
    onSendMessage: (content: string, screenshot?: string) => void;
    onFileSelect: (file: File) => void;
    onOpenDrivePicker: () => void;
    isLoading: boolean;
}

export function ChatInput({ onSendMessage, onFileSelect, onOpenDrivePicker, isLoading }: ChatInputProps) {
    const [input, setInput] = useState("");
    const [sendScreenshot, setSendScreenshot] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition({
        onTranscript: (transcript) => {
            setInput(prev => prev + transcript);
        }
    });

    const takeScreenshot = async (): Promise<string | null> => {
        const mainElement = document.querySelector('main');
        if (!mainElement) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo encontrar el contenido principal de la página.'
            });
            return null;
        }
        try {
            const canvas = await html2canvas(mainElement, {
                useCORS: true,
                logging: false,
                scale: window.devicePixelRatio,
            });
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error taking screenshot:', error);
            toast({
                variant: 'destructive',
                title: 'Error de Captura',
                description: 'No se pudo tomar la captura de pantalla. Se enviará el mensaje sin imagen.'
            });
            return null;
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        let screenshotDataUri: string | undefined = undefined;
        if (sendScreenshot) {
            const screenshot = await takeScreenshot();
            // Si falla el screenshot, continuar sin él (no bloquear el envío)
            if (screenshot) {
                screenshotDataUri = screenshot;
            } else {
                console.warn('Screenshot failed, sending message without it');
            }
        }

        onSendMessage(input, screenshotDataUri);
        setInput("");
        setSendScreenshot(false); // Reset screenshot toggle
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    return (
        <div className="p-4 border-t bg-background">
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.docx"
                />

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    title="Adjuntar archivo"
                >
                    <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={sendScreenshot ? "default" : "outline"}
                    size="icon"
                    onClick={() => setSendScreenshot(prev => !prev)}
                    disabled={isLoading}
                    title={sendScreenshot ? "Desactivar captura de pantalla" : "Activar captura de pantalla"}
                >
                    <Camera className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onOpenDrivePicker}
                    disabled={isLoading}
                    title="Adjuntar desde Drive"
                >
                    <HardDrive className="h-4 w-4" />
                </Button>
                {isSupported && (
                    <Button
                        type="button"
                        variant={isListening ? "default" : "outline"}
                        size="icon"
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoading}
                        title={isListening ? "Detener grabación" : "Grabar voz"}
                    >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                )}
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    className="min-h-[44px] max-h-[200px] resize-none"
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
