'use client'

import Header from '@/components/header';

export default function EjerciciosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Analiza tus documentos con la IA</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Sube tus ejercicios, guías o cualquier documento a tu cuenta personal de Google Drive. Luego, comparte el enlace en el chat del asistente de IA para que pueda ayudarte a analizarlo.
        </p>
        <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center bg-card">
            <p className="text-muted-foreground">
                Abre el asistente de IA, pega el enlace a tu documento de Google Drive y obtén ayuda al instante.
            </p>
        </div>
      </main>
    </div>
  );
}
