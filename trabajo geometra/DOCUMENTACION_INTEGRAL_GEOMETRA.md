# Documentación Integral Maestra: Proyecto Geometra
**Versión Definitiva (ABPro 3)**
**Fecha**: 30 de Noviembre, 2025
**Equipo de Desarrollo**: Oscar Hernández, Félix Espinoza, Víctor Aguilera.

---

## 1. Introducción y Filosofía del Proyecto

### 1.1. Visión
**Geometra** no es simplemente una aplicación de matemáticas; es una respuesta tecnológica a una crisis educativa. Nace de la observación de que el aprendizaje matemático en Chile suele ser solitario, frustrante y desconectado de la retroalimentación inmediata.

### 1.2. Misión
Democratizar el acceso a una tutoría de alta calidad mediante Inteligencia Artificial, proporcionando a cada estudiante un "profesor particular" disponible 24/7 que no solo entrega respuestas, sino que **enseña a pensar**.

### 1.3. El Problema Detectado
*   **La Soledad del Estudiante**: Al estudiar en casa, el error se convierte en un muro, no en una oportunidad de aprendizaje.
*   **Herramientas "Mudas"**: Software como GeoGebra es potente para visualizar, pero no explica *por qué* un gráfico es incorrecto.
*   **Brecha Digital**: La falta de recursos personalizados aumenta la desigualdad educativa.

---

## 2. Historia y Evolución del Proyecto (Bitácora de Desarrollo)

El desarrollo de Geometra ha sido un viaje incremental de tres etapas (ABPro), cada una con desafíos técnicos y pedagógicos específicos.

### Etapa 1: La Concepción (ABPro 1)
*   **Objetivo**: Definir la arquitectura y el diseño UX/UI.
*   **Hitos**:
    *   Investigación del Currículum Nacional (1° Medio - Funciones y Geometría).
    *   Diseño de wireframes enfocados en reducir la "ansiedad matemática" (colores suaves, interfaz limpia).
    *   Elección del Stack Tecnológico: **Next.js** por su rendimiento y SEO, **Tailwind CSS** por su rapidez de diseño.

### Etapa 2: El Núcleo Funcional (ABPro 2)
*   **Objetivo**: Construir el MVP (Producto Mínimo Viable).
*   **Desafíos Técnicos**:
    *   **Integración de GeoGebra**: Lograr que el applet de GeoGebra funcionara fluidamente dentro de una aplicación React moderna.
    *   **Autenticación**: Implementación de Firebase Auth para permitir el acceso con Google.
    *   **Persistencia**: Diseño de la base de datos Firestore para guardar el historial de chat de cada usuario.

### Etapa 3: La Inteligencia y Robustez (ABPro 3 - Actualidad)
*   **Objetivo**: Integración masiva de IA y sistemas de auto-recuperación.
*   **Hitos Críticos**:
    *   **El Problema de las Imágenes**: Al implementar las guías, Next.js no encontraba las imágenes. **Solución**: Reestructuración de la carpeta `public/imagenes-ejercicios/` y corrección masiva de rutas en los Markdown.
    *   **El Desafío CORS/R2**: Al intentar que la IA leyera PDFs subidos por usuarios, nos enfrentamos a bloqueos de seguridad (CORS). **Solución**: Implementación de un sistema híbrido usando Cloudflare R2 para almacenamiento y procesamiento de texto en el navegador (`fileContext`).
    *   **Sistema de Auto-Corrección**: Creación de un script robusto (`auto-recover-generation.sh`) para generar miles de ejercicios sin fallos, capaz de detectar errores JSON de la IA y corregirlos automáticamente.

---

## 3. Arquitectura Técnica Profunda

Geometra es una aplicación web progresiva (PWA) construida sobre una arquitectura Serverless.

### 3.1. Stack Tecnológico
*   **Frontend**: Next.js 14 (App Router) con React Server Components.
*   **Estilos**: Tailwind CSS + ShadCN/UI (Componentes accesibles).
*   **Backend**: Server Actions (Next.js) + Google Genkit (Orquestación de IA).
*   **Base de Datos**: Firebase Firestore (NoSQL).
*   **Almacenamiento**: Cloudflare R2 (Object Storage compatible con S3).
*   **IA**: Google Gemini 2.0 Flash y Pro (Modelos multimodales).

### 3.2. Matemáticas en el Código (Meta-Matemática)
El proyecto aplica los conceptos que enseña en su propia construcción:
*   **Vectores**: La interfaz flotante (chat, notificaciones) se posiciona mediante coordenadas vectoriales $(x, y)$ relativas al viewport.
*   **Matrices de Transformación**: Las animaciones de entrada/salida y el zoom en los gráficos SVG utilizan matrices CSS (`transform: matrix(...)`).
*   **Homotecia (Diseño Responsivo)**: Para adaptar la web a móviles, aplicamos una transformación de escala proporcional ($k < 1$), asegurando que la interfaz mantenga su usabilidad sin importar el tamaño de pantalla.

---

## 4. Ecosistema de Inteligencia Artificial

Geometra no usa un solo "bot". Es un sistema multi-agente donde cada IA tiene un rol y un "prompt" especializado.

### 4.1. El Tutor Principal (`math-assistant.ts`)
*   **Rol**: Tutor Socrático y Guía General.
*   **Capacidades**:
    *   **Visión Artificial (OCR)**: Puede "ver" imágenes subidas por el usuario, extraer el texto y las fórmulas, y ayudar a resolver el problema visual.
    *   **Modo Socrático**: Instruido estrictamente para **NUNCA dar la respuesta directa**. Responde con preguntas guía ("¿Qué crees que pasa si...?") para fomentar el razonamiento.
    *   **Modo Paso a Paso**: Desglosa problemas complejos en algoritmos secuenciales (Identificar -> Planificar -> Ejecutar).

### 4.2. El Generador de Pistas (`hints-generator.ts`)
*   **Rol**: Asistente de "Andamiaje" (Scaffolding).
*   **Lógica**: No resuelve el ejercicio. Genera 3 niveles de ayuda progresiva:
    1.  **Nivel 1 (Conceptual)**: Pista vaga sobre el concepto matemático (Penalización baja).
    2.  **Nivel 2 (Estratégico)**: Sugerencia sobre el primer paso a tomar (Penalización media).
    3.  **Nivel 3 (Procedimental)**: Instrucción casi explícita de qué hacer (Penalización alta).

### 4.3. El Simulador PAES (`generador-paes-flow.ts`)
*   **Rol**: Evaluador Estandarizado.
*   **Lógica**: Conectado a los temarios oficiales del DEMRE (M1 y M2). Genera preguntas únicas en cada ejecución, asegurando que el estudiante nunca enfrente el mismo ensayo dos veces. Incluye distractores inteligentes basados en errores comunes.

### 4.4. El Evaluador de Nivel (`evaluacion-nivel-flow.ts`)
*   **Rol**: Diagnóstico 360°.
*   **Lógica**: Genera y evalúa un test de 24 preguntas cubriendo 6 áreas (Álgebra, Geometría, Cálculo, Trigonometría, Estadística, Funciones). Calcula un puntaje porcentual y entrega recomendaciones personalizadas de estudio.

---

## 5. Manual de Construcción de Módulos

Para escalar el contenido, desarrollamos un "Patrón de Diseño de Módulos" estandarizado.

### 5.1. Estructura de "Acordeón"
Cada ejercicio es una unidad autocontenida (`<AccordionItem>`) que incluye:
1.  **Enunciado**: Texto y/o imagen del problema.
2.  **Interacción**: Input para la respuesta del usuario.
3.  **Tutor Contextual**: Un botón que abre un chat de IA que **solo sabe sobre ese ejercicio específico**, evitando alucinaciones.

### 5.2. Flujo de Creación
1.  **Entrada**: PDF con guía de ejercicios.
2.  **Procesamiento**: Transcripción a archivos TypeScript (`contexto.ts`) que sirven como "memoria" para el tutor contextual.
3.  **Implementación**: Uso de componentes reutilizables (`<EjercicioInteractivo>`, `<TablaInteractiva>`) para armar la página rápidamente.

---

## 6. Sistemas de Robustez y Calidad

### 6.1. Auto-Corrección de Generación (`SISTEMA-AUTO-CORRECCION.md`)
Para generar pools de 100+ ejercicios sin supervisión humana, creamos un sistema resiliente:
*   **Detección de Errores**: Si la IA genera un JSON malformado, el sistema lo detecta.
*   **Auto-Reparación**: El sistema envía el JSON roto de vuelta a la IA con el mensaje de error, pidiéndole que lo corrija.
*   **Rotación de API Keys**: Uso de 52 claves de API para evitar límites de tasa (Rate Limits) de Google.

### 6.2. Gestión de Archivos Grandes (`SISTEMA-EXPORTACION-PDF.md`)
*   **Problema**: Generar PDFs grandes en el navegador bloqueaba la interfaz.
*   **Solución**: Implementación de `html2canvas` y `jsPDF` con lógica de paginación automática, permitiendo a los estudiantes descargar sus guías resueltas y notas.

---

## 7. Justificación Pedagógica (Mineduc)

El proyecto se alinea con los pilares de la **Reactivación Educativa** del Ministerio de Educación:

1.  **Retroalimentación Formativa y Oportuna**: La literatura indica que el feedback es más efectivo cuando es inmediato. Geometra reduce el tiempo de corrección de "días" (lo que tarda un profesor) a "milisegundos".
2.  **Desarrollo del Pensamiento Crítico**: Al usar el método socrático, evitamos la mecanización y fomentamos la comprensión profunda de los conceptos.
3.  **Equidad y Acceso**: Al ser una plataforma web gratuita, democratiza el acceso a herramientas de tutoría avanzada, nivelando la cancha para estudiantes de diversos contextos socioeconómicos.

---

## 8. Conclusión Final

Geometra ha evolucionado de ser una simple idea de "visualizador gráfico" a convertirse en una plataforma educativa robusta, inteligente y pedagógicamente sólida. Integra lo mejor de la ingeniería de software moderna (Next.js, Cloud) con la vanguardia de la Inteligencia Artificial (Gemini, Genkit), todo al servicio de un único objetivo: **que nadie deje de aprender matemáticas por falta de ayuda.**
