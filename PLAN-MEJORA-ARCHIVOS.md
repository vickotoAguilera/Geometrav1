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
