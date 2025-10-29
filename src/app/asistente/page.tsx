
import Header from '@/components/header';
import { ChatAssistant } from '@/components/chat-assistant';

export default function AsistentePage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center bg-muted/20 pb-96">
        <h1 className="text-4xl font-bold font-headline mb-4">Asistente de Mates</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chatea con tu tutor de IA en la ventana de abajo.
        </p>
      </main>
      
      {/* Nuevo contenedor fijo para el asistente */}
      <div className="fixed bottom-0 left-0 right-0 h-96 bg-background border-t">
        <ChatAssistant />
      </div>
    </div>
  );
}
