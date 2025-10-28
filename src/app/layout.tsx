'use client';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isGeogebraPage = pathname.startsWith('/geogebra');

  return (
    <html lang="es" className="dark">
      <head>
        <title>Geometra</title>
        <meta name="description" content="Tu asistente de IA para dominar las matemáticas y GeoGebra." />
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
      <body className="font-body bg-background text-foreground antialiased flex flex-col min-h-screen">
        {!isGeogebraPage && <Header />}
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
