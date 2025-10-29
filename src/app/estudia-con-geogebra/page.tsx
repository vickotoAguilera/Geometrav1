import Header from '@/components/header';
import { StudyChatAssistant } from '@/components/study-chat-assistant';
import { getAllEjercicios } from '@/lib/ejercicios';

export default async function EstudiaConGeogebraPage() {
  const ejercicios = await getAllEjercicios();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary-foreground/90">Estudia con GeoGebra y la IA</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
              Selecciona un ejercicio para darle contexto al asistente y luego haz tus preguntas. La conversación es privada y temporal.
            </p>
        </div>
        
        <StudyChatAssistant ejercicios={ejercicios} />

      </main>
    </div>
  );
}
