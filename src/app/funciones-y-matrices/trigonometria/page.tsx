import Header from '@/components/header';
import { TrigonometryConcepts } from '@/components/trigonometry-concepts';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function TrigonometriaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Conceptos de Trigonometría</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Explora las relaciones fundamentales entre los ángulos y los lados de un triángulo y en la circunferencia.
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-12">
            <Link href="/funciones-y-matrices/trigonometria/ejercicios">
                 <Button className="w-full h-16 text-lg">
                    <BookOpen className="mr-3"/>
                    Ir a la Página de Ejercicios
                </Button>
            </Link>
        </div>

        <TrigonometryConcepts />
      </main>
    </div>
  );
}
