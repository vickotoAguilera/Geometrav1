# Hoja de Ruta: Mejoras para el Módulo de Ensayo Interactivo

Este documento detalla el plan de acción para implementar una serie de mejoras de usabilidad y funcionalidad en el componente `ensayo-interactivo.tsx`, con el objetivo de crear una experiencia de prueba más intuitiva y robusta.

## 1. Panel de Navegación de Preguntas (El Mapa del Ensayo)

**Objetivo:** Proporcionar al estudiante un resumen visual e interactivo de todo el ensayo.

### Implementación:

-   **Ubicación:** Se añadirá un nuevo componente visual (un panel o "caja") justo encima del enunciado de la pregunta actual.
-   **Estructura:** Dentro de este panel, se mostrará una cuadrícula con botones numerados, representando cada una de las preguntas del ensayo (1, 2, 3, ...).
-   **Funcionalidad Principal:** Cada botón numérico será clicable, permitiendo al usuario navegar directamente a cualquier pregunta del ensayo con un solo clic.

## 2. Sistema de Banderas para Revisión (Marcar para Después)

**Objetivo:** Permitir al estudiante marcar preguntas sobre las que tiene dudas para revisarlas fácilmente más tarde.

### Implementación:

-   **Nuevo Estado:** Se creará un nuevo estado en el componente para almacenar un listado de los números de las preguntas que han sido marcadas.
-   **Botón de Bandera:** Se agregará un ícono de bandera (`Flag` de Lucide) junto al título de cada pregunta (ej. "Pregunta 5 de 15").
-   **Lógica del Botón:**
    -   Al hacer clic en la bandera, el número de la pregunta se añadirá al listado de "marcadas". El ícono se iluminará de **color amarillo**.
    -   Al volver a hacer clic, la pregunta se desmarcará y el ícono volverá a su color normal.

## 3. Indicadores Visuales de Estado (Código de Colores)

**Objetivo:** Integrar el estado de cada pregunta (sin responder, respondida, marcada) directamente en el panel de navegación.

### Implementación:

Los botones numéricos en el panel de navegación cambiarán de color según el estado de la pregunta correspondiente:

-   **Estilo por Defecto (Gris/Contorno):** Para preguntas que aún no han sido respondidas.
-   **Estilo Marcado (Amarillo):** Para preguntas que el usuario ha marcado con la bandera y que aún no ha respondido.
-   **Estilo Respondido (Azul/Primario):** Para preguntas que ya tienen una respuesta. **Este estado tendrá prioridad visual sobre el estado "marcado"**.

## 4. Lógica de Finalización Inteligente

**Objetivo:** Evitar que el estudiante finalice el ensayo por accidente sin haber respondido todo, dándole control sobre la decisión final.

### Implementación:

-   **Modificación del Botón "Terminar Prueba":** El botón ya no se deshabilitará.
-   **Mecanismo de Alerta:** Al hacer clic en "Terminar Prueba", el sistema primero comprobará si existen preguntas sin responder.
    -   **Si todas están respondidas:** Se procede a la revisión con normalidad.
    -   **Si faltan respuestas:** Se mostrará un cuadro de diálogo (`AlertDialog`) con el siguiente mensaje: *"Hay preguntas sin responder. Si continúas, se contarán como incorrectas. ¿Deseas finalizar la prueba de todas formas?"*
-   **Opciones del Diálogo:**
    1.  **"Volver a la prueba":** Cierra el aviso y permite al estudiante seguir respondiendo.
    2.  **"Finalizar de todas formas":** Envía la prueba a revisión. Las preguntas en blanco serán evaluadas como incorrectas y se generará la retroalimentación correspondiente.
