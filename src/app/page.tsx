import { ChatAssistant } from '@/components/chat-assistant';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex-1">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col justify-center text-center lg:text-left">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            Bienvenido a <span className="text-primary">Geo</span>metra
          </h1>
          <p className="mt-4 max-w-xl mx-auto lg:mx-0 text-lg text-muted-foreground">
            Desbloquea tu potencial matemático. Haz preguntas, resuelve problemas
            y explora conceptos con tu asistente de IA personal y nuestro applet
            interactivo de GeoGebra.
          </p>
        </div>
        <div className="w-full max-w-lg mx-auto lg:max-w-none">
          <ChatAssistant />
        </div>
      </div>
    </div>
  );
}
