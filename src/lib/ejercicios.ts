import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ejerciciosDirectory = path.join(process.cwd(), 'src', 'content', 'ejercicios');

export type Ejercicio = {
  slug: string;
  title: string;
  content: string;
};

export function getEjercicioBySlug(slug: string): Ejercicio | null {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(ejerciciosDirectory, `${realSlug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    title: data.title || realSlug,
    content: content,
  };
}

export function getAllEjercicios(): Ejercicio[] {
    if (!fs.existsSync(ejerciciosDirectory)) {
        return [];
    }
    const filenames = fs.readdirSync(ejerciciosDirectory);

    const ejercicios = filenames
        .map((filename) => getEjercicioBySlug(filename))
        .filter((ejercicio): ejercicio is Ejercicio => ejercicio !== null);

    return ejercicios;
}
