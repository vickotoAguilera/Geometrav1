'use client';

import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

export function GeogebraApplet() {
  const appletContainer = useRef<HTMLDivElement>(null);
  const isScriptLoaded = useRef(false);

  useEffect(() => {
    if (isScriptLoaded.current || typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://www.geogebra.org/apps/deployggb.js';
    script.async = true;
    script.onload = () => {
      if (appletContainer.current) {
        const params = {
          appName: 'graphing',
          width: appletContainer.current.clientWidth,
          height: appletContainer.current.clientHeight,
          showToolBar: true,
          showAlgebraInput: true,
          showMenuBar: false,
          enableShiftDragZoom: true,
          useBrowserForJS: true,
          language: 'es',
        };
        const applet = new window.GGBApplet(params, true);
        applet.inject(appletContainer.current);
      }
    };

    document.body.appendChild(script);
    isScriptLoaded.current = true;

    // Handle resize
    const handleResize = () => {
      if (appletContainer.current && appletContainer.current.querySelector('iframe')) {
        appletContainer.current.innerHTML = '';
        script.onload?.(new Event('load'));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={appletContainer} className="h-full w-full bg-card">
      <Skeleton className="w-full h-full" />
    </div>
  );
}
