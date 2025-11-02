'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    GGBApplet?: any;
    appletInstances?: { [key: string]: any };
  }
}

// Store applet instances outside the component to persist across re-renders
if (typeof window !== 'undefined' && !window.appletInstances) {
  window.appletInstances = {};
}

export const GeoGebraApplet = memo(function GeoGebraApplet() {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const currentGroupId = searchParams.get('grupo');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isClient || !containerRef.current || !currentGroupId) {
      return;
    }

    const container = containerRef.current;
    
    const initializeApplet = () => {
      if (!window.GGBApplet) return;

      // Clear the container before doing anything
      container.innerHTML = ''; 

      // If an applet for this group already exists, re-attach it
      if (window.appletInstances && window.appletInstances[currentGroupId]) {
        const applet = window.appletInstances[currentGroupId];
        applet.inject(container);
        // Force a resize to ensure it fits the container
        setTimeout(() => {
            if (container && typeof applet.setSize === 'function') {
                applet.setSize(container.clientWidth, container.clientHeight);
            }
        }, 100);
        return;
      }
      
      // If no applet exists, create a new one
      const parameters = {
        id: `ggbApplet-${currentGroupId}`,
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
      
      // Store the new applet instance
      if (window.appletInstances) {
        window.appletInstances[currentGroupId] = applet;
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

    loadGeoGebraScript().then(initializeApplet).catch(error => {
      console.error("Error loading or initializing GeoGebra applet:", error);
    });

    const resizeObserver = new ResizeObserver(() => {
        if (window.appletInstances && window.appletInstances[currentGroupId] && container) {
            const applet = window.appletInstances[currentGroupId];
            if (typeof applet.setSize === 'function') {
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
