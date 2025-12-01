# Hoja de Ruta: Tutor Teórico Interactivo (Calculadora y Cuaderno)

Este documento detalla el plan para implementar un segundo asistente de IA especializado, enfocado en la resolución teórica y manual de ejercicios.

## 1. Objetivo Principal

Transformar el botón "Explicación Teórica" en un **asistente de IA interactivo y contextual**. Este tutor no dará la solución directamente, sino que guiará al estudiante paso a paso para resolver el problema "a mano", utilizando su cuaderno y una calculadora científica.

## 2. Fases de Implementación

### Fase 1: Creación del "Cerebro" de la IA Teórica (Aislado)

Esta fase se centra en construir el modelo de inteligencia artificial que actuará como tutor teórico. Será un flujo completamente independiente para asegurar su especialización.

1.  **Crear Esquemas de Datos (`teoria-calculadora-schemas.ts`):**
    *   **Archivo:** `src/ai/flows/schemas/teoria-calculadora-schemas.ts`
    *   **Propósito:** Definir la estructura de datos (con Zod) para la entrada y salida del nuevo flujo. Esto asegura una comunicación consistente.

2.  **Crear la IA Tutora Teórica (`teoria-calculadora-assistant.ts`):**
    *   **Archivo:** `src/ai/flows/teoria-calculadora-assistant.ts`
    *   **Personalidad del Prompt:** Se le darán instrucciones muy específicas a la IA para que actúe como un tutor de matemáticas enfocado en:
        *   El razonamiento lógico detrás de cada paso.
        *   La manipulación algebraica necesaria.
        *   **Cómo y cuándo usar una calculadora científica** para verificar o realizar cálculos complejos.
        *   **Prohibición explícita de dar instrucciones de GeoGebra.** Su dominio es el lápiz y el papel.

---

### Fase 2: Construcción de la Interfaz del Chat Teórico

1.  **Crear el Componente del Chat (`tutor-teorico-chat.tsx`):**
    *   **Archivo:** `src/components/tutor-teorico-chat.tsx`
    *   **Propósito:** Será la interfaz de usuario para interactuar con la nueva IA. Será visualmente similar a los otros chats, pero su lógica interna estará conectada al nuevo flujo.

2.  **Integrar el Chat en el Componente de Ejercicio (`ejercicio-interactivo.tsx`):**
    *   Se modificará el componente `ejercicio-interactivo.tsx`.
    *   El botón "Explicación Teórica" ya no será un simple botón, sino un **`AccordionTrigger`**.
    *   Al hacer clic, se desplegará un **`AccordionContent`** que contendrá el nuevo componente `tutor-teorico-chat.tsx`. Esto permite que el chat aparezca y desaparezca en la misma página, sin necesidad de navegar a otro lugar.

---

### Fase 3: Gestión del Contexto y la Memoria de la Conversación

Esta es la parte clave para que la IA sea inteligente y contextual.

1.  **Memoria Persistente por Módulo (`localStorage`):**
    *   La conversación con el tutor teórico se guardará en el `localStorage` del navegador.
    *   La clave de guardado usará el `groupId` del módulo (ej: `chat-teorico-trigonometria-basica`). Esto asegura que si sales y vuelves a la página de ejercicios de trigonometría, la conversación siga ahí.
    *   Si navegas a otra sección de la aplicación (como el Glosario o la página de inicio), se implementará una lógica para **borrar el historial** de ese `groupId`, asegurando que cada sesión de módulo sea fresca.

2.  **Contexto Aditivo y Dinámico:**
    *   Al hacer clic por primera vez en "Explicación Teórica" para un ejercicio (ej. "Ejercicio A"), se cargará el contenido del archivo `ejercicio-a.md` y se enviará a la IA con un prompt inicial.
    *   Si, dentro del mismo módulo, el usuario cierra el acordeón del Ejercicio A y abre el del "Ejercicio B", el componente detectará el cambio.
    *   Se enviará un nuevo mensaje automático a la IA con el contenido de `ejercicio-b.md`, pero **sin borrar el historial anterior**. El prompt será algo como: *"Ahora también quiero que consideres el siguiente ejercicio para nuestra conversación: [contenido de ejercicio-b.md]"*.
    *   Esto permitirá al usuario hacer preguntas comparativas como: *"¿Cuál es la principal diferencia en el enfoque para resolver el Ejercicio A y el Ejercicio B?"*, y la IA tendrá el contexto de ambos para responder de manera inteligente.
