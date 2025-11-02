import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Applet Interactivo | Geometra',
  description: 'Explora conceptos matemáticos con el applet interactivo de GeoGebra.',
};

export default function GeoGebraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
