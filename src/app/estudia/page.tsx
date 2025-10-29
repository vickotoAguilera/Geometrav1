'use server'

import Header from '@/components/header';
import Link from 'next/link';
import { getAllPostsByCourse } from '@/lib/estudia';

export default async function EstudiaPage() {
  const allPostsByCourse = await getAllPostsByCourse();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Bienvenido a tu espacio de estudio</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Explora los temas disponibles, aprende a tu ritmo y prepárate para el éxito. Cada tema está diseñado para ser claro y conciso.
        </p>

        <div className="mt-12 space-y-12">
          {allPostsByCourse.length > 0 ? (
            allPostsByCourse.map(({ course, posts }) => (
              <section key={course}>
                <h2 className="text-3xl font-bold text-primary-foreground/80 border-b border-border pb-2 mb-6">{course}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(posts as { slug: string; title?: string; description?: string }[]).map(topic => (
                    <Link href={`/estudia/${topic.slug}`} key={topic.slug} passHref>
                      <div className="block h-full p-6 bg-card rounded-lg border shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer">
                        <h3 className="text-xl font-semibold text-primary-foreground/90">{topic.title || 'Tema sin título'}</h3>
                        <p className="text-muted-foreground mt-2">{topic.description || 'Sin descripción.'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
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
