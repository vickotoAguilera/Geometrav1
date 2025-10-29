import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src', 'content', 'estudia');

export async function getPostBySlug(slug: string[] | string) {
  const slugArray = Array.isArray(slug) ? slug : [slug];
  const filePath = path.join(postsDirectory, ...slugArray) + '.md';
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug: slugArray.join('/'),
    contentHtml,
    ...(data as { title: string; description: string }),
  };
}

export async function getAllPostsByCourse() {
    const courses = fs.readdirSync(postsDirectory).filter(file => 
        fs.statSync(path.join(postsDirectory, file)).isDirectory()
    );

    const allPosts = await Promise.all(
        courses.map(async course => {
            const coursePath = path.join(postsDirectory, course);
            const filenames = fs.readdirSync(coursePath);

            const posts = await Promise.all(
                filenames.map(async (filename) => {
                    const slug = filename.replace(/\.md$/, '');
                    const postData = await getPostBySlug([course, slug]);
                    return {
                        slug: `${course}/${slug}`,
                        title: postData?.title,
                        description: postData?.description,
                    };
                })
            );

            return {
                course: course.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                posts
            };
        })
    );

    return allPosts;
}
