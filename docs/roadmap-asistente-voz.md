# Hoja de Ruta: Funcionalidades de Voz para el Asistente

Este documento describe el plan para implementar capacidades de Texto a Voz (Text-to-Speech, TTS) y Voz a Texto (Speech-to-Text, STT) en el asistente de IA de Geometra, haciendo la interacción más dinámica y accesible.

## Fase 1: Implementar Texto a Voz (TTS) - ¡Completado!

**Objetivo:** Permitir que los usuarios escuchen las respuestas del asistente de IA con una voz natural.

### Plan de Acción:

1.  **Crear el "Cerebro" de la Voz (Nuevo Flujo de Genkit):**
    *   **Archivo:** `src/ai/flows/tts-flow.ts`
    *   **Propósito:** Crear un flujo de Genkit que reciba una cadena de texto como entrada.
    *   **IA:** Utilizará un modelo especializado de Google (`gemini-2.5-flash-preview-tts`) para convertir ese texto en datos de audio.
    *   **Salida:** Devolverá el audio en un formato de Data URI (`data:audio/wav;base64,...`) que el navegador pueda reproducir.

2.  **Añadir Herramientas de Audio (`package.json`):**
    *   **Paquete:** Se añadirá la dependencia `wav` al proyecto.
    *   **Propósito:** Es una biblioteca necesaria para codificar correctamente el audio PCM que devuelve la IA al formato estándar WAV, asegurando la compatibilidad con todos los navegadores.

3.  **Crear el Puente de Comunicación (`tts-actions.ts`):**
    *   **Archivo:** `src/app/tts-actions.ts`
    *   **Propósito:** Crear una acción de servidor que actúe como un intermediario seguro entre la interfaz de usuario (el componente de React) y el flujo de Genkit.

4.  **Modificar la Interfaz del Chat (`chat-assistant.tsx`):**
    *   **Añadir un botón:** Se agregará un icono de altavoz (🔊) junto a cada mensaje generado por la IA.
    *   **Manejar el estado de reproducción:** Se implementará una lógica (`useState`) para controlar qué mensaje se está reproduciendo o cargando.
    *   **Llamada a la acción:** Al hacer clic en el botón de altavoz, el componente llamará a la nueva acción de servidor, enviándole el texto del mensaje.
    *   **Reproducción de audio:** Cuando la acción devuelva el Data URI del audio, se usará una etiqueta `<audio>` invisible para reproducirlo automáticamente. Se mostrará un indicador de carga mientras se espera la respuesta.

5.  **Registrar el Nuevo Flujo (`dev.ts`):**
    *   **Archivo:** `src/ai/dev.ts`
    *   **Propósito:** Se añadirá la importación del nuevo flujo `tts-flow.ts` para que el entorno de desarrollo de Genkit lo reconozca.

---

## Fase 2: Implementar Voz a Texto (STT) - Pendiente

**Objetivo:** Permitir que los usuarios hablen directamente al asistente en lugar de escribir sus preguntas.

### Plan de Acción Propuesto:

1.  **Utilizar la Web Speech API del Navegador:**
    *   No se requiere una nueva IA en el backend para la transcripción. Se aprovechará la API `SpeechRecognition` que ya está integrada en la mayoría de los navegadores modernos (Chrome, Edge, etc.).

2.  **Modificar la Interfaz del Chat (`chat-assistant.tsx`):**
    *   **Añadir un botón de micrófono (🎤):** Se agregará un icono de micrófono en la barra de entrada de texto.
    *   **Gestionar permisos:** La primera vez que se use, el navegador pedirá permiso al usuario para acceder al micrófono.
    *   **Iniciar y detener la grabación:** Al hacer clic en el botón, se iniciará la escucha. El componente capturará el audio y lo transcribirá a texto en tiempo real.
    *   **Actualizar el campo de texto:** El texto transcrito se insertará automáticamente en el `Input` donde el usuario escribe sus preguntas.
    *   **Enviar la pregunta:** El usuario podrá revisar el texto transcrito y presionar "Enviar" de la forma habitual.
