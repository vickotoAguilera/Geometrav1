import Header from '@/components/header';
import { StudyChatAssistant } from '@/components/study-chat-assistant';

export default function EstudiaConGeogebraPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary-foreground/90">Estudia con GeoGebra y la IA</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Usa este espacio para obtener ayuda de una IA especializada. Pega el material que estás estudiando en la caja de contexto y haz tus preguntas. La conversación es privada y temporal.
            </p>
        </div>
        
        <StudyChatAssistant />

      </main>
    </div>
  );
}
