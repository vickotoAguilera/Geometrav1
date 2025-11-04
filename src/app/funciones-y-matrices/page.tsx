import Header from '@/components/header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function FuncionesYMatricesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground">Funciones y Matrices</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                Bienvenido al nuevo módulo de Funciones y Matrices. Aquí podrás explorar conceptos y herramientas interactivas.
            </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Link href="/funciones-y-matrices/ejercicios" passHref>
            <Button variant="outline" className="w-full justify-between h-16 text-lg">
              <BookOpen className="mr-3"/>
              Ejercicios Interactivos
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

      </main>
    </div>
  );
}
