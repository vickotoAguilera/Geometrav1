import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pizarra de Ejercicio | Geometra',
  description: 'Resuelve ejercicios de matemáticas con el applet interactivo de GeoGebra y la ayuda de un tutor IA.',
};

export default function AppletContextualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
