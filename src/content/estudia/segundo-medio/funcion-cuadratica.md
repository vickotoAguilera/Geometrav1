---
title: 'Función Cuadrática'
description: 'Explora las parábolas y aprende a analizar sus propiedades a través de la función cuadrática.'
---

## ¿Qué es la Función Cuadrática?

Una función cuadrática es una función polinómica de segundo grado. Su forma general es:

`f(x) = ax² + bx + c`

Donde `a`, `b` y `c` son números reales y `a` debe ser distinto de cero (`a ≠ 0`). La gráfica de una función cuadrática es una **parábola**.

## Elementos Clave de la Parábola

1.  **Concavidad:**
    - Si `a > 0`, la parábola se abre hacia arriba (cóncava hacia arriba).
    - Si `a < 0`, la parábola se abre hacia abajo (cóncava hacia abajo).

2.  **Vértice:** Es el punto más bajo (mínimo) o más alto (máximo) de la parábola. Sus coordenadas `(h, k)` se calculan con:
    - `h = -b / (2a)`
    - `k = f(h)` (evaluando la función en `h`)

3.  **Intersección con el eje Y:** Ocurre cuando `x = 0`. El punto es `(0, c)`.

4.  **Intersecciones con el eje X (Raíces o Ceros):** Ocurren cuando `f(x) = 0`. Se encuentran resolviendo la ecuación `ax² + bx + c = 0` con la fórmula general:
    `x = [-b ± sqrt(b² - 4ac)] / (2a)`

## Ejemplo Práctico

Analicemos la función `f(x) = x² - 4x + 3`.

1.  **Concavidad:** `a = 1`, como es mayor que 0, la parábola se abre hacia arriba.

2.  **Vértice:**
    - `h = -(-4) / (2 * 1) = 4 / 2 = 2`
    - `k = f(2) = (2)² - 4(2) + 3 = 4 - 8 + 3 = -1`
    - El vértice es el punto `(2, -1)`.

3.  **Intersección con eje Y:** El punto es `(0, 3)`, ya que `c = 3`.

4.  **Intersecciones con eje X:**
    - `x = [4 ± sqrt((-4)² - 4 * 1 * 3)] / (2 * 1)`
    - `x = [4 ± sqrt(16 - 12)] / 2`
    - `x = [4 ± sqrt(4)] / 2`
    - `x = (4 ± 2) / 2`
    - Soluciones: `x₁ = (4 + 2) / 2 = 3` y `x₂ = (4 - 2) / 2 = 1`.
    - Los puntos de intersección son `(1, 0)` y `(3, 0)`.

**En GeoGebra:** Simplemente escribe `f(x) = x^2 - 4x + 3` en la barra de entrada y podrás verificar todos estos puntos.