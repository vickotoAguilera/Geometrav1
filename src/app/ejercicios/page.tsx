import Header from '@/components/header';

export default function EjerciciosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Ejercítate con la IA</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          ¿Atascado en un problema? Sube tu archivo (PDF, Word, o una imagen) y nuestro asistente experto, Geometra, te guiará paso a paso para que lo resuelvas usando GeoGebra.
        </p>
        <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center bg-card">
            <p className="text-muted-foreground">
                El componente de chat y subida de archivos se integrará aquí.
            </p>
        </div>
      </main>
    </div>
  );
}