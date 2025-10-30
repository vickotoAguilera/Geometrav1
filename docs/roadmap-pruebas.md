# Hoja de Ruta: Módulo de Pruebas con IA

Este documento describe el plan para desarrollar e implementar un módulo de pruebas de selección múltiple, potenciado con inteligencia artificial para la generación de contenido y retroalimentación personalizada.

## Fase 1: Creación de la Estructura Base

1.  **Creación de la Interfaz de Usuario (UI):**
    *   Diseñar una nueva ruta/página en la aplicación (ej. `/pruebas`).
    *   En esta página, el usuario podrá seleccionar un tema o materia sobre la cual desea ser evaluado.
    *   Desarrollar un componente de React para renderizar una pregunta de selección múltiple con sus alternativas (A, B, C, D, E).
    *   Implementar un sistema de estado en el cliente (usando `useState`) para registrar las respuestas seleccionadas por el usuario para cada pregunta.

2.  **Página de Resultados:**
    *   Crear una vista de resultados que se muestre al finalizar la prueba.
    *   Esta vista debe mostrar el puntaje final (ej: "8/10 correctas").
    *   Debe presentar un desglose de cada pregunta, mostrando la respuesta del usuario, la respuesta correcta y si acertó o no.

## Fase 2: Integración de Inteligencia Artificial

1.  **Generador de Pruebas Dinámicas (Flow de Genkit):**
    *   Crear un nuevo `flow` de Genkit (ej. `generadorDePruebasFlow`) en el backend.
    *   **Entrada del Flow:** Recibirá el tema de estudio (ej. "Teorema de Pitágoras") y el número de preguntas deseado.
    *   **Prompt para la IA:** Se le instruirá a la IA para que genere una prueba de selección múltiple con el formato especificado: enunciado, 5 alternativas (1 correcta y 4 distractores plausibles) y la justificación de la respuesta correcta. El prompt enfatizará que las preguntas y los valores deben ser diferentes en cada ejecución para garantizar la variabilidad.
    *   **Salida del Flow:** Devolverá un objeto JSON con la lista de preguntas, listas para ser consumidas por el frontend.

2.  **Retroalimentación Personalizada con IA (Flow de Genkit):**
    *   Crear un segundo `flow` de Genkit (ej. `retroalimentacionIAFlow`).
    *   **Entrada del Flow:** Recibirá el contexto de un error del alumno: la pregunta, la respuesta incorrecta que seleccionó y la respuesta correcta.
    *   **Prompt para la IA:** Se le pedirá a la IA que actúe como un tutor experto. Deberá analizar por qué el alumno pudo haber elegido la respuesta incorrecta y proporcionar una explicación clara y paso a paso del concepto subyacente, guiándolo hacia la lógica de la respuesta correcta.
    *   **Integración:** En la página de resultados, para cada respuesta incorrecta, se llamará a este `flow` para mostrar una explicación personalizada y dinámica en lugar de un texto estático.

## Resumen Técnico

| Característica | Implementación Propuesta |
| :--- | :--- |
| **Página de Pruebas** | Nueva ruta y componentes de React en Next.js. |
| **Generación de Contenido** | Flow de Genkit (`generadorDePruebasFlow`) que genera preguntas únicas. |
| **Almacenamiento de Respuestas** | Estado local de React durante la prueba. |
| **Visualización de Resultados** | Componente de React que muestra puntaje y revisión detallada. |
| **Retroalimentación de Errores**| Flow de Genkit (`retroalimentacionIAFlow`) para explicaciones personalizadas. |
| **Variabilidad** | Asegurada por la naturaleza generativa de la IA, evitando pruebas repetitivas. |
