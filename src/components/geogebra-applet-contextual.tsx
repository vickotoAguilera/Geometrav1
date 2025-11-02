'use client';

import { useEffect, useRef, memo, useState } from 'react';

declare global {
  interface Window {
    GGBApplet?: any;
  }
}

interface GeoGebraAppletContextualProps {
    groupId: string;
}

export const GeoGebraAppletContextual = memo(function GeoGebraAppletContextual({ groupId }: GeoGebraAppletContextualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appletRef = useRef<any>(null);
  const hasInitialized = useRef(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current || hasInitialized.current) {
      return;
    }

    const container = containerRef.current;
    
    const initializeApplet = () => {
      if (!window.GGBApplet) return;

      container.innerHTML = ''; 

      const parameters = {
        id: `ggbApplet-${groupId}-${Date.now()}`, // Unique ID to force re-render
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
      appletRef.current = applet;
      hasInitialized.current = true;
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
        if (appletRef.current && container) {
            const applet = appletRef.current;
            if (applet && typeof applet.setSize === 'function') {
                applet.setSize(container.clientWidth, container.clientHeight);
            }
        }
    });
    
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
        if (container) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            resizeObserver.unobserve(container);
        }
      resizeObserver.disconnect();
      hasInitialized.current = false;
    };
  }, [isClient, groupId]);

  if (!isClient) {
    return <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted">Cargando pizarra...</div>;
  }

  return (
    <div className="relative w-full h-full bg-background">
      <div
        ref={containerRef}
        id={`geogebra-container-${groupId}`}
        className="w-full h-full min-h-[500px] flex items-center justify-center"
      />
    </div>
  );
});