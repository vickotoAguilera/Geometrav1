import Link from 'next/link';
import Header from '@/components/header';
import Logo from '@/components/logo';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <Logo className="w-24 h-24 text-primary mb-6" />
        <h1 className="text-5xl font-bold font-headline mb-4 text-foreground">
          Bienvenido a Geometra
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Tu plataforma todo-en-uno para dominar las matemáticas y GeoGebra con la ayuda de un tutor de IA experto.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          
          <Link href="/applet" passHref className="group">
            <div className="w-full h-40 text-lg flex flex-col items-center justify-center p-4 rounded-lg bg-card text-card-foreground border shadow-sm hover:shadow-lg hover:border-primary transition-all">
              <span className="text-2xl mb-2">칠</span>
              <span className="font-semibold">Pizarra Interactiva</span>
              <p className="text-sm text-muted-foreground mt-1">Tu lienzo en blanco con GeoGebra.</p>
            </div>
          </Link>

          <Link href="/estudia" passHref className="group">
            <div className="w-full h-40 text-lg flex flex-col items-center justify-center p-4 rounded-lg bg-card text-card-foreground border shadow-sm hover:shadow-lg hover:border-primary transition-all">
              <span className="text-2xl mb-2">✏️</span>
              <span className="font-semibold">Estudio de enseñanza media</span>
              <p className="text-sm text-muted-foreground mt-1">Tu espacio de aprendizaje.</p>
            </div>
          </Link>

          <Link href="/tutoriales" passHref className="group">
            <div className="w-full h-40 text-lg flex flex-col items-center justify-center p-4 rounded-lg bg-card text-card-foreground border shadow-sm hover:shadow-lg hover:border-primary transition-all">
              <span className="text-2xl mb-2">📚</span>
              <span className="font-semibold">Aprende GeoGebra</span>
              <p className="text-sm text-muted-foreground mt-1">Guías paso a paso.</p>
            </div>
          </Link>

          <Link href="/glosario" passHref className="group">
            <div className="w-full h-40 text-lg flex flex-col items-center justify-center p-4 rounded-lg bg-card text-card-foreground border shadow-sm hover:shadow-lg hover:border-primary transition-all">
               <span className="text-2xl mb-2">📖</span>
               <span className="font-semibold">Glosario de Funciones</span>
               <p className="text-sm text-muted-foreground mt-1">Comandos y guías.</p>
            </div>
          </Link>
          
          <Link href="/estudia-con-geogebra" passHref className="group">
            <div className="w-full h-40 text-lg flex flex-col items-center justify-center p-4 rounded-lg bg-card text-card-foreground border shadow-sm hover:shadow-lg hover:border-primary transition-all">
               <span className="text-2xl mb-2">📐</span>
               <span className="font-semibold">Estudia con el Geometra</span>
               <p className="text-sm text-muted-foreground mt-1">Lecciones interactivas.</p>
            </div>
          </Link>

        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Geometra. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
