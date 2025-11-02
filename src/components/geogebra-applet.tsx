'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

declare global {
  interface Window { GGBApplet?: any; }
}

export const GeoGebraApplet = memo(function GeoGebraApplet() {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const appletRef = useRef<any>(null); // Usaremos useRef para la instancia del applet
  const [isClient, setIsClient] = useState(false);
  const currentGroupId = searchParams.get('grupo');

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !isClient || !containerRef.current) return;

    const container = containerRef.current;
    
    const initializeApplet = () => {
        if (!window.GGBApplet) return;
        
        container.innerHTML = ''; // Limpiar el contenedor antes de inyectar

        const parameters = {
            id: `ggbApplet-${currentGroupId || 'default'}`,
            appName: 'classic',
            width: container.clientWidth || 800,
            height: container.clientHeight || 600,
            showToolBar: true,
            showAlgebraInput: true,
            showMenuBar: true,
            enableLabelDrags: true,
            enableShiftDragZoom: true,
            enableRightClick: true,
            language: 'es',
        };
        const applet = new window.GGBApplet(parameters, true);
        applet.inject(container);
        appletRef.current = applet; // Guardar la instancia en el ref
    };

    const loadGeoGebraScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.GGBApplet) return resolve();
        
        const existingScript = document.getElementById('ggb-script');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', (e) => reject(e));
            return;
        }

        const script = document.createElement('script');
        script.id = 'ggb-script';
        script.src = 'https://www.geogebra.org/apps/deployggb.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
      });
    };

    loadGeoGebraScript().then(initializeApplet).catch(error => {
        console.error("Error loading or initializing GeoGebra applet:", error);
    });

    const resizeObserver = new ResizeObserver(() => {
      const applet = appletRef.current;
      if (applet && container && typeof applet.setSize === 'function') {
        applet.setSize(container.clientWidth, container.clientHeight);
      }
    });
    
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      appletRef.current = null; // Limpiar la referencia al desmontar
    };
  }, [isClient, currentGroupId]);

  if (!isClient) {
    return <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted">Cargando pizarra...</div>;
  }

  return (
    <div className="relative w-full h-full bg-background">
      <div
        ref={containerRef}
        className="w-full h-full min-h-[500px] flex items-center justify-center"
      />
    </div>
  );
});
