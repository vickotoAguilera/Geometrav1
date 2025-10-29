# Hoja de Ruta del Proyecto Geometra

Este documento resume la visión y el plan de desarrollo para la aplicación Geometra, según las directrices del usuario. Sirve como una guía para futuras implementaciones y para mantener la coherencia del proyecto.

## Visión General

El objetivo es crear una plataforma de aprendizaje de matemáticas con dos experiencias de asistencia por IA distintas, dependiendo del contexto del usuario:

1.  **Asistente Principal (Global y Persistente):** Un tutor general para resolver dudas, conectado a una base de datos para guardar el historial.
2.  **Asistente de Estudio (Local y Contextual):** Un ayudante específico para cada tema de estudio, cuya conversación es temporal y su conocimiento se limita al tema que el usuario está viendo.

---

## Fase 1: Creación del Contenido Base

El pilar de la plataforma son los materiales de estudio.

1.  **Recepción de Contenido:** El usuario (experto en la materia) proporcionará el contenido de estudio en formato PDF.
2.  **Creación de Archivos `.md`:** Yo (Gemini) analizaré cada PDF y lo transcribiré a un archivo Markdown (`.md`).
3.  **Estructuración y Marcadores de Página:** Durante la transcripción, añadiré títulos y marcadores que referencien la estructura del PDF original. **Ejemplo:** Si un ejercicio está en la página 8 del PDF, el `.md` contendrá un título como `## Página 8: Ejercicios del Teorema de Pitágoras`. Esto es crucial para que la IA de Estudio pueda localizar información específica.
4.  **Disponibilidad del PDF Original:** El usuario creará un Google Drive para almacenar los PDFs. En cada página de estudio generada a partir de un `.md`, se incluirá un enlace para que el alumno pueda descargar el PDF original completo, asegurando que el estudiante y la IA estén viendo el mismo contenido.

---

## Fase 2: Implementación del Sistema Dual de IA

Modificaremos el componente del chat para que adopte uno de dos comportamientos.

### Comportamiento A: Asistente Principal (Global)

*   **Activación:** Se activa en cualquier ruta que **NO** sea `/estudia/...` (ej. página de inicio, applet de GeoGebra).
*   **Persistencia:** La conversación se guarda y se lee desde **Firestore**. El historial es permanente y está asociado al usuario.
*   **Contexto:** El usuario puede subir sus propios archivos (PDFs, DOCX, imágenes) para dar contexto a sus preguntas.
*   **Estado Actual:** Es la funcionalidad que ya tenemos implementada.

### Comportamiento B: Asistente de Estudio (Local)

*   **Activación:** Se activa **únicamente** en las páginas de estudio (rutas `/estudia/...`).
*   **Persistencia:** La conversación **NO usa Firestore**. Es temporal y se maneja localmente en el estado del componente (React `useState`). El historial persiste si se cierra y abre el panel, pero se borra si se recarga la página.
*   **Contexto Automático y Fijo:**
    *   No hay opción para subir archivos.
    *   La IA es consciente del archivo `.md` de la página actual. Su conocimiento se limita estrictamente a ese contenido.
    *   Dentro de la página de estudio, un botón de "Ayuda" enviará un **mensaje predefinido y automático** a la IA para iniciar la conversación. **Ejemplo de mensaje:** *"Estoy viendo el tema 'Teorema de Pitágoras'. Ayúdame a entenderlo."* Esto le da a la IA el contexto inmediato del documento que el usuario está estudiando.

---

## Resumen Técnico

| Característica | Asistente Principal (Global) | Asistente de Estudio (Local) |
| :--- | :--- | :--- |
| **Rutas** | Todas, excepto `/estudia/...` | Solo en `/estudia/...` |
| **Base de Datos**| **Sí** (Firestore) | **No** (Estado local de React) |
| **Subir Archivos**| **Sí** | **No** |
| **Fuente de Contexto**| Archivos subidos por el usuario | Archivo `.md` de la página actual (automático) |
| **Persistencia** | Permanente | Temporal (sesión del navegador) |

---
