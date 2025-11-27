import { getPostBySlug } from '@/lib/estudia';
import Header from '@/components/header';
import StudyPageClient from '@/components/StudyPageClient';
import { notFound } from 'next/navigation';

export default async function StudyTopicPage({ params }: { params: { slug: string[] } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Create unique topic ID from slug
  const temaId = params.slug.join('/');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <StudyPageClient
          temaId={temaId}
          temaNombre={post.title}
          contentHtml={post.contentHtml}
        />
      </main>
    </div>
  );
}
