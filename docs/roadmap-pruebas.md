# Hoja de Ruta: Módulo de Pruebas con IA

Este documento describe el plan para desarrollar e implementar un módulo de pruebas de selección múltiple, potenciado con inteligencia artificial para la generación de contenido y retroalimentación personalizada.

## Fase 1: Creación de la Estructura Base y UI

1.  **Creación de la Interfaz de Usuario (UI):**
    *   Diseñar la página `/ensaya`, que será el punto de entrada al módulo de pruebas.
    *   En esta página, el usuario podrá seleccionar un tema o materia sobre la cual desea ser evaluado.
    *   **Modalidades de Prueba:** El usuario deberá poder elegir entre tres opciones antes de comenzar:
        *   **Ensayo:** Una prueba corta de 5 preguntas.
        *   **Desafío:** Una prueba intermedia de 15 preguntas.
        *   **Prueba Final:** Una evaluación extensa de 40 preguntas.
    *   Desarrollar un componente de React para renderizar una pregunta de selección múltiple con sus alternativas (A, B, C, D, E).
    *   Implementar un sistema de estado en el cliente (usando `useState`) para registrar las respuestas seleccionadas por el usuario para cada pregunta.

2.  **Página de Resultados:**
    *   Crear una vista de resultados que se muestre al finalizar la prueba.
    *   Esta vista debe mostrar el puntaje final (ej: "8/10 correctas").
    *   Debe presentar un desglose de cada pregunta, mostrando la respuesta del usuario, la respuesta correcta y si acertó o no.

## Fase 2: Integración de Inteligencia Artificial

### IA 1: Generador de Pruebas Dinámicas (Flow de Genkit)

1.  **Creación del Flow (`generadorDePruebasFlow`):**
    *   **Entrada:** Recibirá el tema de estudio (ej. "Teorema de Pitágoras") y el número de preguntas según la modalidad elegida (5, 15 o 40).
    *   **Prompt para la IA:** Se le instruirá a la IA para que actúe como un **experto creador de exámenes de matemáticas**. Deberá generar una prueba de selección múltiple con el formato especificado: enunciado, 5 alternativas (1 correcta y 4 distractores plausibles) y la justificación de la respuesta correcta. El prompt enfatizará que las preguntas y los valores deben ser diferentes en cada ejecución para garantizar la variabilidad.
    *   **Salida:** Devolverá un objeto JSON con la lista de preguntas, listas para ser consumidas por el frontend.

### IA 2: Tutor de Retroalimentación y Análisis (Flow de Genkit)

1.  **Personalidad y Comportamiento de la IA:**
    *   **Analista Metódico:** La IA actuará como un tutor de matemáticas extremadamente lógico y metódico. Revisará sus propias respuestas y razonamientos al menos dos o tres veces antes de presentarlos, para minimizar errores.
    *   **Capacidad de Autocorrección:** Si un alumno cuestiona una corrección (ej: "Oye, me pusiste mal en la pregunta 3, pero busqué y este texto dice lo contrario"), la IA deberá ser capaz de procesar la evidencia del alumno. Analizará el texto o argumento proporcionado, lo comparará con su respuesta original y la justificación, y determinará cuál es la respuesta más acertada. Si se equivocó, deberá reconocerlo y proporcionar la corrección adecuada.

2.  **Creación del Flow (`retroalimentacionIAFlow`):**
    *   **Entrada:** Recibirá el contexto de un error del alumno: la pregunta, la respuesta incorrecta que seleccionó y la respuesta correcta.
    *   **Prompt para la IA:** Se le pedirá a la IA que actúe como un tutor experto. Deberá analizar por qué el alumno pudo haber elegido la respuesta incorrecta y proporcionar una explicación clara y paso a paso del concepto subyacente, guiándolo hacia la lógica de la respuesta correcta.
    *   **Integración:** En la página de resultados, para cada respuesta incorrecta, se llamará a este `flow` para mostrar una explicación personalizada y dinámica.

## Resumen Técnico

| Característica | Implementación Propuesta |
| :--- | :--- |
| **Página de Pruebas** | Nueva ruta y componentes de React en Next.js. |
| **Modalidades** | Opciones para 5, 15 o 40 preguntas. |
| **Generación de Contenido** | Flow de Genkit (`generadorDePruebasFlow`) que genera preguntas únicas. |
| **Almacenamiento de Respuestas** | Estado local de React durante la prueba. |
| **Visualización de Resultados** | Componente de React que muestra puntaje y revisión detallada. |
| **Retroalimentación de Errores**| Flow de Genkit (`retroalimentacionIAFlow`) para explicaciones personalizadas y con capacidad de análisis. |
| **Variabilidad** | Asegurada por la naturaleza generativa de la IA. |
| **Fiabilidad de la IA** | Prompts diseñados para un comportamiento metódico y con capacidad de autocorrección. |
