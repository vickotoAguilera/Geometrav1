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
