'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const isMobileDeviceClient = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

declare global {
  interface Window { GGBApplet?: any; }
}

// This is the free-form applet component, without contextual memory.
export const GeoGebraApplet = memo(function GeoGebraApplet() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const appletRef = useRef<any>(null);
  const hasInitializedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add the beforeunload event listener to warn the user before leaving.
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ''; // Required for most browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !isClient) return;

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
        
        const isMobile = isMobileDeviceClient();
        
        const parameters = {
          id: 'ggbAppletFree', // Unique ID for the free applet
          appName: 'classic',
          width,
          height,
          showToolBar: true,
          showAlgebraInput: true,
          showMenuBar: true, // Menu bar must be visible for saving/loading
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
  }, [isClient]);

  if (!isClient) {
    return <div className="w-full h-full min-h-[500px] flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div ref={wrapperRef} className="relative w-full h-full bg-background">
      <div
        ref={containerRef}
        className="w-full h-full min-h-[500px] flex items-center justify-center"
      />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[51] flex gap-2">
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="icon"
                    className="bg-red-500/80 hover:bg-red-600/90 text-white rounded-full shadow-lg"
                    title="¡Atención! Cómo guardar tu progreso"
                >
                    <AlertTriangle className="w-5 h-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¡Atención! Guarda tu progreso manualmente</AlertDialogTitle>
                     <AlertDialogDescription className="space-y-2">
                        <span>Esta pizarra es un lienzo libre y <strong>no guarda tu trabajo automáticamente</strong> si sales o recargas la página.</span>
                        <br /><br />
                        <span><strong>Para Guardar:</strong> Usa el menú de GeoGebra (☰) {"->"} 'Descargar como' {"->"} 'Archivo GGB (.ggb)' para guardar tu construcción en tu computadora.</span>
                        <br /><br />
                        <span><strong>Para Abrir:</strong> Usa el menú (☰) {"->"} 'Abrir' para cargar un archivo `.ggb` que hayas guardado previamente.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction>Entendido</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
});