import Header from '@/components/header';

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
        {/* Aquí se podrán añadir más componentes en el futuro */}
      </main>
    </div>
  );
}
