'use client';

import { GeoGebraAppletContextual } from '@/components/geogebra-applet-contextual';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { FuncionesChatAssistant } from '@/components/funciones-chat-assistant';

// This is the new contextual applet page for exercises.
function AppletContextualContent() {
  const searchParams = useSearchParams();
  const ejercicioId = searchParams.get('ejercicio');
  const grupoId = searchParams.get('grupo');
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 relative w-full overflow-hidden">
        {/* We use the new contextual applet component here */}
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
                {isChatOpen && <FuncionesChatAssistant ejercicioId={ejercicioId} grupoId={grupoId} />}
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
