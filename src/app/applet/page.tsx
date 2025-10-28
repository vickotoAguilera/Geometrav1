'use client';

import { GeoGebraApplet } from '@/components/geogebra-applet';
import Header from '@/components/header';

export default function AppletPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 relative w-full overflow-hidden">
        <GeoGebraApplet />
      </main>
    </div>
  );
}