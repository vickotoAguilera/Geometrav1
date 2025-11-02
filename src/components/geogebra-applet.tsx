'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

declare global {
  interface Window { GGBApplet?: any; }
}

// Almacenamos la instancia del applet fuera del componente para que persista entre renders.
// La clave será el ID del grupo de ejercicios.
const appletInstances: { [key: string]: any } = {};

export const GeoGebraApplet = memo(function GeoGebraApplet() {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const currentGroupId = searchParams.get('grupo');

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !isClient || !containerRef.current || !currentGroupId) return;

    const container = containerRef.current;
    
    // Función para inicializar un nuevo applet de GeoGebra
    const initializeNewApplet = (groupId: string) => {
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
        const applet = new window.GGBApplet(parameters, true);
        applet.inject(container);
        appletInstances[groupId] = applet; // Guardar la nueva instancia
    };

    const loadGeoGebraScript = (): Promise<void> => {
      return new Promise((resolve) => {
        if (window.GGBApplet) return resolve();
        const script = document.createElement('script');
        script.id = 'ggb-script';
        script.src = 'https://www.geogebra.org/apps/deployggb.js';
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadGeoGebraScript().then(() => {
        container.innerHTML = ''; // Limpiar el contenedor
        
        // Si ya existe una instancia para este grupo, la re-inyecta.
        if (appletInstances[currentGroupId]) {
            appletInstances[currentGroupId].inject(container);
        } else {
            // Si no, crea una nueva.
            initializeNewApplet(currentGroupId);
        }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (appletInstances[currentGroupId] && container) {
        appletInstances[currentGroupId].setSize(container.clientWidth, container.clientHeight);
      }
    });
    
    resizeObserver.observe(container);

    return () => {
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
