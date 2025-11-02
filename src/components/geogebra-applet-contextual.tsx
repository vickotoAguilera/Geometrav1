'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { Button } from './ui/button';
import { FileDown, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    GGBApplet?: any;
    appletInstances?: { [key: string]: any };
  }
}

interface GeoGebraAppletContextualProps {
    groupId: string;
}

export const GeoGebraAppletContextual = memo(function GeoGebraAppletContextual({ groupId }: GeoGebraAppletContextualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getApplet = () => {
    if (typeof window !== 'undefined' && window.appletInstances) {
      return window.appletInstances[groupId];
    }
    return null;
  }

  const handleSaveGGB = () => {
    const applet = getApplet();
    if (applet && typeof applet.getGGBBase64 === 'function') {
      const ggbData = applet.getGGBBase64();
      const link = document.createElement('a');
      link.href = `data:application/vnd.geogebra.file;base64,${ggbData}`;
      link.download = `geometra-sesion-${groupId}.ggb`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Guardado', description: 'Tu trabajo en la pizarra ha sido descargado.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el estado de la pizarra.' });
    }
  };

  const handleOpenGGB = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const applet = getApplet();
    if (applet && typeof applet.setBase64 === 'function') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        if (fileContent) {
          const base64Content = fileContent.split(',')[1];
          applet.setBase64(base64Content);
          toast({ title: 'Cargado', description: 'Se ha restaurado tu trabajo en la pizarra.' });
        }
      };
      reader.readAsDataURL(file);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el archivo en la pizarra.' });
    }
    if(fileInputRef.current) fileInputRef.current.value = '';
  };


  useEffect(() => {
    if (!isClient || !containerRef.current) return;
    
    const container = containerRef.current;
    if (!window.appletInstances) {
      window.appletInstances = {};
    }

    const initializeOrAttachApplet = () => {
      if (window.appletInstances?.[groupId] && container) {
        container.innerHTML = ''; // Limpiar el contenedor
        try {
            window.appletInstances[groupId].inject(container.id);
        } catch (e) {
            console.error("Failed to re-inject applet, creating new one.", e);
            delete window.appletInstances[groupId];
            initializeApplet();
        }
        return;
      }

      if (!window.GGBApplet) {
        console.warn('GeoGebra script not loaded yet.');
        return;
      }
      
      container.innerHTML = '';
      
      const parameters = {
        id: `ggbApplet-${groupId}`,
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
      
      const newApplet = new window.GGBApplet(parameters, true);
      window.appletInstances[groupId] = newApplet;
      newApplet.inject(container.id);
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

    loadGeoGebraScript().then(initializeOrAttachApplet).catch(error => {
      console.error("Error loading or initializing GeoGebra applet:", error);
    });

    const resizeObserver = new ResizeObserver(() => {
        const applet = window.appletInstances?.[groupId];
        if (applet && container && typeof applet.setSize === 'function') {
            applet.setSize(container.clientWidth, container.clientHeight);
        }
    });
    
    if(container) {
      resizeObserver.observe(container);
    }

    return () => {
      if(container) {
        resizeObserver.unobserve(container);
      }
      resizeObserver.disconnect();
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
