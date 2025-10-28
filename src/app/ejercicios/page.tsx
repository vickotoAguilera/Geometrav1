import Header from '@/components/header';

export default function EjerciciosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Analiza tus documentos con la IA</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
            La funcionalidad de guardar archivos ha sido desactivada para simplificar la experiencia.
        </p>
        <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center bg-card">
            <p className="text-muted-foreground">
                Puedes adjuntar tus documentos directamente en el chat del asistente de IA para analizarlos y hacer preguntas sobre ellos durante la sesión actual.
            </p>
        </div>
      </main>
    </div>
  );
}
