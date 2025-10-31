
export const DOCUMENTACION = `
# Documentación del Proyecto: Geometra

Este documento proporciona una visión general completa del proyecto Geometra, su estructura, tecnologías y el propósito de cada componente clave.

## 1. Visión General del Proyecto

**Geometra** es una plataforma educativa interactiva diseñada para ayudar a los estudiantes a aprender y practicar matemáticas, con un enfoque especial en GeoGebra. La aplicación combina materiales de estudio, un applet interactivo, un glosario, tutoriales y, lo más importante, un asistente de IA experto que actúa como tutor personal.

## 2. Tecnologías Utilizadas

- **Frontend**: Next.js, React, ShadCN/UI, Tailwind CSS, Lucide React.
- **Backend e IA**: Firebase (Autenticación y Firestore), Genkit.
- **Contenido**: Markdown (.md).

## 3. Estructura de Archivos y Páginas

- **/ (Página de Inicio)**: Presenta las secciones de la aplicación.
- **/applet (Pizarra Interactiva)**: Contiene el applet de GeoGebra a pantalla completa.
- **/estudia**: Muestra una lista de temas de estudio desde archivos Markdown.
- **/estudia-con-geogebra**: Sección con un chat de IA temporal enfocado en ejercicios específicos.
- **/ensaya**: Módulo para generar pruebas de matemáticas personalizadas con IA.
- **/paes**: Módulo para generar pruebas PAES de matemáticas (M1 y M2).
- **/glosario**: Explica comandos y funciones de GeoGebra.
- **/tutoriales**: Guías paso a paso para tareas comunes en GeoGebra.

## 4. Componentes Principales

- **header.tsx**: Barra de navegación superior con acceso al chat de IA y sesión de usuario.
- **chat-assistant.tsx**: Panel del asistente de IA principal, con historial en Firestore y capacidad para adjuntar archivos.
- **study-chat-assistant.tsx**: Variante del chat para la sección de estudio, con conversación temporal.
- **ensayo-interactivo.tsx**: Interfaz para generar y realizar pruebas generales.
- **paes-interactivo.tsx**: Interfaz para generar y realizar pruebas PAES.
- **geogebra-applet.tsx**: Componente que carga el applet de GeoGebra.

## 5. Flujos de IA (Genkit)

- **math-assistant.ts**: Define el comportamiento del tutor de IA principal.
- **study-assistant.ts**: IA especializada para la sección de estudio, limitada al material proporcionado.
- **generador-pruebas-flow.ts**: Genera pruebas de matemáticas generales.
- **generador-paes-flow.ts**: Genera pruebas PAES M1 y M2.
- **retroalimentacion-ia-flow.ts**: Evalúa las respuestas de las pruebas generales.
- **retroalimentacion-paes-flow.ts**: Evalúa las respuestas de las pruebas PAES.
`;

export const DOCUMENTACION_COMPLETA = `
# Documentación Completa del Proyecto: Geometra

## 1. Propósito y Uso Educativo

**Geometra** es una plataforma educativa interactiva diseñada para **ayudar a los estudiantes a aprender y practicar matemáticas, con un enfoque especial en GeoGebra.** Se enfoca en estudiantes de enseñanza media y superior, combinando materiales de estudio, un applet interactivo, y un ecosistema de asistentes de IA que actúan como tutores personales.

## 2. Tecnologías Utilizadas

- **Frontend**: Next.js, React, ShadCN/UI, Tailwind CSS, Lucide React.
- **Backend e IA**: Firebase (Autenticación y Firestore), Genkit.
- **Interacción por Voz**: Modelo de IA de Google para Texto a Voz (TTS) y Web Speech API para Voz a Texto (STT).
- **Contenido**: Markdown (.md).

## 3. Estructura de Páginas (Rutas)

- \`/\` (Página de Inicio): Puerta de entrada con tarjetas de navegación a todas las secciones.
- \`/applet/page.tsx\` (Pizarra Interactiva): Applet de GeoGebra a pantalla completa para experimentación libre.
- \`/estudia/\`: Lista de cursos y temas de estudio. Las rutas dinámicas (\`[...slug]/page.tsx\`) muestran el contenido de cada tema.
- \`/estudia-con-geogebra/page.tsx\`: Sección con un chat de IA temporal enfocado en ayudar con ejercicios seleccionados de PDFs transcritos.
- \`/ensaya/page.tsx\`: Módulo para generar pruebas de matemáticas personalizadas (tema, cantidad y tipo de preguntas).
- \`/paes/page.tsx\`: Módulo para generar pruebas PAES de matemáticas M1 y M2 en lotes.
- \`/glosario/page.tsx\`: Página de referencia que explica los comandos de GeoGebra.
- \`/tutoriales/page.tsx\`: Guías paso a paso para tareas comunes en GeoGebra.

## 4. Componentes Reutilizables

- \`header.tsx\`: Barra de navegación superior. Oculta el asistente principal en ciertas páginas para evitar redundancia.
- \`chat-assistant.tsx\`: Panel del **Asistente Principal**. Gestiona la conversación, el historial de Firestore, la subida de archivos y las funciones de voz (TTS/STT).
- \`study-chat-assistant.tsx\`: Variante del chat para \`/estudia-con-geogebra\`. La conversación es temporal y también incluye funciones de voz.
- \`ensayo-interactivo.tsx\`: Interfaz para el módulo de pruebas generales, con carga progresiva de preguntas.
- \`paes-interactivo.tsx\`: Interfaz para el módulo de pruebas PAES, también con carga progresiva.
- \`geogebra-applet.tsx\`: Componente que carga el applet de GeoGebra.

## 5. Flujos de Inteligencia Artificial (Genkit)

- \`/flows/math-assistant.ts\`: **IA PRINCIPAL**. Tutor general de matemáticas y GeoGebra. Su conocimiento es abierto y se basa en el historial de chat y los archivos que el usuario adjunta.
- \`/flows/study-assistant.ts\`: **IA DE APOYO (ESTUDIO)**. Su conocimiento está restringido al material de estudio que el usuario selecciona.
- \`/flows/generador-pruebas-flow.ts\`: **IA DE APOYO (GENERADOR PRUEBAS)**. Crea preguntas de matemáticas generales según un tema.
- \`/flows/retroalimentacion-ia-flow.ts\`: **IA DE APOYO (EVALUADOR PRUEBAS)**. Revisa las respuestas del usuario y explica los errores.
- \`/flows/generador-paes-flow.ts\`: **IA DE APOYO (GENERADOR PAES)**. Crea preguntas de ensayos PAES M1 y M2 en lotes de 5, basándose en temarios oficiales.
- \`/flows/retroalimentacion-paes-flow.ts\`: **IA DE APOYO (EVALUADOR PAES)**. Evalúa las respuestas del ensayo PAES con explicaciones estilo DEMRE.
- \`/flows/tts-flow.ts\`: **IA DE APOYO (TEXTO A VOZ)**. Convierte el texto de las respuestas del asistente en audio.
`;
