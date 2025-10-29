'use client'

import Header from '@/components/header';

export default function EjerciciosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Analiza tus documentos con la IA</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Para analizar un ejercicio, guía o cualquier documento, simplemente copia el texto del documento y pégalo en el chat del asistente de IA.
        </p>
        <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center bg-card">
            <p className="text-muted-foreground">
                Abre el asistente de IA y pega el contenido de tu documento para obtener ayuda.
            </p>
        </div>
      </main>
    </div>
  );
}
