import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ejerciciosDirectory = path.join(process.cwd(), 'src', 'content', 'ejercicios');

export type Ejercicio = {
  slug: string;
  title: string;
  content: string;
};

export type EjercicioPorCurso = {
  course: string;
  label: string;
  ejercicios: Ejercicio[];
}

export function getEjercicioBySlug(course: string, slug: string): Ejercicio | null {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(ejerciciosDirectory, course, `${realSlug}.md`);
  
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

export function getAllEjercicios(): EjercicioPorCurso[] {
    if (!fs.existsSync(ejerciciosDirectory)) {
        return [];
    }
    
    const courseOrder = ["primero-medio", "segundo-medio", "tercero-medio", "cuarto-medio"];
    const courseLabels: { [key: string]: string } = {
        "primero-medio": "1M",
        "segundo-medio": "2M",
        "tercero-medio": "3M",
        "cuarto-medio": "4M"
    };

    const courseDirs = fs.readdirSync(ejerciciosDirectory).filter(file => 
        fs.statSync(path.join(ejerciciosDirectory, file)).isDirectory()
    );

    const sortedCourses = courseDirs.sort((a, b) => {
        const indexA = courseOrder.indexOf(a);
        const indexB = courseOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const ejerciciosPorCurso = sortedCourses.map(course => {
        const coursePath = path.join(ejerciciosDirectory, course);
        const filenames = fs.readdirSync(coursePath);

        const ejercicios = filenames
            .map((filename) => getEjercicioBySlug(course, filename))
            .filter((ejercicio): ejercicio is Ejercicio => ejercicio !== null);

        return {
            course: course,
            label: courseLabels[course] || course,
            ejercicios: ejercicios
        };
    });

    // Asegurarse de que todos los cursos estén presentes aunque no tengan ejercicios
    const finalResult = courseOrder.map(courseName => {
        const existingCourse = ejerciciosPorCurso.find(c => c.course === courseName);
        if (existingCourse) {
            return existingCourse;
        }
        return {
            course: courseName,
            label: courseLabels[courseName],
            ejercicios: []
        };
    });


    return finalResult;
}
