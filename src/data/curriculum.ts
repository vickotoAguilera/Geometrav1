// Estructura del currículum basado en el contenido real de /estudia

export interface Subject {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export interface Grade {
    id: string;
    name: string;
    subjects: Subject[];
}

// Currículum de 1° a 4° Medio (basado en contenido real)
export const curriculum: Grade[] = [
    {
        id: 'primero-medio',
        name: '1° Medio',
        subjects: [
            { id: 'ecuaciones-lineales', name: 'Ecuaciones Lineales', icon: '🔢', description: 'Resolución de ecuaciones de primer grado' },
            { id: 'factorizacion', name: 'Factorización', icon: '✂️', description: 'Técnicas de factorización algebraica' },
            { id: 'homotecia', name: 'Homotecia', icon: '📏', description: 'Transformaciones geométricas' },
            { id: 'medidas-de-tendencia-central', name: 'Medidas de Tendencia Central', icon: '📊', description: 'Media, mediana y moda' },
            { id: 'numeros-reales', name: 'Números Reales', icon: '🔢', description: 'Propiedades de los números reales' },
            { id: 'potencias-y-raices', name: 'Potencias y Raíces', icon: '²√', description: 'Operaciones con potencias y raíces' },
            { id: 'probabilidad-basica', name: 'Probabilidad Básica', icon: '🎲', description: 'Conceptos fundamentales de probabilidad' },
            { id: 'productos-notables', name: 'Productos Notables', icon: '✖️', description: 'Binomios y trinomios especiales' },
            { id: 'semejanza-triangulos', name: 'Semejanza de Triángulos', icon: '📐', description: 'Criterios de semejanza' },
            { id: 'sistemas-ecuaciones-lineales', name: 'Sistemas de Ecuaciones Lineales', icon: '🔢', description: 'Métodos de resolución de sistemas' },
            { id: 'transformaciones-isometricas', name: 'Transformaciones Isométricas', icon: '🔄', description: 'Traslación, rotación, reflexión' },
            { id: 'vectores-en-el-plano', name: 'Vectores en el Plano', icon: '➡️', description: 'Operaciones con vectores' },
        ],
    },
    {
        id: 'segundo-medio',
        name: '2° Medio',
        subjects: [
            { id: 'funcion-cuadratica', name: 'Función Cuadrática', icon: '📈', description: 'Parábolas y ecuaciones cuadráticas' },
            { id: 'funcion-lineal', name: 'Función Lineal', icon: '📉', description: 'Rectas y pendientes' },
            { id: 'logaritmos', name: 'Logaritmos', icon: 'log', description: 'Propiedades y aplicaciones de logaritmos' },
            { id: 'numeros-irracionales', name: 'Números Irracionales', icon: 'π', description: 'Números no racionales' },
            { id: 'potencias-exponente-racional', name: 'Potencias con Exponente Racional', icon: '²√', description: 'Radicales y exponentes fraccionarios' },
            { id: 'probabilidad-condicional', name: 'Probabilidad Condicional', icon: '🎲', description: 'Eventos dependientes e independientes' },
            { id: 'raices-propiedades', name: 'Raíces y Propiedades', icon: '√', description: 'Operaciones con radicales' },
            { id: 'sectores-circulares', name: 'Sectores Circulares', icon: '⭕', description: 'Arcos y sectores de círculos' },
            { id: 'trigonometria', name: 'Trigonometría', icon: '📏', description: 'Razones trigonométricas' },
        ],
    },
    {
        id: 'tercero-medio',
        name: '3° Medio',
        subjects: [
            { id: 'ecuacion-de-la-recta', name: 'Ecuación de la Recta', icon: '📐', description: 'Formas de la ecuación de la recta' },
            { id: 'estadistica-inferencial', name: 'Estadística Inferencial', icon: '📊', description: 'Muestreo e inferencia estadística' },
            { id: 'funcion-exponencial', name: 'Función Exponencial', icon: 'eˣ', description: 'Crecimiento y decrecimiento exponencial' },
            { id: 'funcion-logaritmica', name: 'Función Logarítmica', icon: 'log', description: 'Función inversa de la exponencial' },
            { id: 'geometria-analitica', name: 'Geometría Analítica', icon: '📐', description: 'Coordenadas y ecuaciones' },
            { id: 'modelos-probabilisticos', name: 'Modelos Probabilísticos', icon: '🎲', description: 'Distribuciones de probabilidad' },
            { id: 'numeros-complejos', name: 'Números Complejos', icon: 'ℂ', description: 'Números imaginarios y complejos' },
            { id: 'relaciones-metricas-circunferencia', name: 'Relaciones Métricas en la Circunferencia', icon: '⭕', description: 'Teoremas de la circunferencia' },
        ],
    },
    {
        id: 'cuarto-medio',
        name: '4° Medio',
        subjects: [
            { id: 'distribucion-binomial', name: 'Distribución Binomial', icon: '📊', description: 'Probabilidad binomial' },
            { id: 'distribucion-normal', name: 'Distribución Normal', icon: '📈', description: 'Curva normal y aplicaciones' },
            { id: 'funciones-periodicas', name: 'Funciones Periódicas', icon: '〰️', description: 'Funciones que se repiten' },
            { id: 'funciones-trigonometricas', name: 'Funciones Trigonométricas', icon: '📏', description: 'Seno, coseno, tangente' },
            { id: 'geometria-3d', name: 'Geometría 3D', icon: '📦', description: 'Geometría del espacio' },
            { id: 'geometria-conica', name: 'Geometría Cónica', icon: '⚪', description: 'Elipse, parábola, hipérbola' },
            { id: 'matematica-financiera', name: 'Matemática Financiera', icon: '💰', description: 'Interés y capitalización' },
            { id: 'modelamiento-matematico', name: 'Modelamiento Matemático', icon: '🔬', description: 'Modelos matemáticos aplicados' },
        ],
    },
];

// Función helper para obtener un curso por ID
export function getGradeById(gradeId: string): Grade | undefined {
    return curriculum.find(g => g.id === gradeId);
}

// Función helper para obtener una materia por ID
export function getSubjectById(gradeId: string, subjectId: string): Subject | undefined {
    const grade = getGradeById(gradeId);
    return grade?.subjects.find(s => s.id === subjectId);
}

// Función helper para obtener todas las materias de un curso
export function getSubjectsByGrade(gradeId: string): Subject[] {
    const grade = getGradeById(gradeId);
    return grade?.subjects || [];
}
