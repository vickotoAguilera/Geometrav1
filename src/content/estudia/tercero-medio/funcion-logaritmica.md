---
title: 'Función Logarítmica'
description: 'La función inversa de la exponencial, clave para modelar fenómenos que cambian en escala.'
---

## ¿Qué es la Función Logarítmica?

La función logarítmica es la **función inversa** de la función exponencial. Mientras la exponencial calcula una potencia, la logarítmica encuentra el exponente.

Su forma general es:

`f(x) = log_b(x)`

Donde:
- **b** es la base (debe ser un número positivo y distinto de 1).
- **x** es el argumento (debe ser siempre un número positivo, `x > 0`).

La gráfica de la función logarítmica es una curva que crece (o decrece) muy rápidamente al principio y luego se ralentiza.

## Propiedades Clave

1.  **Dominio y Recorrido:**
    - El dominio son todos los números reales positivos (`x > 0`). No puedes calcular el logaritmo de un número negativo o de cero.
    - El recorrido son todos los números reales.

2.  **Crecimiento y Decrecimiento:**
    - Si la base `b > 1`, la función es **creciente**.
    - Si `0 < b < 1`, la función es **decreciente**.

3.  **Puntos Notables:**
    - Siempre pasa por el punto `(1, 0)`, porque `log_b(1) = 0` para cualquier base `b`.
    - Es una reflexión de la función exponencial `g(x) = b^x` respecto a la recta `y = x`.

## Ejemplo Práctico

Analicemos la función `f(x) = log₂(x)`.

**Pregunta:** ¿Cuál es el valor de la función cuando `x = 8` y cuando `x = 1`?

1.  **Calculamos para x = 8:**
    - `f(8) = log₂(8)`
    - Nos preguntamos: ¿A qué exponente debemos elevar 2 para obtener 8?
    - `2³ = 8`, por lo tanto, `f(8) = 3`. El punto es `(8, 3)`.

2.  **Calculamos para x = 1:**
    - `f(1) = log₂(1)`
    - Nos preguntamos: ¿A qué exponente debemos elevar 2 para obtener 1?
    - `2⁰ = 1`, por lo tanto, `f(1) = 0`. El punto es `(1, 0)`.

**En GeoGebra:** Puedes escribir `f(x) = log(2, x)` para graficar la función con base 2 y verificar estos puntos. Para la función exponencial inversa, escribe `g(x) = 2^x` y verás cómo son simétricas respecto a la recta `y=x`.