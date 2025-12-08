'use client';

import { Suspense } from 'react';
import { GeoGebraApplet } from '@/components/geogebra-applet';
import { GeoGebraAIChat } from '@/components/geogebra-ai-chat';

// This is now the free-form, non-contextual applet page.
function AppletContent() {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 relative w-full overflow-hidden">
        <GeoGebraApplet />
        <GeoGebraAIChat />
      </main>
    </div>
  );
}

export default function AppletPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Cargando Pizarra Interactiva...</div>}>
      <AppletContent />
    </Suspense>
  )
}

