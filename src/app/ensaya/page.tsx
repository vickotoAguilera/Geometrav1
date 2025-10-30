import Header from '@/components/header';

export default function EnsayaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground">Ensaya para tus pruebas con el Geometra</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                Aquí podrás practicar con pruebas de selección múltiple generadas por IA y recibir retroalimentación personalizada.
            </p>
        </div>

        <div className="mt-12 text-center">
            <p className="text-muted-foreground">Próximamente...</p>
        </div>
      </main>
    </div>
  );
}
