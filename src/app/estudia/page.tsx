'use client'

import Header from '@/components/header';

export default function EstudiaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Bienvenido a tu espacio de estudio</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Pronto construiremos aquí una nueva funcionalidad.
        </p>
      </main>
    </div>
  );
}
