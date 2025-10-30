
# Documentación del Proyecto: Geometra

Este documento proporciona una visión general completa del proyecto Geometra, su estructura, tecnologías y el propósito de cada componente clave.

## 1. Visión General del Proyecto

**Geometra** es una plataforma educativa interactiva diseñada para ayudar a los estudiantes a aprender y practicar matemáticas, con un enfoque especial en GeoGebra. La aplicación combina materiales de estudio, un applet interactivo, un glosario, tutoriales y, lo más importante, un asistente de IA experto que actúa como tutor personal.

## 2. Tecnologías Utilizadas

- **Frontend**:
  - **Next.js**: Framework de React para construir aplicaciones web modernas y de alto rendimiento.
  - **React**: Biblioteca para construir interfaces de usuario.
  - **ShadCN/UI y Tailwind CSS**: Para el diseño de componentes y estilos, creando una interfaz limpia y responsiva.
  - **Lucide React**: Biblioteca de iconos.
- **Backend e IA**:
  - **Firebase**: Se utiliza para la autenticación de usuarios (con Google) y como base de datos (Firestore) para guardar el historial de chats.
  - **Genkit**: El motor de inteligencia artificial de Google que potencia al tutor de IA, permitiendo conversaciones contextuales y generación de contenido.
- **Contenido**:
  - **Markdown (.md)**: Los temas de estudio y ejercicios están escritos en formato Markdown, lo que facilita su creación y mantenimiento.

## 3. Estructura de Carpetas y Archivos

A continuación se detalla el propósito de las carpetas y archivos más importantes.

---

### `src/app/` - El Corazón de la Aplicación (Rutas)

Esta carpeta contiene todas las páginas y la lógica de enrutamiento de la aplicación.

- **`/page.tsx` (Página de Inicio)**
  - Es la página principal que ven los usuarios. Presenta las diferentes secciones de la aplicación (Pizarra Interactiva, Estudio, Glosario, etc.) a través de tarjetas de navegación.

- **`/applet/page.tsx` (Pizarra Interactiva)**
  - Contiene el applet de GeoGebra a pantalla completa. Permite a los usuarios experimentar y construir figuras libremente.

- **`/estudia/` (Material de Estudio Principal)**
  - `page.tsx`: Muestra una lista de todos los cursos y los temas de estudio disponibles, cargados desde archivos Markdown.
  - `[...slug]/page.tsx`: Es una ruta dinámica que renderiza el contenido de un tema de estudio específico cuando el usuario hace clic en él.

- **`/estudia-con-geogebra/page.tsx` (Asistente de Estudio Contextual)**
  - Una sección especializada donde el usuario puede seleccionar un ejercicio de un PDF transcrito. El chat de IA en esta sección es temporal y está enfocado únicamente en ayudar con el ejercicio seleccionado.

- **`/ensaya/page.tsx` (Módulo de Pruebas con IA)**
  - Permite a los usuarios generar pruebas de matemáticas personalizadas. Pueden elegir el tema, la cantidad de preguntas y el tipo (selección múltiple o respuesta corta).

- **`/glosario/page.tsx` (Glosario de GeoGebra)**
  - Una página de referencia que lista y explica los comandos y funciones más importantes de GeoGebra, organizados por categorías.

- **`/tutoriales/page.tsx` (Tutoriales de GeoGebra)**
  - Ofrece guías paso a paso para realizar tareas comunes en GeoGebra, como graficar una función o encontrar la intersección de dos rectas.

---

### `src/components/` - Bloques de Construcción Reutilizables

Esta carpeta contiene los componentes de React que se usan en varias partes de la aplicación.

- **`header.tsx`**: La barra de navegación superior. Incluye el logo, el nombre del proyecto y los botones para abrir el chat de IA y gestionar la sesión del usuario.

- **`chat-assistant.tsx`**: **Componente Central**. Es el panel de chat del asistente de IA principal. Se encarga de:
  - Manejar la entrada del usuario.
  - Mostrar el historial de conversación (cargado desde Firestore).
  - Enviar las preguntas a la IA a través de `actions.ts`.
  - Permitir adjuntar archivos e imágenes para dar contexto a la IA.
  - Borrar el historial de chat.

- **`study-chat-assistant.tsx`**: Una variante del chat, específica para la página `/estudia-con-geogebra`. La conversación aquí es temporal (no usa Firestore) y su contexto está limitado al ejercicio que el usuario haya seleccionado.

- **`ensayo-interactivo.tsx`**: La interfaz completa para el módulo de pruebas. Gestiona la configuración de la prueba, la presentación de las preguntas y la visualización de los resultados y la retroalimentación de la IA.

- **`geogebra-applet.tsx`**: El componente que carga e inicializa el applet interactivo de GeoGebra.

---

### `src/ai/` - El Cerebro de la IA (Genkit)

Aquí reside toda la lógica de la inteligencia artificial.

- **`genkit.ts`**: Archivo de configuración que inicializa Genkit y define qué modelo de IA se usará (por ejemplo, Gemini 2.5 Flash).

- **`/flows/math-assistant.ts`**: Define el "prompt" o las instrucciones para el tutor de IA principal. Le dice a la IA cómo debe comportarse (como un tutor paciente y didáctico), cómo formatear sus respuestas (usando `<code>` y `**`), y cómo manejar el contexto de la conversación y los archivos adjuntos.

- **`/flows/study-assistant.ts`**: Un flujo especializado con instrucciones diferentes para el asistente de la sección de estudio. Le indica a la IA que su conocimiento debe limitarse estrictamente al material de estudio proporcionado.

- **`/flows/generador-pruebas-flow.ts`**: El flujo que genera las pruebas. Recibe un tema y una cantidad de preguntas, y le pide a la IA que cree preguntas, alternativas, respuestas correctas y justificaciones.

- **`/flows/retroalimentacion-ia-flow.ts`**: El flujo que revisa las respuestas del usuario en el módulo de ensayos. Recibe la pregunta, la respuesta del usuario y la respuesta correcta, y le pide a la IA que evalúe si es correcta y que genere una explicación detallada en caso de error.

---

### `src/firebase/` - Conexión con Firebase

Esta carpeta gestiona toda la interacción con los servicios de Firebase.

- **`config.ts`**: Contiene las claves y la configuración para conectar la aplicación con tu proyecto de Firebase en la nube.
- **`provider.tsx` y `client-provider.tsx`**: Componentes que "envuelven" toda la aplicación para que cualquier parte de ella pueda acceder a los servicios de Firebase (como la autenticación y la base de datos) de forma segura y eficiente.
- **`firestore/`**: Contiene "hooks" de React (`useCollection`, `useDoc`) que facilitan la tarea de leer datos de Firestore en tiempo real.
- **`errors.ts` y `error-emitter.ts`**: Un sistema avanzado de manejo de errores, especialmente diseñado para capturar y mostrar de forma clara los errores de permisos de Firestore.

---

### `src/content/` - El Contenido Educativo

Aquí se almacenan todos los materiales de estudio en formato Markdown (`.md`).

- **`/estudia/`**: Contiene los archivos `.md` para la sección principal de estudio, organizados por curso (`primero-medio`, `segundo-medio`, etc.).
- **`/ejercicios/`**: Contiene las transcripciones de los PDFs que se usan en la sección "Estudia con GeoGebra".
