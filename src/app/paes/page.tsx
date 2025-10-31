import Header from '@/components/header';

export default function PaesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground">Módulo de Preparación PAES</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                Este es un nuevo ambiente dedicado a tu preparación para la Prueba de Acceso a la Educación Superior. ¡Próximamente con contenido especializado!
            </p>
        </div>

        {/* Aquí construiremos el nuevo componente para la PAES */}
        <div className="p-8 border-2 border-dashed rounded-lg text-center bg-card">
            <p className="text-muted-foreground">
                Contenido del módulo PAES en construcción.
            </p>
        </div>

      </main>
    </div>
  );
}
