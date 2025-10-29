import { getPostBySlug } from '@/lib/estudia';
import Header from '@/components/header';
import { notFound } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { ChatAssistant } from '@/components/chat-assistant';

export default async function StudyTopicPage({ params }: { params: { slug: string[] } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <article className="prose prose-invert lg:prose-xl max-w-none mx-auto bg-card p-8 rounded-lg">
          <h1>{post.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </article>
      </main>
       <div className="fixed bottom-8 right-8 z-50">
         <Sheet>
            <SheetTrigger asChild>
                <Button size="lg" className="rounded-full h-16 w-16">
                    <Bot className="h-8 w-8" />
                    <span className="sr-only">Abrir Asistente</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full max-w-full sm:max-w-md p-0 flex flex-col h-full">
                <ChatAssistant />
            </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
