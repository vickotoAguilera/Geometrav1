'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { Expand, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Se mueve la función de detección dentro del componente o se usa en useEffect.
// Para este caso, la dejaremos fuera pero su uso se controlará con estado.
const isMobileDeviceClient = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

declare global {
  interface Window { GGBApplet?: any; }
  interface Document {
    mozCancelFullScreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    webkitFullscreenElement?: Element;
    msFullscreenElement?: Element;
  }
  interface HTMLElement {
    mozRequestFullScreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  }
}

export const GeoGebraApplet = memo(function GeoGebraApplet() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const appletRef = useRef<any>(null);
  const hasInitializedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Esto se ejecuta solo en el cliente, después de la hidratación.
    setIsClient(true);
    setIsMobile(isMobileDeviceClient());
  }, []);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !isClient) return; // Espera a que el cliente esté listo

    const loadGeoGebraScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.GGBApplet) {
          resolve();
          return;
        }
        const existing = document.getElementById('ggb-script');
        if (existing) {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error('Failed to load GeoGebra script')));
          return;
        }
        const script = document.createElement('script');
        script.id = 'ggb-script';
        script.src = 'https://www.geogebra.org/apps/deployggb.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load GeoGebra script'));
        document.head.appendChild(script);
      });
    };

    const initializeApplet = async () => {
      if (hasInitializedRef.current) return;
      try {
        await loadGeoGebraScript();
        const container = containerRef.current;
        if (!container || !window.GGBApplet) {
          console.warn('GeoGebra container or GGBApplet not available');
          return;
        }
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;
        
        const parameters = {
          id: 'ggbApplet',
          appName: 'classic',
          width,
          height,
          showToolBar: true,
          showAlgebraInput: true,
          showMenuBar: !isMobile,
          enableLabelDrags: true,
          enableShiftDragZoom: true,
          enableRightClick: !isMobile,
          errorDialogsActive: true,
          allowStyleBar: true,
          preventFocus: isMobile,
          showZoomButtons: true,
          useBrowserForJS: false,
          language: 'es',
          enableMobileView: isMobile,
        };

        const applet = new window.GGBApplet(parameters, true);
        applet.inject(container);
        appletRef.current = applet;
        hasInitializedRef.current = true;
      } catch (error) {
        console.error('Error initializing GeoGebra applet:', error);
      }
    };

    void initializeApplet();

    const resizeObserver = new ResizeObserver(() => {
      const applet = appletRef.current;
      const container = containerRef.current;
      if (!applet || !container) return;
      if (typeof applet.setSize !== 'function') return; 

      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        try {
          applet.setSize(newWidth, newHeight);
        } catch (err) {
          console.warn('GeoGebra resize failed:', err);
        }
      }
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [isClient, isMobile]);

  if (!isClient) {
    // Renderiza un placeholder o nada durante el SSR y la hidratación inicial.
    return <div className="w-full h-full min-h-[500px] flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full bg-background"
    >
      <div
        ref={containerRef}
        className="w-full h-full min-h-[500px] flex items-center justify-center"
      />
    </div>
  );
});
