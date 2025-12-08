import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
<<<<<<< HEAD
import { GoogleOAuthWrapper } from '@/components/GoogleOAuthWrapper';
=======
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: 'Geometra',
  description: 'Aprende GeoGebra con tu asistente de IA.',
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
      </head>
      <body className="font-body antialiased">
<<<<<<< HEAD
        <GoogleOAuthWrapper>
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
        </GoogleOAuthWrapper>
=======
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
      </body>
    </html>
  );
}
