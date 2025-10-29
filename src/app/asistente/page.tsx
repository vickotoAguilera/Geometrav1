
import Header from '@/components/header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { ChatAssistant } from '@/components/chat-assistant';

export default function AsistentePage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center bg-muted/20">
        <div className="text-center">
            <h1 className="text-4xl font-bold font-headline mb-4">Asistente de Mates</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Haz clic en el botón de abajo para comenzar a chatear con tu tutor de IA.
            </p>
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="lg">
                        <Bot className="mr-2 h-5 w-5" />
                        Abrir Asistente
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-full max-w-full sm:max-w-md p-0 flex flex-col h-full">
                    <ChatAssistant />
                </SheetContent>
            </Sheet>
        </div>
      </main>
    </div>
  );
}
