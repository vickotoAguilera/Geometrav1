export const contexto = `
# CONTEXTO CONSOLIDADO: MÓDULO 1.1 - LA RAMPA (TUTOR GEOGEBRA)

Este documento contiene los pasos para resolver los ejercicios del Módulo 1.1 usando las herramientas visuales de GeoGebra.

---
### SITUACIÓN DEL PROBLEMA
Se necesita construir una rampa con una **distancia horizontal de 10 metros** y un **ángulo de inclinación de 12°**. Debemos encontrar la altura (N) y la longitud de la rampa (H) usando GeoGebra.

---
### GUÍA DE PASOS EN GEOGEBRA

**Paso 1: Dibujar la Base de la Rampa**
- **Comando:** \`Segmento((0,0), (10,0))\`
- **Explicación para el usuario:** "Para empezar, vamos a dibujar la base horizontal de 10 metros. Escribe en la entrada: \`Segmento((0,0), (10,0))\`. Esto creará la distancia horizontal."

**Paso 2: Crear el Ángulo de Inclinación**
- **Comando:** \`ÁnguloDadaSuAmplitud(B, A, 12°)\` (asumiendo que los puntos son A=(0,0) y B=(10,0)).
- **Explicación para el usuario:** "¡Perfecto! Ahora necesitamos crear el ángulo de 12°. Usa el comando \`ÁnguloDadaSuAmplitud(B, A, 12°)\`. Esto creará un nuevo punto C' que nos da la dirección correcta."

**Paso 3: Trazar la Hipotenusa (La Rampa)**
- **Comando:** \`Semirrecta(A, C')\`
- **Explicación para el usuario:** "Ahora traza una línea desde el inicio (punto A) que pase por el nuevo punto que se creó. Usa el comando \`Semirrecta(A, C')\`."

**Paso 4: Trazar la Altura**
- **Comando:** \`Perpendicular(B, EjeX)\`
- **Explicación para el usuario:** "Para encontrar la altura, necesitamos una línea vertical al final de la base. Escribe \`Perpendicular(B, EjeX)\`."

**Paso 5: Encontrar el Vértice Superior**
- **Comando:** \`Interseca(f, g)\` (donde \`f\` y \`g\` son los nombres que GeoGebra le dio a la semirrecta y a la perpendicular).
- **Explicación para el usuario:** "El punto donde se cruzan la línea de la rampa y la línea de la altura es el vértice superior. Usa el comando \`Interseca(f, g)\` para marcar ese punto. Se llamará C."

**Paso 6: Medir y Resolver los Ejercicios**
- **Comando 1 (para la Altura):** \`Distancia(B, C)\`
- **Explicación Ejercicio 1:** "¡Ya casi! Para encontrar la altura de la rampa (N), solo mide la distancia entre el punto B y el nuevo punto C. Usa el comando \`Distancia(B, C)\`. **¿Qué valor te muestra GeoGebra?**" (Debería ser aprox. 2.13)
- **Comando 2 (para la Longitud):** \`Distancia(A, C)\`
- **Explicación Ejercicio 2:** "Ahora, para la longitud de la rampa (H), mide la distancia entre el punto A y el punto C. Usa el comando \`Distancia(A, C)\`. **¿Cuál es el resultado?**" (Debería ser aprox. 10.22)

**Paso Final:**
- **Explicación de cierre:** "¡Excelente! Has construido la rampa y encontrado los valores usando solo las herramientas de GeoGebra. Ya puedes volver a la página del ejercicio a ingresar tus respuestas. [button:Volver al Ejercicio]"
`;
