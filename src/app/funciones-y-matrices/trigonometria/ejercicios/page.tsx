
import Header from '@/components/header';

export default function EjerciciosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground">Página de Ejercicios</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                ¡Bienvenido a la nueva sección de ejercicios! Aquí encontrarás actividades interactivas para poner a prueba tus conocimientos.
            </p>
        </div>
        
        {/* Aquí se añadirán los componentes de los ejercicios más adelante */}
        <div className="max-w-4xl mx-auto p-8 border-2 border-dashed rounded-lg text-center bg-card">
            <p className="text-muted-foreground">
                Próximamente: Módulos de ejercicios interactivos.
            </p>
        </div>

      </main>
    </div>
  );
}
