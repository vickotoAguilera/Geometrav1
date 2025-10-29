import { getPostBySlug } from '@/lib/estudia';
import Header from '@/components/header';
import { notFound } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { StudyChatAssistant } from '@/components/study-chat-assistant';


export default async function StudyTopicPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug([params.slug]);

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
       <div className="fixed bottom-8 left-8 z-50">
         <Sheet>
            <SheetTrigger asChild>
                <Button size="lg" variant="destructive" className="rounded-full h-16 w-auto px-6 shadow-lg">
                    <Bot className="h-6 w-6 mr-2" />
                    Asistente de Estudio
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] sm:h-[60vh] rounded-t-lg p-0 flex flex-col">
                <StudyChatAssistant studyMaterial={post.contentHtml} topicTitle={post.title} />
            </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

// Esta función se puede usar para generar las rutas estáticamente en tiempo de compilación
// import { getAllPosts } from '@/lib/estudia';
// export async function generateStaticParams() {
//   const posts = await getAllPosts();
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }
