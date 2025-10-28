import Header from '@/components/header';

export default function TutorialesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Aprende GeoGebra (Tutoriales)</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Explora nuestras guías interactivas, diseñadas para llevarte desde los conceptos más básicos hasta las funciones más avanzadas de GeoGebra.
        </p>
        <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center bg-card">
            <p className="text-muted-foreground">
                La lista de tutoriales se mostrará aquí.
            </p>
        </div>
      </main>
    </div>
  );
}