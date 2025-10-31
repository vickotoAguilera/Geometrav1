import Header from '@/components/header';
import { EnsayoInteractivo } from '@/components/ensayo-interactivo';

export default function PaesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground">Módulo de Preparación PAES</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                Selecciona un módulo de competencia (M1 o M2), elige el número de preguntas y pon a prueba tus conocimientos para la Prueba de Acceso a la Educación Superior.
            </p>
        </div>

        <EnsayoInteractivo />

      </main>
    </div>
  );
}
