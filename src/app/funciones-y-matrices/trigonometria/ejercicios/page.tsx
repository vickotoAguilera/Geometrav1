import Header from "@/components/header";

export default function EjerciciosTrigonometriaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">Ejercicios de Trigonometría</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Aplica los conceptos aprendidos para resolver los siguientes problemas.
          </p>
        </div>
        
        {/* El contenido interactivo del módulo se añadirá aquí */}
        <div className="max-w-4xl mx-auto space-y-8">
          
        </div>

      </main>
    </div>
  );
}
