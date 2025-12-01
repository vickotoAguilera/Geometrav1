# Hoja de Ruta: Asistente con Análisis de Imágenes (OCR)

Este documento describe el plan para mejorar la capacidad de análisis del "Asistente Geometra", permitiéndole actuar como un sistema de reconocimiento óptico de caracteres (OCR) y de visión artificial antes de interactuar con el usuario.

## 1. Objetivo Principal

Modificar el comportamiento del Asistente Geometra para que, cuando reciba una imagen, no intente resolver el problema de inmediato. En su lugar, deberá:

1.  **Analizar y Describir:** Extraer y describir todo el contenido visible en la imagen (texto, fórmulas, figuras geométricas, etc.).
2.  **Presentar el Análisis:** Mostrarle al usuario un resumen de lo que ha "leído" y "visto" en la imagen.
3.  **Esperar Instrucciones:** Preguntar al usuario cuál es su duda específica basándose en la descripción proporcionada, cediéndole el control de la conversación.

## 2. Plan de Acción Técnico

La implementación se centrará en modificar el "cerebro" del asistente, que se encuentra en su flujo de Genkit.

### Archivo a Modificar:

*   `src/ai/flows/math-assistant.ts`

### Lógica del Cambio:

Se editará la variable `mathTutorSystemPrompt` dentro del archivo para añadir una nueva regla de comportamiento prioritaria. La nueva instrucción especificará el siguiente protocolo para cuando se reciba una imagen:

1.  **Prioridad 1 (Rol OCR):** Se le ordenará a la IA que su primera acción sea describir el contenido de la imagen de manera exhaustiva.
2.  **Prioridad 2 (Rol Pasivo):** Se le prohibirá resolver o interpretar el problema en su primera respuesta.
3.  **Prioridad 3 (Rol Interactivo):** Se le indicará que debe finalizar su análisis con una pregunta abierta al usuario, invitándolo a formular su consulta a partir de la descripción ya hecha.

Este cambio transformará a la IA de un "solucionador" a un "analista" que colabora con el usuario para entender el contexto antes de actuar.
