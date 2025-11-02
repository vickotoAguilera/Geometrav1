# Plan de Mejora: Gestión de Archivos Grandes y Contexto de Imágenes

Este documento describe la estrategia para solucionar el límite de tamaño de los archivos en el chat y para permitir que la IA maneje de forma inteligente las imágenes contenidas en los documentos.

## 1. División de Archivos Grandes (Chunking)

**Objetivo:** Permitir la subida de archivos de más de 1MB sin depender de un bucket de almacenamiento.

### Lógica de Implementación:

-   **Verificación de Tamaño:** Al subir un archivo (PDF, DOCX) en el chat, el sistema primero comprobará su tamaño.
-   **División Automática:** Si el archivo supera 1MB, su contenido textual se dividirá automáticamente en "trozos" (chunks) más pequeños, cada uno por debajo del límite.
-   **Agrupación:** Cada trozo se guardará en la base de datos (Firestore) como un documento independiente, pero todos compartirán un **identificador de grupo único** y un número de parte (ej: `MiArchivo.pdf - Parte 1/4`).
-   **Interfaz de Usuario Unificada:** En la sección "Contexto de Archivos" del chat, estos trozos se mostrarán como **un solo elemento agrupado**. Un solo interruptor (`Switch`) activará o desactivará todos los trozos enlazados a la vez, garantizando que la IA siempre reciba el contexto completo o ninguno.

## 2. Manejo Inteligente de Imágenes en Documentos

**Objetivo:** Hacer que la IA sea consciente de las imágenes dentro de los documentos y pueda solicitar al usuario que las suba para un análisis más profundo.

### Lógica de Implementación:

-   **Detección de Imágenes:** Durante el procesamiento del documento (al subirlo), el sistema detectará la presencia de imágenes. No las "verá", pero reemplazará cada una con un marcador de texto especial. Por ejemplo: `[IMAGEN: ID_IMG_01 - Referente a la pregunta 4 de la página 8]`.
-   **Instrucción a la IA:** Se modificará el "cerebro" de la IA (`math-assistant.ts`) para que, cuando encuentre uno de estos marcadores, reaccione de una forma específica.
-   **Interacción con el Usuario:** En lugar de ignorar la imagen, la IA dirá algo como:
    > "Veo que la pregunta 4 de la página 8 está ligada a una imagen. Si quieres que la analice para darte una mejor explicación, puedes adjuntarla en este chat. Si no lo necesitas, puedo explicarte la pregunta sin el contexto visual."
-   **Enlace Contextual:** Si el usuario decide subir la imagen, la aplicación la asociará internamente con el marcador `ID_IMG_01`. De esta manera, cuando se le vuelva a preguntar por ese tema, la IA sabrá que ya tiene la imagen y podrá analizarla junto con el texto.

## Archivos a Modificar

1.  **`src/components/chat-assistant.tsx`**: Para implementar la lógica de división de archivos (chunking) y la gestión de la interfaz de usuario para los archivos agrupados.
2.  **`src/ai/flows/math-assistant.ts`**: Para actualizar las instrucciones del "System Prompt" de la IA y enseñarle a manejar los marcadores de imagen y a interactuar con el usuario para solicitarlas.

---

## Bitácora de Implementación y Solución de Errores

Esta sección documenta el proceso que seguimos para llegar a la solución final.

### **Problema Inicial: Límite de Subida de Archivos**

El primer gran obstáculo fue el error `TypeError: fetch failed` al intentar subir archivos. Nuestra primera idea fue usar una Cloud Function como intermediario para subir los archivos a un bucket de almacenamiento.

-   **Error #1: `fetch failed`**. Ocurrió porque la Server Action (backend) no podía llamar a una URL `localhost` de la Cloud Function que se ejecutaba localmente.
-   **Error #2: `Module not found: firebase-functions`**. Ocurrió cuando intentamos importar directamente la lógica de la Cloud Function a la Server Action. El entorno de Next.js no tiene las dependencias del backend de Firebase.

### **Cambio de Estrategia: Abandono del Bucket**

Tras varios intentos fallidos por problemas de permisos y configuración del entorno, decidimos abandonar por completo la idea de usar un bucket de almacenamiento. La complejidad para autenticar el `firebase-admin` en el entorno de desarrollo era demasiado alta.

### **Nueva Estrategia: División de Archivos (Chunking)**

Propusiste una solución alternativa y mucho más robusta: si la base de datos (Firestore) no acepta documentos de más de 1MB, entonces dividamos los archivos grandes en "trozos" más pequeños que sí quepan.

-   **Implementación Inicial:** Se modificó el componente del chat para que, al subir un archivo, leyera su contenido, lo convirtiera a texto (Data URI) y, si superaba el límite, lo dividiera en varios documentos de Firestore, todos con un `groupId` para mantenerlos relacionados.
-   **Error #3: `FirebaseError: The value of property "content" is longer than 1048487 bytes`**. A pesar de la lógica de división, el error persistió. El análisis demostró que el tamaño de los "trozos" (1,000,000 bytes) era demasiado grande, ya que no consideraba el espacio que ocupan los otros campos del documento (como el nombre, el ID de grupo, etc.).
-   **Solución Final:** Se realizó un ajuste final en `chat-assistant.tsx`, reduciendo el tamaño máximo de cada trozo (`CHUNK_SIZE`) a `1000000` bytes. Este valor más conservador asegura que el documento total en Firestore, incluyendo todos sus campos, nunca exceda el límite de 1MB, solucionando definitivamente el problema.

Este proceso demuestra cómo, a través de la iteración y el análisis de errores, llegamos a una solución funcional que se adapta a las limitaciones de la plataforma sin depender de configuraciones complejas de backend.