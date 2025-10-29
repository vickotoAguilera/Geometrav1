'use client'

import Header from '@/components/header';
import Link from 'next/link';

// Mock data, ya que no podemos usar fs en el cliente. 
// En una implementación real en servidor, esto se generaría dinámicamente.
const studyTopics = [
  {
    slug: 'teorema-de-pitagoras',
    title: 'Teorema de Pitágoras',
    description: 'Aprende sobre la relación fundamental en la geometría euclidiana entre los tres lados de un triángulo rectángulo.'
  }
];

export default function EstudiaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Bienvenido a tu espacio de estudio</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Explora los temas disponibles, aprende a tu ritmo y prepárate para el éxito. Cada tema está diseñado para ser claro y conciso.
        </p>

        <div className="mt-12 grid gap-6">
          {studyTopics.length > 0 ? (
            studyTopics.map(topic => (
              <Link href={`/estudia/${topic.slug}`} key={topic.slug} passHref>
                <div className="block p-6 bg-card rounded-lg border shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer">
                  <h2 className="text-2xl font-semibold text-primary-foreground/90">{topic.title}</h2>
                  <p className="text-muted-foreground mt-2">{topic.description}</p>
                </div>
              </Link>
            ))
          ) : (
             <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center bg-card">
                <p className="text-muted-foreground">
                    Aún no hay temas de estudio. ¡Vuelve pronto!
                </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
