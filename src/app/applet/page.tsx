'use client';

import { GeoGebraApplet } from '@/components/geogebra-applet';

export default function AppletPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Se elimina el Header para que el applet ocupe toda la pantalla */}
      <main className="flex-1 relative w-full overflow-hidden">
        <GeoGebraApplet />
      </main>
    </div>
  );
}
