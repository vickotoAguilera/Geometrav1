# Hoja de Ruta: Módulo de Preparación PAES

Este documento describe el plan para desarrollar e implementar un módulo de preparación para la Prueba de Acceso a la Educación Superior (PAES), completamente separado del módulo de "Ensayo" general.

## Objetivo Principal
Crear un ambiente dedicado dentro de la aplicación para que los estudiantes puedan practicar para la PAES de matemáticas (M1 y M2) con pruebas generadas por una IA especializada, recibiendo retroalimentación detallada y contextualizada al estilo DEMRE.

---

## Plan de Acción

### Paso 1: Crear los "Cerebros" de la IA (Nuevos Flujos de Genkit)

Esta fase consiste en construir los modelos de inteligencia artificial que generarán y evaluarán las pruebas. Serán flujos independientes para asegurar su especialización y precisión.

1.  **Crear Esquemas de Datos (`generador-paes-schemas.ts`):**
    *   **Archivo:** `src/ai/flows/schemas/generador-paes-schemas.ts`
    *   **Propósito:** Definir la estructura de datos (usando Zod) para las preguntas, alternativas y justificaciones de las pruebas PAES. Esto asegura que la IA siempre devuelva la información en un formato consistente.

2.  **Crear IA Generadora de Pruebas (`generador-paes-flow.ts`):**
    *   **Archivo:** `src/ai/flows/generador-paes-flow.ts`
    *   **Propósito:** Contendrá el flujo principal que recibe la orden (M1 o M2) y genera una prueba completa de 50 preguntas de selección múltiple.
    *   **Prompt:** Las instrucciones para la IA serán muy específicas, indicándole que debe actuar como un experto del DEMRE, basarse estrictamente en los temarios M1 y M2 proporcionados, y crear preguntas y alternativas realistas.

3.  **Crear IA Evaluadora (`retroalimentacion-paes-flow.ts`):**
    *   **Archivo:** `src/ai/flows/retroalimentacion-paes-flow.ts`
    *   **Propósito:** Este flujo recibirá la pregunta original, la respuesta del alumno y la respuesta correcta.
    *   **Prompt:** Se le instruirá a la IA para que genere una explicación pedagógica y detallada, similar a los ejemplos proporcionados, justificando la respuesta correcta y explicando los errores conceptuales comunes.

---

### Paso 2: Construir la Interfaz de Usuario (El Componente de React)

Esta fase se centra en lo que el usuario verá e interactuará en la página `/paes`.

1.  **Crear Componente Interactivo (`paes-interactivo.tsx`):**
    *   **Archivo:** `src/components/paes-interactivo.tsx`
    *   **Propósito:** Será el componente principal de la página PAES.
    *   **Funcionalidades:**
        *   Mostrará una pantalla de bienvenida con dos botones claros: "Iniciar Ensayo M1 (Obligatoria)" e "Iniciar Ensayo M2 (Electiva)".
        *   Gestionará el estado de la prueba: cargando, en curso y resultados.
        *   Renderizará las 50 preguntas de la prueba, una por una, permitiendo al usuario navegar entre ellas.
        *   Mostrará la pantalla final de resultados, con el recuento de respuestas correctas (en azul) e incorrectas (en rojo), y la retroalimentación detallada de la IA evaluadora para cada error.

---

### Paso 3: Conectar Todo el Sistema

Esta fase une la interfaz de usuario con la lógica de la IA.

1.  **Crear Acciones de Servidor (`paes-actions.ts`):**
    *   **Archivo:** `src/app/paes-actions.ts`
    *   **Propósito:** Actuará como un puente seguro entre el componente de React (`paes-interactivo.tsx`) y los flujos de Genkit. Contendrá las funciones `async` que llamarán a la IA generadora y a la IA evaluadora.

2.  **Integrar en la Página PAES (`page.tsx`):**
    *   **Archivo:** `src/app/paes/page.tsx`
    *   **Propósito:** Modificar esta página para que importe y muestre el nuevo componente `paes-interactivo.tsx`.

3.  **Registrar los Nuevos Flujos (`dev.ts`):**
    *   **Archivo:** `src/ai/dev.ts`
    *   **Propósito:** Añadir las importaciones de los nuevos flujos (`generador-paes-flow.ts` y `retroalimentacion-paes-flow.ts`) para que el entorno de desarrollo de Genkit los reconozca y pueda ejecutarlos.
