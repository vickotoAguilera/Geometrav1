# Historia del Proyecto Geometra: De la Idea a la Realidad

## 1. Inicios: La Identificación del Problema
El proyecto "Geometra" nació de una observación crítica en el aula y en el estudio personal: la soledad del aprendizaje matemático.
- **Problemática Detectada**: Herramientas como GeoGebra son excelentes para graficar, pero carecen de una guía pedagógica. Si un estudiante comete un error al graficar una función en casa, la herramienta no le explica *por qué* se equivocó.
- **Visión**: Crear un "Tutor Inteligente" que no solo grafique, sino que entienda el contexto del estudiante y ofrezca retroalimentación formativa en tiempo real.

## 2. Etapa 1: Definición y Diseño (ABPro 1)
En esta primera etapa, el equipo (Oscar, Félix, Víctor) definió los cimientos del proyecto.
- **Investigación**: Se analizaron los Objetivos de Aprendizaje (OA) del Ministerio de Educación (Mineduc) para 1° Medio, enfocándose en Funciones y Geometría.
- **Diseño de la Solución**: Se esbozó una aplicación web que integrara:
    - Una interfaz amigable (UX/UI) para reducir la ansiedad matemática.
    - Un sistema de visualización gráfica.
    - Un componente de Inteligencia Artificial para la asistencia.
- **Roles**:
    - **Oscar**: Investigación pedagógica y contexto.
    - **Félix**: Diseño de experiencia de usuario (UX) y maquetación.
    - **Víctor**: Arquitectura técnica y desarrollo backend.

## 3. Etapa 2: Desarrollo del Prototipo y Lógica (ABPro 2)
Aquí se comenzó la construcción real del software, enfrentando desafíos técnicos significativos.
- **Tecnologías Seleccionadas**:
    - **Frontend**: Next.js (React) para una interfaz moderna y reactiva.
    - **Estilos**: Tailwind CSS para un diseño adaptable y limpio.
    - **Backend/Base de Datos**: Firebase (Firestore) para la persistencia de datos en tiempo real.
- **Hitos de Desarrollo**:
    - **Creación de la Página Principal**: Se implementó una landing page atractiva para captar la atención del estudiante.
    - **Sistema de Autenticación**: Integración de Google Auth para facilitar el acceso.
    - **Módulo de Ejercicios**: Desarrollo de la primera versión de ejercicios interactivos de funciones.
- **Incorporación de Feedback Docente**: Siguiendo las indicaciones de la profesora Pamela, se refinó la justificación pedagógica, alineándola con la "Reactivación Educativa" y la importancia de la retroalimentación oportuna.

## 4. Etapa 3: Implementación Avanzada y Refinamiento (Actualidad)
La etapa actual se centra en la inteligencia y la robustez del sistema.
- **Integración de IA (Gemini)**: Se conectó la API de Google Gemini para analizar las respuestas de los estudiantes y generar pistas contextuales.
- **Desafío Técnico (CORS y R2)**: Uno de los mayores retos fue la gestión de archivos. Al intentar leer PDFs subidos por usuarios, nos enfrentamos a bloqueos de seguridad (CORS).
    - **Solución**: Implementamos un sistema de almacenamiento en Cloudflare R2 y un procesador de texto en el navegador (`fileContext`), permitiendo que la IA "lea" los guías de estudio del alumno sin violar políticas de seguridad.
- **Matemáticas en el Código**:
    - **Vectores y Transformaciones**: Utilizamos conceptos de álgebra lineal (vectores, matrices de transformación) no solo en los ejercicios de matemáticas, sino en la propia construcción de la interfaz (ej. componentes SVG como `LaRampaSVG` que usan rotación y traslación).
    - **Homotecia en UX**: Aplicamos el concepto de homotecia (escalado proporcional) para hacer que la aplicación sea "Responsive", adaptándose matemáticamente a pantallas de celulares y computadores.

## 5. Estado Actual
Hoy, Geometra es una aplicación web funcional (`geometra.vercel.app`) capaz de:
1.  Autenticar usuarios y guardar su progreso.
2.  Presentar ejercicios curriculares alineados al Mineduc.
3.  Ofrecer retroalimentación inteligente y personalizada.
4.  Visualizar conceptos matemáticos dinámicamente.

Este recorrido demuestra cómo una necesidad educativa se transformó, a través de la ingeniería de software y la pedagogía, en una solución tecnológica concreta.
