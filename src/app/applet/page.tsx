'use client';

import { Suspense } from 'react';
import { GeoGebraApplet } from '@/components/geogebra-applet';
import { GeoGebraAIChat } from '@/components/geogebra-ai-chat';
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

