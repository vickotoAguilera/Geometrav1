import { GeogebraApplet } from './geogebra-applet';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Applet Interactivo | Geometra',
  description: 'Explora conceptos matemáticos con el applet interactivo de GeoGebra.',
};

export default function GeogebraPage() {
  return (
    <div className="flex-1 w-full h-full">
      <GeogebraApplet />
    </div>
  );
}
