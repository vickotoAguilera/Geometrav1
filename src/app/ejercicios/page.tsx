'use client'

import { UploadAnalysis } from '@/components/upload-analysis';
import Header from '@/components/header';

export default function EjerciciosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Analiza tus documentos con la IA</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Sube tus ejercicios, guías o cualquier documento en formato PDF, Word o imágenes, y deja que la IA te ayude a entenderlos y resolverlos.
        </p>
        <UploadAnalysis />
      </main>
    </div>
  );
}
