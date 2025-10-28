import { GeogebraApplet } from './geogebra-applet';

export const metadata = {
  title: 'Applet Interactivo | Geometra',
  description: 'Explora conceptos matemáticos con el applet interactivo de GeoGebra.',
};

export default function GeogebraPage() {
  return (
    <div className="h-full w-full">
      <GeogebraApplet />
    </div>
  );
}
