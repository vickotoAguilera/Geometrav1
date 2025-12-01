# MANUAL DE CONSTRUCCIÓN: Módulos de Ejercicios Interactivos

Este documento es la guía maestra para construir cualquier página de ejercicios interactivos en "Geometra". Su propósito es asegurar que todos los módulos sigan el mismo patrón estructural, funcional y de diseño.

## **Visión General: El Patrón de Módulos**

Cada página de ejercicios (ej: "La Rampa", "Ángulos y Razones") se concibe como un **contenedor principal (`<Card>`)** que alberga una serie de **ejercicios individuales**. Cada uno de estos ejercicios es un **acordeón desplegable (`<AccordionItem>`)** que funciona como una unidad autocontenida de aprendizaje, con tres elementos clave:

1.  **El Enunciado:** La pregunta o el contexto del problema.
2.  **La Interacción:** Un campo para que el usuario responda y un sistema para verificar si su respuesta es correcta.
3.  **La Ayuda Contextual:** Un tutor de IA especializado que solo sabe sobre ese ejercicio específico.

---

## **Paso 0: Mi Rol - Procesamiento de Materiales (Tu Asistente IA)**

Antes de que yo pueda construir la página, necesito que me proporciones los materiales. Esto es lo que hago con ellos:

1.  **Análisis del PDF:** Desgloso tu PDF en actividades lógicas (Actividad 1, Actividad 2, etc.).
2.  **Creación de Archivos de Contexto (`.ts`):** Para cada tutor (Calculadora y GeoGebra) de cada módulo, creo un archivo TypeScript (ej: `la-rampa/tutor-calculadora/consolidado.ts`). En este archivo, transcribo las instrucciones, la lógica y las respuestas correctas. **Este es el "cerebro" que le doy a la IA.**
3.  **Gestión de Imágenes:** Todas las imágenes que me proporcionas para un módulo las coloco en la carpeta `public/imagenes-ejercicios/` para que sean accesibles públicamente desde la aplicación.

---

## **Paso 1: La Estructura Base de la Página (el archivo `page.tsx`)**

Toda página de ejercicios se construye con la siguiente estructura JSX:

```jsx
// src/app/funciones-y-matrices/trigonometria/ejercicios/NOMBRE_MODULO/page.tsx
'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from "@/components/ui/accordion";
// ... otras importaciones necesarias

export default function PaginaDeModulo() {
    // Aquí irán los 'useState' y la lógica de la página

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4">
                {/* Título y Descripción del Módulo */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold">Módulo X.X: Nombre del Módulo</h1>
                    <p className="text-lg text-muted-foreground mt-4">Descripción breve.</p>
                </div>

                {/* El Contenedor Principal de Ejercicios */}
                <div className="max-w-4xl mx-auto space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Título de la Sección (ej: Guía Interactiva)</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="multiple" className="w-full">
                                {/* AQUÍ VAN LOS EJERCICIOS INDIVIDUALES */}
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
```

---

## **Paso 2: El Corazón del Módulo - El Ejercicio Individual**

Cada ejercicio es un `<AccordionItem>`. Este es el patrón que se debe replicar para cada actividad.

```jsx
// Dentro del <Accordion>

<AccordionItem value="id-unico-del-ejercicio-1">
    <AccordionTrigger>
        <h3 className="text-lg font-semibold text-left">
            {/* Título de la pregunta */}
            **Actividad 1:** ¿Cuál es la respuesta a este ejercicio?
        </h3>
    </AccordionTrigger>
    <AccordionContent>
        {/* 1. EL ENUNCIADO */}
        <div className="prose prose-invert max-w-none text-muted-foreground mb-4">
            <p>Aquí va la explicación del ejercicio.</p>
            {/* Si hay imagen, se usa este componente */}
            <MarkdownImage src="/imagenes-ejercicios/ruta/a/la/imagen.png" alt="Descripción de la imagen" />
        </div>

        {/* 2. LA INTERACCIÓN (Para preguntas conceptuales o de texto) */}
        <ButtonVerificarConceptual
            key="id-unico-del-ejercicio-1"
            ejercicio={{ 
                id: 'id-unico-del-ejercicio-1',
                pregunta: '**Actividad 1:** ¿Cuál es la respuesta...?', 
                respuestaCorrecta: 'LaRespuestaExacta' 
            }}
        />

        {/* 3. LA AYUDA CONTEXTUAL (El Tutor IA) */}
        <div className="flex justify-end pt-4 mt-6 border-t">
            {/* Si es un ejercicio de GeoGebra */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <Bot className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-screen h-screen ...">
                    <GeogebraIntegrado
                        ejercicioId="ruta/al/contexto-geogebra.ts"
                        grupoId="grupo-unico-para-este-ejercicio"
                        enunciado={/* El mismo JSX del enunciado de arriba */}
                    />
                </DialogContent>
            </Dialog>

            {/* Si es un ejercicio de Calculadora/Teórico */}
            <AyudaContextual
                ejercicioId="ruta/al/contexto-calculadora.ts"
                groupId="grupo-unico-para-este-ejercicio"
                onTeoricoToggle={() => handleTeoricoToggle('grupo-unico')}
                isTeoricoOpen={activeTeorico === 'grupo-unico'}
                tutorType="calculadora"
            />
        </div>
        {activeTeorico === 'grupo-unico' && (
            <EjercicioInteractivo groupId="grupo-unico" contextFileName="ruta/al/contexto-calculadora.ts" />
        )}
    </AccordionContent>
</AccordionItem>
```

---

## **Paso 3: Manejo de Tablas Interactivas**

Si una actividad requiere completar una tabla (como en "La Rampa"), se sigue un patrón ligeramente diferente.

1.  **Crear el Componente de la Tabla:** En `src/components/ejercicio-interactivo.tsx`, se crea un componente específico para esa tabla (ej: `TablaActividad1`). Este componente manejará:
    *   El estado (`useState`) de las respuestas de cada celda.
    *   La lógica del botón "Verificar Tabla", que llama a una Server Action (`verificador-tablas-actions.ts`).
    *   El botón para activar el Tutor Teórico.

2.  **Lógica del Verificador de Tablas:**
    *   El `verificador-tablas-flow.ts` NO usa un modelo de lenguaje. Es un flujo lógico que compara las respuestas del usuario con un objeto de soluciones correctas predefinidas. Esto es más rápido y 100% preciso.

3.  **Integración en la Página:**
    *   En lugar del `<ButtonVerificarConceptual>`, se llama directamente al componente de la tabla (ej: `<TablaActividad1 />`) dentro del `<AccordionContent>`.

---

Este manual asegura que, independientemente del contenido específico de cada módulo, la estructura, la experiencia de usuario y la forma en que interactuamos con las IAs contextuales se mantengan consistentes y robustas en toda la aplicación.