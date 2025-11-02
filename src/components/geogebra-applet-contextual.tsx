'use client';

import { useEffect, useRef, memo, useState } from 'react';

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) {
      return;
    }
    
    const container = containerRef.current;
    if (!window.appletInstances) {
      window.appletInstances = {};
    }

    const initializeOrAttachApplet = () => {
      // Check if an instance for this group ID already exists and is stored
      if (window.appletInstances && window.appletInstances[groupId]) {
        const existingApplet = window.appletInstances[groupId];
        // Ensure the container is clean before re-injecting
        container.innerHTML = '';
        existingApplet.inject(container.id);
        return;
      }

      // If no instance exists, create a new one
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
      // Store the new instance in the global object
      window.appletInstances[groupId] = newApplet;
      // Inject it into the specifically ID'd container
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
    
    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
      resizeObserver.disconnect();
      // Important: Do not destroy the applet instance on unmount
      // It needs to persist in `window.appletInstances`
    };
  }, [isClient, groupId]);

  if (!isClient) {
    return <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted">Cargando pizarra...</div>;
  }

  // Assign a unique and stable ID to the container
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