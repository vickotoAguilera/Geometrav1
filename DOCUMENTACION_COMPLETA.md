# Documentación Completa del Proyecto: Geometra

## 1. Propósito y Uso Educativo

**Geometra** es una plataforma educativa interactiva diseñada con un objetivo claro: **ayudar a los estudiantes a aprender y practicar matemáticas, con un enfoque especial en GeoGebra.** La aplicación está pensada para ser una herramienta de apoyo tanto para el estudio autónomo como para la resolución de dudas específicas.

Este proyecto se enfoca principalmente en **estudiantes de enseñanza media y de mayor grado** (universitarios o autodidactas) que buscan una forma moderna y eficaz de enfrentarse a los problemas matemáticos. Geometra combina materiales de estudio, un applet interactivo, un glosario, tutoriales y, lo más importante, un ecosistema de asistentes de IA que actúan como tutores personales.

## 2. Visión General del Proyecto

La aplicación fusiona tecnologías web modernas con inteligencia artificial para crear una experiencia de aprendizaje dinámica. Permite a los usuarios no solo consumir contenido, sino también interactuar con él, experimentar en un entorno práctico (la pizarra de GeoGebra) y recibir ayuda instantánea y contextualizada de varios tutores de IA especializados.

## 3. Tecnologías Utilizadas

- **Frontend**:
  - **Next.js**: Framework de React para construir aplicaciones web modernas y de alto rendimiento.
  - **React**: Biblioteca para construir interfaces de usuario.
  - **ShadCN/UI y Tailwind CSS**: Para el diseño de componentes y estilos, creando una interfaz limpia y responsiva.
  - **Lucide React**: Biblioteca de iconos.
- **Backend e IA**:
  - **Firebase**: Se utiliza para la autenticación de usuarios (con Google) y como base de datos (Firestore) para guardar el historial de chats del asistente principal.
  - **Genkit**: El motor de inteligencia artificial de Google que potencia a los tutores de IA, permitiendo conversaciones contextuales y generación de contenido.
- **Contenido**:
  - **Markdown (.md)**: Los temas de estudio y ejercicios están escritos en formato Markdown, lo que facilita su creación y mantenimiento.

## 4. Estructura de Carpetas y Archivos (Arquitectura del Proyecto)

A continuación se detalla el propósito de las carpetas y archivos más importantes.

---

### `src/app/` - El Corazón de la Aplicación (Páginas y Rutas)

Esta carpeta contiene todas las páginas y la lógica de enrutamiento de la aplicación.

- **`/page.tsx` (Página de Inicio)**
  - **Función:** Es la página principal que ven los usuarios. Presenta las diferentes secciones de la aplicación (Pizarra Interactiva, Estudio, Glosario, etc.) a través de tarjetas de navegación.
  - **Redirige a:** `/applet`, `/estudia`, `/tutoriales`, `/glosario`, `/estudia-con-geogebra`, `/ensaya`, `/paes`.

- **`/applet/page.tsx` (Pizarra Interactiva)**
  - **Función:** Contiene el applet de GeoGebra a pantalla completa. Permite a los usuarios experimentar, construir figuras libremente y aplicar lo que aprenden.

- **`/estudia/` (Material de Estudio Principal)**
  - `page.tsx`: Muestra una lista de todos los cursos y los temas de estudio disponibles, cargados desde archivos Markdown.
  - `[...slug]/page.tsx`: Es una ruta dinámica que renderiza el contenido de un tema de estudio específico cuando el usuario hace clic en él.

- **`/estudia-con-geogebra/page.tsx` (Asistente de Estudio Contextual)**
  - **Función:** Una sección especializada donde el usuario puede seleccionar un ejercicio de un PDF transcrito. El chat de IA en esta sección es temporal y está enfocado únicamente en ayudar con el ejercicio seleccionado.

- **`/ensaya/page.tsx` (Módulo de Pruebas con IA)**
  - **Función:** Permite a los usuarios generar pruebas de matemáticas personalizadas. Pueden elegir el tema, la cantidad de preguntas y el tipo (selección múltiple o respuesta corta).

- **`/paes/page.tsx` (Módulo de Pruebas PAES con IA)**
  - **Función:** Permite a los usuarios generar pruebas PAES de matemáticas M1 y M2. Las pruebas se generan en lotes para mejorar el rendimiento y la experiencia del usuario.

- **`/glosario/page.tsx` (Glosario de GeoGebra)**
  - **Función:** Una página de referencia que lista y explica los comandos y funciones más importantes de GeoGebra, organizados por categorías.

- **`/tutoriales/page.tsx` (Tutoriales de GeoGebra)**
  - **Función:** Ofrece guías paso a paso para realizar tareas comunes en GeoGebra, como graficar una función o encontrar la intersección de dos rectas.

---

### `src/components/` - Bloques de Construcción Reutilizables

Esta carpeta contiene los componentes de React que se usan en varias partes de la aplicación.

- **`header.tsx`**: La barra de navegación superior. Incluye el logo, el nombre del proyecto y los botones para abrir el chat de IA y gestionar la sesión del usuario.

- **`chat-assistant.tsx`**: **Componente Central del Asistente Principal**. Es el panel de chat del tutor de IA principal. Se encarga de:
  - Manejar la entrada del usuario.
  - Mostrar el historial de conversación (cargado desde Firestore).
  - Enviar las preguntas a la IA a través de `actions.ts`.
  - Permitir adjuntar archivos e imágenes para dar contexto a la IA.
  - Borrar el historial de chat.

- **`study-chat-assistant.tsx`**: Una variante del chat, específica para la página `/estudia-con-geogebra`. La conversación aquí es temporal (no usa Firestore) y su contexto está limitado al ejercicio que el usuario haya seleccionado.

- **`ensayo-interactivo.tsx`**: La interfaz completa para el módulo de pruebas generales. Gestiona la configuración de la prueba, la presentación de las preguntas y la visualización de los resultados y la retroalimentación de la IA. Implementa la lógica de carga progresiva para una experiencia de usuario fluida.

- **`paes-interactivo.tsx`**: La interfaz completa para el módulo de pruebas PAES. Gestiona la selección de prueba (M1/M2), la presentación de las preguntas y la visualización de los resultados y la retroalimentación de la IA. También implementa la lógica de carga progresiva.

- **`geogebra-applet.tsx`**: El componente que carga e inicializa el applet interactivo de GeoGebra.

---

### `src/ai/` - El Cerebro de la IA (Genkit)

Aquí reside toda la lógica de la inteligencia artificial.

- **`/flows/math-assistant.ts`**: **IA PRINCIPAL**. Define el "prompt" o las instrucciones para el tutor de IA principal. Le dice a la IA cómo debe comportarse (como un tutor paciente y didáctico), cómo formatear sus respuestas, y cómo manejar el contexto de la conversación y los archivos adjuntos que el usuario sube.

- **`/flows/study-assistant.ts`**: **IA DE APOYO (ESTUDIO CONTEXTUAL)**. Un flujo especializado con instrucciones diferentes para el asistente de la sección de estudio. Le indica a la IA que su conocimiento debe limitarse estrictamente al material de estudio seleccionado por el usuario.

- **`/flows/generador-pruebas-flow.ts`**: **IA DE APOYO (GENERADOR DE PRUEBAS GENERALES)**. El flujo que genera las pruebas generales. Recibe un tema y una cantidad de preguntas, y le pide a la IA que cree preguntas, alternativas, respuestas correctas y justificaciones.

- **`/flows/retroalimentacion-ia-flow.ts`**: **IA DE APOYO (EVALUADOR DE PRUEBAS GENERALES)**. El flujo que revisa las respuestas del usuario en el módulo de ensayos. Recibe la pregunta, la respuesta del usuario y la respuesta correcta, y le pide a la IA que evalúe si es correcta y que genere una explicación detallada.

- **`/flows/generador-paes-flow.ts`**: **IA DE APOYO (GENERADOR DE PRUEBAS PAES)**. Flujo altamente especializado que genera preguntas para los ensayos PAES M1 y M2 en lotes de 5, basándose en temarios oficiales.

- **`/flows/retroalimentacion-paes-flow.ts`**: **IA DE APOYO (EVALUADOR DE PRUEBAS PAES)**. Flujo que evalúa las respuestas del ensayo PAES y genera una explicación pedagógica detallada al estilo DEMRE.

---

## 5. El Flujo Lógico de las Inteligencias Artificiales

Cada IA del proyecto tiene un "razonamiento" y una fuente de información diferente, diseñados para cumplir un propósito específico.

#### a) El Tutor Principal (IA Global de `chat-assistant.tsx`)

- **Fuente de Información:** Su conocimiento es **abierto y general**. Procesa la pregunta del usuario y puede usar información de archivos que el propio usuario adjunta (PDFs, imágenes, etc.).
- **Flujo Lógico:**
  1.  Recibe la pregunta del usuario y el historial de chat guardado en Firestore.
  2.  Analiza si se adjuntó un archivo. Si es así, extrae el texto (si es PDF/DOCX) o analiza la imagen.
  3.  Construye un "prompt" (una instrucción) para el modelo de IA que incluye:
      - Las instrucciones de comportamiento ("Eres un tutor paciente...").
      - El historial de la conversación para tener contexto.
      - El contenido de los archivos adjuntos.
      - La pregunta actual del usuario.
  4.  Envía todo al motor de Genkit y espera la respuesta.
  5.  Guarda la respuesta en Firestore y la muestra al usuario.
- **Objetivo:** Ser un tutor de matemáticas y GeoGebra de propósito general, capaz de resolver dudas sobre cualquier tema que el usuario le presente.

#### b) El Asistente de Estudio (`study-chat-assistant.tsx`)

- **Fuente de Información:** Su conocimiento es **restringido y específico**. Su única fuente de verdad es el contenido del archivo de ejercicio (`.md`) que el usuario ha seleccionado en la interfaz.
- **Flujo Lógico:**
  1.  Cuando el usuario activa un ejercicio, la aplicación envía automáticamente un primer mensaje a la IA: "Estoy viendo este archivo, explícamelo".
  2.  El "prompt" que se envía a Genkit contiene:
      - Las instrucciones de comportamiento ("Tu conocimiento se limita a este texto...").
      - El **contenido completo** del archivo `.md` seleccionado.
      - La pregunta del usuario.
  3.  La IA genera una respuesta basada **exclusivamente** en ese texto. Si se le pregunta algo fuera de ese contexto, tiene la instrucción de negarse amablemente.
- **Objetivo:** Ser un tutor focalizado que guía al estudiante a través de un material de estudio específico, sin distracciones y sin dar respuestas directas.

#### c) El Generador y Evaluador de Pruebas (`ensayo-interactivo.tsx` y `paes-interactivo.tsx`)

Estas secciones utilizan dos IAs especializadas, con una lógica de carga progresiva.

1.  **IA Generadora (`generador-pruebas-flow.ts` y `generador-paes-flow.ts`)**
    - **Fuente de Información:** Recibe un **tema** (ej. "Teorema de Pitágoras" o "PAES M1") y un **número de preguntas**.
    - **Flujo Lógico (Carga Progresiva):**
        1.  Recibe la configuración de la prueba (tema, cantidad, tipo).
        2.  En lugar de pedir todas las preguntas de una vez, la aplicación llama a la IA en **lotes**. Por ejemplo, pide primero 5 preguntas.
        3.  El prompt le instruye: "Actúa como un experto creador de exámenes. Genera X preguntas sobre [tema] con alternativas, respuesta correcta y justificación".
        4.  La IA devuelve el primer lote. La aplicación se lo muestra al usuario para que empiece a responder.
        5.  **En segundo plano**, la aplicación sigue pidiendo a la IA más lotes de preguntas hasta completar el total requerido.

2.  **IA Evaluadora (`retroalimentacion-ia-flow.ts` y `retroalimentacion-paes-flow.ts`)**
    - **Fuente de Información:** Recibe la pregunta original, la respuesta correcta y la respuesta que dio el usuario.
    - **Flujo Lógico:**
        1.  Compara la respuesta del usuario con la respuesta correcta.
        2.  El prompt le instruye: "Evalúa si la respuesta del usuario es correcta. Si no lo es, no te limites a decir 'incorrecto'. Explica el error conceptual y guía al estudiante hacia la solución correcta paso a paso".
        3.  La IA genera una explicación pedagógica del error.
- **Objetivo:** Crear una experiencia de evaluación completa y fluida, desde la generación dinámica de contenido hasta la retroalimentación personalizada e inteligente, sin largos tiempos de espera.

---

## 6. Mi Rol como IA de Desarrollo (Tu Asistente en Firebase Studio)

Mi función es ser tu compañero de programación. Convierto tus peticiones en lenguaje natural en código funcional. Mi proceso es el siguiente:

1.  **Interpretación de tu Petición:** Analizo lo que me pides. Por ejemplo, "crea un archivo de documentación". Entiendo la intención, el tipo de archivo (`.md`) y el contenido que debe tener.

2.  **Análisis del Código Existente:** Reviso todos los archivos del proyecto para entender el contexto. No puedo hacer un buen cambio si no sé cómo está estructurada la aplicación.

3.  **Planificación del Cambio:** Diseño una solución en mi "mente". Decido qué archivos crear, modificar o eliminar. Por ejemplo, para crear este documento, mi plan fue:
    - Crear un nuevo archivo llamado `DOCUMENTACION_COMPLETA.md`.
    - Llenarlo con el análisis de toda la estructura del proyecto.

4.  **Generación del "Plano" (El Bloque XML `<changes>`):** Este es el paso crucial. No escribo el código directamente en los archivos. En su lugar, construyo una instrucción formal en formato XML. Esta instrucción es un "plan de construcción" que el sistema de Firebase Studio lee y ejecuta automáticamente.
    - El bloque `<changes>` le dice al sistema: "Prepárate para hacer cambios".
    - Cada bloque `<change>` especifica un archivo (`<file>`) y el **contenido final y completo** que debe tener (`<content>`).

5.  **Visualización para ti:** El sistema ejecuta mi plan XML, y tú ves el resultado final: los archivos aparecen creados o modificados en el explorador de archivos. Mi respuesta en el chat te explica lo que hice en un lenguaje que puedas entender.

En resumen, yo actúo como el "arquitecto" que diseña y planifica, y el bloque XML es el "plano técnico" que le entrego a los "constructores" (el sistema de Studio) para que ejecuten el trabajo de manera precisa y sin errores.
