import Header from '@/components/header';
import { EnsayoInteractivo } from '@/components/ensayo-interactivo';

export default function EnsayaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground">Ensaya para tus pruebas con el Geometra</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                Selecciona un tema, elige tu modalidad y pon a prueba tus conocimientos. La IA generará una prueba única para ti y te dará retroalimentación personalizada.
            </p>
        </div>

        <EnsayoInteractivo />

      </main>
    </div>
  );
}
