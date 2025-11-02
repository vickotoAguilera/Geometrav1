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
    
    // Initialize global instance store if it doesn't exist
    if (!window.appletInstances) {
      window.appletInstances = {};
    }

    const initializeOrAttachApplet = () => {
      const existingApplet = window.appletInstances?.[groupId];

      if (existingApplet && typeof existingApplet.inject === 'function') {
        // If an applet for this group already exists, re-inject it
        container.innerHTML = ''; // Clear container before injecting
        existingApplet.inject(container);
      } else {
        // If no applet exists, create a new one
        if (!window.GGBApplet) return; // Wait for script to load
        container.innerHTML = '';
        
        const parameters = {
          id: `ggbApplet-${groupId}`, // Use a consistent ID for the group
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
        newApplet.inject(container);
        window.appletInstances[groupId] = newApplet; // Store the new instance
      }
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
