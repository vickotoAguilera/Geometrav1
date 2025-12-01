# Bitácora de Implementación: Tutores Contextuales de GeoGebra

Este documento detalla el proceso de desarrollo e implementación de los dos nuevos asistentes de IA para la sección de "Funciones y Matrices", incluyendo los desafíos encontrados y cómo se resolvieron.

## 1. Visión General del Plan

El objetivo era transformar la página de ejercicios de trigonometría en una experiencia interactiva, creando dos tutores especializados:

1.  **Tutor de GeoGebra (`funciones-chat-assistant.tsx`)**: Un asistente que guía al usuario paso a paso para resolver un problema directamente en la pizarra interactiva de GeoGebra. Su conversación es temporal y está vinculada a un ejercicio específico.
2.  **Tutor Teórico (`tutor-teorico-chat.tsx`)**: Un asistente que aparece en la misma página del ejercicio y guía al usuario en la resolución "a mano" del problema, enfocándose en el razonamiento conceptual y el uso de la calculadora.

## 2. Proceso de Implementación y Depuración

La implementación se realizó en varios pasos, encontrando y solucionando problemas en el camino.

### Paso 1: Creación de la Estructura Base y Navegación

-   Se creó el componente interactivo `ejercicio-interactivo.tsx` para reemplazar las soluciones estáticas.
-   Se implementó la navegación desde el botón "Resolver con Tutor de GeoGebra" hacia la página del applet contextual (`/applet-contextual`), pasando el ID del ejercicio y del grupo como parámetros en la URL.

### Paso 2: El Desafío de las Imágenes en las Guías

El primer gran problema surgió al intentar mostrar las imágenes de apoyo en las guías de GeoGebra.

-   **Error Inicial (`URI malformed`)**: El componente intentaba decodificar rutas de archivo que contenían espacios, lo que causaba un error de ejecución.
    -   **Solución Fallida #1**: Intenté corregir la ruta en el código, pero el problema de fondo era otro.
-   **Problema de Acceso a Archivos (404 Not Found)**: Descubrimos que Next.js no podía acceder a las imágenes porque no estaban en una carpeta pública.
    -   **Solución Fallida #2**: Intenté modificar la configuración de Next.js (`next.config.ts`) para que reconociera la carpeta. Esto no funcionó porque no es la manera estándar en que Next.js maneja archivos estáticos.
    -   **Solución Correcta**:
        1.  Creamos la carpeta `public` en la raíz del proyecto.
        2.  Movimos todas las imágenes a `public/imagenes-ejercicios/`.
        3.  Corregimos las rutas en los archivos `.md` para que apuntaran a la nueva ubicación pública (ej: `/imagenes-ejercicios/...`).

### Paso 3: El Desafío del Video Incrustado

El siguiente obstáculo fue hacer que el video de YouTube apareciera en la guía de la calculadora.

-   **Error Inicial (No se ve nada)**: Añadí el código `<iframe>` de YouTube al archivo `.md`, pero en la página solo aparecía el texto "Video de Apoyo".
    -   **Diagnóstico**: El procesador de Markdown, por seguridad, estaba eliminando la etiqueta `<iframe>`.
    -   **Solución Correcta**: Modifiqué el componente `ejercicio-interactivo.tsx` para incluir el plugin `rehype-raw`. Este plugin le indica explícitamente al procesador que debe confiar y renderizar el HTML (como el `<iframe>`) que encuentra dentro del archivo Markdown.

## 3. Resultado Final

Tras estos ajustes, logramos una implementación exitosa:

-   La página de ejercicios ahora es interactiva.
-   El tutor de GeoGebra se activa en una pizarra contextual, listo para guiar al usuario.
-   El tutor teórico aparece directamente en la página del ejercicio.
-   Las guías de apoyo ahora muestran correctamente tanto las **imágenes** (a través de un botón) como los **videos incrustados**, creando una experiencia de aprendizaje mucho más rica y funcional.

Este proceso de depuración, aunque tuvo varios pasos, fue clave para entender las particularidades de Next.js y el renderizado de contenido dinámico, resultando en una solución robusta y correcta.
