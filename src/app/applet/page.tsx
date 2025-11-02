'use client';

import { GeoGebraApplet } from '@/components/geogebra-applet';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { FuncionesChatAssistant } from '@/components/funciones-chat-assistant';

function AppletContent() {
  const searchParams = useSearchParams();
  const ejercicioId = searchParams.get('ejercicio');
  const grupoId = searchParams.get('grupo'); // Obtener el ID del grupo
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 relative w-full overflow-hidden">
        <GeoGebraApplet />
        {ejercicioId && grupoId && ( // Solo mostrar si tenemos ambos IDs
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
                {isChatOpen && <FuncionesChatAssistant ejercicioId={ejercicioId} grupoId={grupoId} />}
              </SheetContent>
            </Sheet>
          </>
        )}
      </main>
    </div>
  );
}


export default function AppletPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Cargando Pizarra Interactiva...</div>}>
            <AppletContent/>
        </Suspense>
    )
}
