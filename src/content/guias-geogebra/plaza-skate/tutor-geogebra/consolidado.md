# CONTEXTO CONSOLIDADO: MÓDULO 1.0 (TUTOR GEOGEBRA)

Este documento contiene las instrucciones y comandos específicos de GeoGebra para resolver los ejercicios del Módulo 1.0.

---
### EJERCICIO 1: VERIFICACIÓN DEL TEOREMA DEL ÁNGULO CENTRAL

**Objetivo:** Usar las herramientas de GeoGebra para demostrar visualmente que el ángulo central es el doble del inscrito.

**Guía de Pasos en GeoGebra:**

1.  **Crear la circunferencia:**
    -   Usa la herramienta `Circunferencia (Centro, Punto)` para dibujar un círculo. El centro se llamará `O`.
2.  **Crear los puntos:**
    -   Usa la herramienta `Punto en Objeto` para crear tres puntos (A, B, C) sobre la circunferencia.
    -   Asegúrate de que `A`, `O` y `B` estén alineados para que `AB` sea un diámetro. Esto te ayudará a visualizar mejor.
3.  **Medir el ángulo inscrito:**
    -   Usa la herramienta `Ángulo`.
    -   Haz clic en los puntos `A`, `C` y `B` en ese orden. GeoGebra mostrará la medida del ángulo `∠ACB`.
    -   Arrastra el punto `C` hasta que el ángulo mida `20°`.
4.  **Medir el ángulo central:**
    -   Usa de nuevo la herramienta `Ángulo`.
    -   Haz clic en los puntos `A`, `O` y `C` en ese orden. GeoGebra mostrará la medida del ángulo `∠AOC`.
5.  **Verificación:**
    -   Observa en la Vista Algebraica que la medida del ángulo central es `40°`, exactamente el doble de `20°`.

**Comandos útiles de la barra de Entrada:**
-   `Circunferencia((0,0), 3)` crea una circunferencia con centro en el origen y radio 3.
-   `Punto(c)` crea un punto sobre una circunferencia llamada `c`.
-   `Ángulo(A, C, B)` mide el ángulo con vértice en C.

---
### EJERCICIO 2: CONVERSIÓN A RADIANES EN GEOGEBRA

**Objetivo:** Usar GeoGebra para convertir un ángulo de grados a radianes.

**Guía de Pasos en GeoGebra:**

1.  **Crear un deslizador de ángulo:**
    -   Selecciona la herramienta `Deslizador`.
    -   En la ventana de configuración, elige la opción `Ángulo`.
    -   Nombra al deslizador `α` (puedes seleccionarlo del menú de símbolos).
    -   Ajusta el rango de 0° a 360°.
2.  **Visualizar el valor en radianes:**
    -   En la barra de `Entrada`, simplemente escribe la letra del deslizador, en este caso: `α`.
    -   Presiona Enter. GeoGebra creará una nueva variable (por ejemplo, `a`) que mostrará el valor del ángulo del deslizador pero convertido automáticamente a radianes.
3.  **Comprobar la equivalencia:**
    -   Mueve el deslizador `α` hasta que marque `180°`.
    -   Observa la variable `a` en la Vista Algebraica. Debería mostrar el valor aproximado de `π` (3.14...).
4.  **Calcular para 40°:**
    -   Mueve el deslizador hasta `40°`.
    -   Observa el valor de la variable `a`. Será aproximadamente `0.698`.
    -   También puedes escribir en la Entrada: `(40° * pi) / 180°` y verás que el resultado es el mismo.

**Comando útil de la barra de Entrada:**
-   `40°` (escribir el símbolo de grado) para que GeoGebra entienda que estás trabajando en esa unidad.
