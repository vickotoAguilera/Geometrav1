# Hoja de Ruta: Módulo Interactivo de Funciones y Matrices

Este documento detalla el plan para transformar la sección "Funciones y Matrices" en una experiencia de aprendizaje altamente interactiva, guiada y contextual, que integra ejercicios prácticos con el applet de GeoGebra y un asistente de IA dedicado.

## Objetivo Principal

Crear un entorno de aprendizaje donde el estudiante no reciba soluciones directas, sino que sea guiado activamente para resolver problemas, tanto teóricamente como en la práctica con GeoGebra, utilizando un asistente de IA especializado que actúa como un tutor personal.

---

## Fase 1: Transformación de Ejercicios a Módulos Interactivos

**Objetivo:** Reemplazar las soluciones estáticas de las páginas de ejercicios (como la de trigonometría) por componentes dinámicos que fomenten la participación activa del estudiante.

### Pasos de Implementación:

1.  **Componente Interactivo:** Modificar las páginas de ejercicios para que, en lugar de mostrar el texto de la solución, rendericen un nuevo componente de React.
2.  **Campo de Respuesta:** Este componente contendrá un campo de texto (`<Input>`) donde el estudiante deberá escribir su respuesta.
3.  **Botones de Ayuda:** Sobre el campo de respuesta, se mostrarán dos botones:
    *   **"Explicación Teórica":** Al hacer clic, revelará una guía conceptual y los pasos lógicos para resolver el problema, pero **sin dar el resultado final**.
    *   **"Resolver con GeoGebra":** Este botón iniciará la Fase 2.

---

## Fase 2: Integración Contextual con el Applet de GeoGebra

**Objetivo:** Conectar de manera inteligente la página del ejercicio con la pizarra interactiva de GeoGebra, pasando el contexto del problema.

### Pasos de Implementación:

1.  **Redirección con Parámetros:** Al hacer clic en "Resolver con GeoGebra", la aplicación redirigirá al usuario a una URL especial, como por ejemplo: `/applet?ejercicio=teorema-angulo-central`.
2.  **Lectura de Parámetros:** La página del applet (`/applet/page.tsx`) será modificada para que pueda leer los parámetros de la URL (en este ejemplo, que se trata del ejercicio `teorema-angulo-central`).

---

## Fase 3: Asistente Contextual en el Applet

**Objetivo:** Crear un asistente de IA "efímero" que solo aparece cuando es necesario y que tiene pleno conocimiento del ejercicio que el estudiante está intentando resolver.

### Pasos de Implementación:

1.  **Botón de Ayuda Dinámico:** En la página `/applet`, se implementará una lógica condicional. Si la página detecta un parámetro `ejercicio` en la URL, mostrará un **botón especial de ayuda** (ej: un ícono de tutor 🤖). Si no hay parámetro, este botón no será visible.
2.  **Nuevo Asistente de IA Aislado:**
    *   Se creará un **nuevo flujo de IA** (`funciones-matrices-assistant.ts`) con instrucciones específicas para actuar como un tutor de GeoGebra.
    *   Se creará un **nuevo componente de chat** (`funciones-chat-assistant.tsx`) que será invocado por el botón de ayuda dinámico. Este chat será temporal (sin conexión a Firestore).
3.  **Guía Paso a Paso:** Al abrir el chat, se enviará un mensaje automático a la IA con el identificador del ejercicio. La IA responderá con el primer paso y hará preguntas para guiar al estudiante en la construcción dentro de GeoGebra (ej: *"Primero, crea un círculo. Ahora, usa el comando 'Punto' para marcar el centro. ¿Listo?"*).
4.  **Botón de Regreso:** Una vez que el ejercicio se resuelva en GeoGebra y el estudiante obtenga la respuesta, el asistente de IA le mostrará un botón para **"Volver al Ejercicio"**, que lo redirigirá de vuelta a la página de la que vino.

---

## Fase 4: Persistencia de Progreso del Estudiante

**Objetivo:** Asegurar que el trabajo del estudiante no se pierda al navegar entre la página de ejercicios y el applet.

### Pasos de Implementación:

1.  **Guardado Temporal:** La respuesta que el estudiante escriba en el campo de texto de un ejercicio se guardará en el estado del componente de React. Para persistir los datos entre recargas o al volver del applet, se utilizará el `localStorage` del navegador.
2.  **Aviso de Pérdida de Datos:** Se implementará un mecanismo que detecte si el usuario intenta abandonar por completo la sección de ejercicios (por ejemplo, yendo al Glosario). En ese caso, se mostrará un `AlertDialog` advirtiendo: *"Si sales de esta página, tu progreso y respuestas no guardadas se perderán. ¿Estás seguro?"*. El progreso se borrará solo si el usuario confirma.
