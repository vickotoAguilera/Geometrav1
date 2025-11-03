
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

export const PLAN_MEJORA_ARCHIVOS = `
# Plan de Mejora: Gestión de Archivos Grandes y Contexto de Imágenes

Este documento describe la estrategia para solucionar el límite de tamaño de los archivos en el chat y para permitir que la IA maneje de forma inteligente las imágenes contenidas en los documentos.

## 1. División de Archivos Grandes (Chunking)

**Objetivo:** Permitir la subida de archivos de más de 1MB sin depender de un bucket de almacenamiento.

### Lógica de Implementación:

-   **Verificación de Tamaño:** Al subir un archivo (PDF, DOCX) en el chat, el sistema primero comprobará su tamaño.
-   **División Automática:** Si el archivo supera 1MB, su contenido textual se dividirá automáticamente en "trozos" (chunks) más pequeños, cada uno por debajo del límite.
-   **Agrupación:** Cada trozo se guardará en la base de datos (Firestore) como un documento independiente, pero todos compartirán un **identificador de grupo único** y un número de parte (ej: \`MiArchivo.pdf - Parte 1/4\`).
-   **Interfaz de Usuario Unificada:** En la sección "Contexto de Archivos" del chat, estos trozos se mostrarán como **un solo elemento agrupado**. Un solo interruptor (\`Switch\`) activará o desactivará todos los trozos enlazados a la vez, garantizando que la IA siempre reciba el contexto completo o ninguno.

## 2. Manejo Inteligente de Imágenes en Documentos

**Objetivo:** Hacer que la IA sea consciente de las imágenes dentro de los documentos y pueda solicitar al usuario que las suba para un análisis más profundo.

### Lógica de Implementación:

-   **Detección de Imágenes:** Durante el procesamiento del documento (al subirlo), el sistema detectará la presencia de imágenes. No las "verá", pero reemplazará cada una con un marcador de texto especial. Por ejemplo: \`[IMAGEN: ID_IMG_01 - Referente a la pregunta 4 de la página 8]\`.
-   **Instrucción a la IA:** Se modificará el "cerebro" de la IA (\`math-assistant.ts\`) para que, cuando encuentre uno de estos marcadores, reaccione de una forma específica.
-   **Interacción con el Usuario:** En lugar de ignorar la imagen, la IA dirá algo como:
    > "Veo que la pregunta 4 de la página 8 está ligada a una imagen. Si quieres que la analice para darte una mejor explicación, puedes adjuntarla en este chat. Si no lo necesitas, puedo explicarte la pregunta sin el contexto visual."
-   **Enlace Contextual:** Si el usuario decide subir la imagen, la aplicación la asociará internamente con el marcador \`ID_IMG_01\`. De esta manera, cuando se le vuelva a preguntar por ese tema, la IA sabrá que ya tiene la imagen y podrá analizarla junto con el texto.

## Archivos a Modificar

1.  **\`src/components/chat-assistant.tsx\`**: Para implementar la lógica de división de archivos (chunking) y la gestión de la interfaz de usuario para los archivos agrupados.
2.  **\`src/ai/flows/math-assistant.ts\`**: Para actualizar las instrucciones del "System Prompt" de la IA y enseñarle a manejar los marcadores de imagen y a interactuar con el usuario para solicitarlas.

---

## Bitácora de Implementación y Solución de Errores

Esta sección documenta el proceso que seguimos para llegar a la solución final.

### **Problema Inicial: Límite de Subida de Archivos**

El primer gran obstáculo fue el error \`TypeError: fetch failed\` al intentar subir archivos. Nuestra primera idea fue usar una Cloud Function como intermediario para subir los archivos a un bucket de almacenamiento.

-   **Error #1: \`fetch failed\`**. Ocurrió porque la Server Action (backend) no podía llamar a una URL \`localhost\` de la Cloud Function que se ejecutaba localmente.
-   **Error #2: \`Module not found: firebase-functions\`**. Ocurrió cuando intentamos importar directamente la lógica de la Cloud Function a la Server Action. El entorno de Next.js no tiene las dependencias del backend de Firebase.

### **Cambio de Estrategia: Abandono del Bucket**

Tras varios intentos fallidos por problemas de permisos y configuración del entorno, decidimos abandonar por completo la idea de usar un bucket de almacenamiento. La complejidad para autenticar el \`firebase-admin\` en el entorno de desarrollo era demasiado alta.

### **Nueva Estrategia: División de Archivos (Chunking)**

Propusiste una solución alternativa y mucho más robusta: si la base de datos (Firestore) no acepta documentos de más de 1MB, entonces dividamos los archivos grandes en "trozos" más pequeños que sí quepan.

-   **Implementación Inicial:** Se modificó el componente del chat para que, al subir un archivo, leyera su contenido, lo convirtiera a texto (Data URI) y, si superaba el límite, lo dividiera en varios documentos de Firestore, todos con un \`groupId\` para mantenerlos relacionados.
-   **Error #3: \`FirebaseError: The value of property "content" is longer than 1048487 bytes\`**. A pesar de la lógica de división, el error persistió. El análisis demostró que el tamaño de los "trozos" (1,000,000 bytes) era demasiado grande, ya que no consideraba el espacio que ocupan los otros campos del documento (como el nombre, el ID de grupo, etc.).
-   **Solución Final:** Se realizó un ajuste final en \`chat-assistant.tsx\`, reduciendo el tamaño máximo de cada trozo (\`CHUNK_SIZE\`) a \`1000000\` bytes. Este valor más conservador asegura que el documento total en Firestore, incluyendo todos sus campos, nunca exceda el límite de 1MB, solucionando definitivamente el problema.

Este proceso demuestra cómo, a través de la iteración y el análisis de errores, llegamos a una solución funcional que se adapta a las limitaciones de la plataforma sin depender de configuraciones complejas de backend.
`;

export const BITACORA_TUTORES = `
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
`;
```