import Header from '@/components/header';
import { TrigonometryConcepts } from '@/components/trigonometry-concepts';

export default function TrigonometriaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">Razones Trigonométricas</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Explora las relaciones fundamentales entre los ángulos y los lados de un triángulo rectángulo.
          </p>
        </div>
        <TrigonometryConcepts />
      </main>
    </div>
  );
}
