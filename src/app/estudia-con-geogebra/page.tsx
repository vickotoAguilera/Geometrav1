import Header from '@/components/header';

export default function EstudiaConGeogebraPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Bienvenido a Estudia con GeoGebra</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Aquí encontrarás lecciones interactivas que combinan la teoría con la práctica en GeoGebra.
        </p>
        <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center bg-card">
            <p className="text-muted-foreground">
                El contenido interactivo se implementará aquí.
            </p>
        </div>
      </main>
    </div>
  );
}
