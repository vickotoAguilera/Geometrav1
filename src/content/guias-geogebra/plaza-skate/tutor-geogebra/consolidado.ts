export const contexto = `
# CONTEXTO CONSOLIDADO: MÓDULO 1.0 (TUTOR GEOGEBRA)

Este documento contiene las instrucciones y comandos específicos de GeoGebra para resolver los ejercicios del Módulo 1.0.

---
### EJERCICIO 1: VERIFICACIÓN VISUAL DEL TEOREMA DEL ÁNGULO CENTRAL

**Objetivo:** Usar las herramientas de GeoGebra para **demostrar visualmente** que el ángulo central es el doble del inscrito, sin necesidad de cálculos manuales.

**Guía de Pasos en GeoGebra:**

1.  **Crear la circunferencia:**
    -   Usa la herramienta \`Circunferencia (Centro, Punto)\` para dibujar un círculo. El centro se llamará \`O\`.
2.  **Crear los puntos:**
    -   Usa la herramienta \`Punto en Objeto\` para crear tres puntos (A, B, C) sobre la circunferencia.
    -   Asegúrate de que \`A\`, \`O\` y \`B\` estén alineados para que \`AB\` sea un diámetro. Esto te ayudará a visualizar mejor.
3.  **Medir el ángulo inscrito (el de la cámara en el borde):**
    -   Usa la herramienta \`Ángulo\`.
    -   Haz clic en los puntos \`A\`, \`C\` y \`B\` en ese orden. GeoGebra mostrará la medida del ángulo \`∠ACB\`.
    -   Arrastra el punto \`C\` con el mouse hasta que el ángulo mida exactamente \`20°\`.
4.  **Medir el ángulo central (el que buscamos):**
    -   Usa de nuevo la herramienta \`Ángulo\`.
    -   Haz clic en los puntos \`A\`, \`O\` y \`C\` en ese orden. GeoGebra mostrará la medida del ángulo \`∠AOC\`.
5.  **Verificación Final:**
    -   Observa en la Vista Algebraica o sobre el mismo dibujo. Verás que cuando el ángulo inscrito es \`20°\`, el ángulo central automáticamente mide \`40°\`. ¡El doble exacto!

**Comandos útiles (alternativa para la barra de Entrada):**
-   \`Circunferencia((0,0), 3)\` crea un círculo con centro en el origen y radio 3.
-   \`Punto(c)\` crea un punto sobre una circunferencia llamada \`c\`.
-   \`Ángulo(A, C, B)\` mide el ángulo con vértice en C.

---
### EJERCICIO 2: CONVERSIÓN A RADIANES EN GEOGEBRA

**Objetivo:** Usar GeoGebra para **entender visualmente** la equivalencia entre grados y radianes.

**Guía de Pasos en GeoGebra:**

1.  **Crear un deslizador de ángulo:**
    -   Selecciona la herramienta \`Deslizador\`.
    -   En la ventana de configuración, elige la opción \`Ángulo\`.
    -   Nómbralo \`α\` (puedes seleccionarlo del menú de símbolos).
    -   Deja el rango por defecto, de 0° a 360°.
2.  **Visualizar el valor en radianes (el truco):**
    -   Ahora, ve a la barra de \`Entrada\` y simplemente escribe la letra del deslizador, en este caso: \`α\`.
    -   Presiona Enter. GeoGebra creará una nueva variable (probablemente la llamará \`a\`) que muestra el valor del ángulo, pero convertido automáticamente a radianes.
3.  **Comprobar la equivalencia clave:**
    -   Mueve el deslizador \`α\` hasta que marque \`180°\`.
    -   Observa la variable \`a\` en la Vista Algebraica. Debería mostrar el valor aproximado de \`π\` (3.14...). ¡Esa es la relación fundamental!
4.  **Calcular para 40°:**
    -   Mueve el deslizador hasta \`40°\`.
    -   Observa el valor de la variable \`a\`. Será aproximadamente \`0.698\`.
    -   **Para comprobar (más rápido en calculadora):** La fórmula es \`radianes = (grados * π) / 180°\`. Si calculas \`(40 * 3.1416) / 180\`, obtendrás el mismo resultado. GeoGebra nos ayuda a visualizarlo, pero para el cálculo, una calculadora es más directa.
`;
