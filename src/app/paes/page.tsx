import Header from '@/components/header';
import { PaesInteractivo } from '@/components/paes-interactivo';

export default function PaesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground">Módulo de Preparación PAES</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                Pon a prueba tus conocimientos con ensayos de 50 preguntas para las pruebas de Competencia Matemática M1 y M2, generados por IA y con retroalimentación detallada.
            </p>
        </div>

        <PaesInteractivo />

      </main>
    </div>
  );
}
