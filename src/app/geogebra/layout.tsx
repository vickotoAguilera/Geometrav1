import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Applet Interactivo | Geometra',
  description: 'Explora conceptos matemáticos con el applet interactivo de GeoGebra.',
};

export default function GeoGebraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-background text-foreground antialiased h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
