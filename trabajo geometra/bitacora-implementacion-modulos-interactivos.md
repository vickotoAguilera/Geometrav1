# Bitácora de Implementación: Hacia Módulos Interactivos Robustos

Este documento detalla el análisis de los intentos fallidos y la arquitectura de la solución definitiva para crear módulos de ejercicios que sean tanto interactivos para el usuario como contextuales para los diferentes asistentes de IA.

## 1. El Problema: El Conflicto entre Markdown y React

Nuestros intentos anteriores fallaron por una razón fundamental: **intentamos forzar a dos tecnologías con propósitos diferentes a trabajar juntas de una manera para la que no están diseñadas.**

-   **Markdown (`.md`)**: Es excelente para contenido estático (texto, imágenes). Nuestro sistema lo procesa y lo convierte en HTML.
-   **React (`.tsx`)**: Es excelente para contenido dinámico e interactivo (componentes con estado, botones, campos de entrada).

**El error principal fue tratar de "inyectar" componentes interactivos de React (como las tablas con inputs) dentro de un bloque de contenido que se estaba generando a partir de un archivo Markdown.**

Esto generó una cadena de problemas:
1.  **Conflictos de Renderizado:** El motor que convierte Markdown a HTML no sabe qué hacer con un componente de React. Esto causaba que las tablas interactivas no aparecieran o rompieran la página.
2.  **Dificultad para Pasar Datos:** Era muy complejo hacer que el componente interactivo (la tabla) se comunicara con la IA y con el resto de la página, ya que vivía en un "mundo" diferente al del Markdown renderizado.
3.  **Complejidad Innecesaria:** Intentar parchear esta incompatibilidad nos llevó a soluciones cada vez más complicadas y frágiles, como se vio en los errores de renderizado y lógica.

## 2. La Solución Definitiva: Separación de Responsabilidades

Tu propuesta de "si no puedes, úneteles" y de reestructurar todo desde cero nos llevó a la arquitectura correcta, que se basa en un principio clave de la buena ingeniería de software: **la separación de responsabilidades.**

El nuevo plan, que implementaremos a continuación, es el siguiente:

### a) La Interfaz de Usuario (UI) es 100% React

-   **Responsabilidad:** Mostrar el contenido al usuario y gestionar la interactividad.
-   **Implementación:** El componente `ejercicio-interactivo.tsx` (o un nuevo componente específico para cada módulo) se construirá **enteramente en React (JSX)**. No leerá ni renderizará ningún archivo Markdown.
-   Contendrá directamente el texto de las preguntas, las imágenes (usando `<MarkdownImage />`), los campos de entrada (`<Input>`) y los botones de verificación.
-   **Ventaja:** Control total sobre el diseño, el estado y la lógica de cada elemento interactivo sin conflictos.

### b) Los Archivos Markdown (`.md`) son 100% para la IA

-   **Responsabilidad:** Servir como la "base de conocimiento" o el "libro de consulta" para los asistentes de IA.
-   **Implementación:** Crearemos una estructura de carpetas dedicada para cada módulo de ejercicio (ej. `src/content/guias-geogebra/la-rampa/`). Dentro de ella, habrá dos subcarpetas:
    -   `tutor-calculadora/`: Con archivos `.md` para cada actividad, conteniendo el texto y las **respuestas correctas** que solo esta IA debe conocer.
    -   `tutor-geogebra/`: Con archivos `.md` que contienen las instrucciones de construcción y los comandos de GeoGebra que solo este tutor debe conocer.
-   **Ventaja:** Cada IA tiene su propia fuente de verdad, eliminando la posibilidad de que mezclen contextos (el tutor de calculadora no hablará de GeoGebra y viceversa). El sistema de contexto acumulativo seguirá funcionando, ya que el chat podrá cargar progresivamente estos archivos.

### c) El Componente de Chat Teórico será Plegable

-   Para resolver el problema de usabilidad, el componente del chat del tutor teórico (`tutor-teorico-chat.tsx`) se implementará dentro de un `Accordion` o un `Collapsible`. Esto permitirá al usuario mostrarlo u ocultarlo a voluntad, evitando que tape el contenido del ejercicio.

Esta nueva arquitectura es más limpia, más escalable y soluciona de raíz todos los problemas que enfrentamos. Separa perfectamente lo que el **usuario ve y hace** (React) de lo que la **IA sabe y piensa** (Markdown).