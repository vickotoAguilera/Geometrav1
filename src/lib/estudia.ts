import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';


const postsDirectory = path.join(process.cwd(), 'src', 'content', 'estudia');

export async function getPostBySlug(slug: string[] | string) {
  const slugArray = Array.isArray(slug) ? slug : [slug];
  const filePath = path.join(postsDirectory, ...slugArray) + '.md';
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(content);
  const contentHtml = processedContent.toString();

  return {
    slug: slugArray.join('/'),
    contentHtml,
    ...(data as { title: string; description: string }),
  };
}

export async function getAllPostsByCourse() {
    const courseOrder = ["primero-medio", "segundo-medio", "tercero-medio", "cuarto-medio"];
    
    const courses = fs.readdirSync(postsDirectory).filter(file => 
        fs.statSync(path.join(postsDirectory, file)).isDirectory()
    );

    // Ordenar los cursos según el array courseOrder
    const sortedCourses = courses.sort((a, b) => {
        const indexA = courseOrder.indexOf(a);
        const indexB = courseOrder.indexOf(b);
        // Si un curso no está en la lista, se va al final
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const allPosts = await Promise.all(
        sortedCourses.map(async course => {
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
