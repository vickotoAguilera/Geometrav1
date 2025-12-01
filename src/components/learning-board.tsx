'use client';

import { useCallback } from 'react';
import { GeoGebraApplet } from '@/components/geogebra-applet';
import { ChatAssistant } from '@/components/chat-assistant';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function LearningBoard() {
    const { toast } = useToast();

    const handleGeoGebraCommand = useCallback((command: string) => {
        console.log('Executing GeoGebra command:', command);

        // El ID 'ggbAppletFree' está definido en src/components/geogebra-applet.tsx
        // @ts-ignore
        const applet = window.ggbAppletFree;

        if (applet && typeof applet.evalCommand === 'function') {
            try {
                applet.evalCommand(command);
                toast({
                    title: "Comando ejecutado",
                    description: `Geometra ha dibujado en la pizarra.`,
                    duration: 2000,
                });
            } catch (error) {
                console.error('Error executing GeoGebra command:', error);
                toast({
                    variant: "destructive",
                    title: "Error de ejecución",
                    description: "No se pudo ejecutar el comando en la pizarra.",
                });
            }
        } else {
            console.warn('GeoGebra applet not ready or ID mismatch. Expected window.ggbAppletFree');
            toast({
                variant: "destructive",
                title: "Pizarra no lista",
                description: "El applet de GeoGebra aún no está listo.",
            });
        }
    }, [toast]);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-4 p-4">
            <Card className="flex-1 overflow-hidden border-2 border-primary/20 shadow-xl relative">
                <GeoGebraApplet />
            </Card>
            <Card className="w-full lg:w-[450px] flex flex-col border-2 border-primary/20 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-[500px] lg:h-full">
                <ChatAssistant onGeoGebraCommand={handleGeoGebraCommand} />
            </Card>
        </div>
    );
}
