import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Geometra',
  description: 'Aprende GeoGebra con tu asistente de IA.',
};

const DebugDomainScript = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            if (window.top) {
              const domain = window.top.location.hostname;
              if (domain !== 'localhost') {
                console.log(
                  '%cFirebase Auth Domain',
                  'color: #FFCA28; background: #333; font-size: 1.2em; padding: 4px 8px; border-radius: 4px;',
                  'Añade este dominio a tu lista de Dominios Autorizados en la Consola de Firebase -> Authentication -> Settings:',
                  domain
                );
              }
            }
          } catch (e) {
            // Silently ignore cross-origin errors
          }
        `,
      }}
    />
  );
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
        <DebugDomainScript />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
