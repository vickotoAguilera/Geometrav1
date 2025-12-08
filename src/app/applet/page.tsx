'use client';

import { Suspense } from 'react';
import { GeoGebraApplet } from '@/components/geogebra-applet';
<<<<<<< HEAD
import { GeoGebraAIChat } from '@/components/geogebra-ai-chat';
=======
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636

// This is now the free-form, non-contextual applet page.
function AppletContent() {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 relative w-full overflow-hidden">
        <GeoGebraApplet />
<<<<<<< HEAD
        <GeoGebraAIChat />
=======
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
      </main>
    </div>
  );
}

export default function AppletPage() {
<<<<<<< HEAD
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Cargando Pizarra Interactiva...</div>}>
      <AppletContent />
    </Suspense>
  )
}

=======
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Cargando Pizarra Interactiva...</div>}>
            <AppletContent/>
        </Suspense>
    )
}

    
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
