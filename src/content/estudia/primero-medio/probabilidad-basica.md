---
title: 'Probabilidad Básica (Laplace)'
description: 'Introduce los conceptos fundamentales de la probabilidad calculando la posibilidad de que ocurra un evento.'
---

## ¿Qué es la Probabilidad?

La probabilidad es una medida numérica de la posibilidad de que ocurra un evento. Su valor siempre está entre **0** y **1** (o entre 0% y 100%).
- Un evento con probabilidad **0** es imposible.
- Un evento con probabilidad **1** es seguro.

## Regla de Laplace

Para calcular la probabilidad de un evento en experimentos donde todos los resultados son igualmente probables (como lanzar un dado o una moneda), usamos la Regla de Laplace.

- **Fórmula:** `P(A) = (Número de casos favorables) / (Número de casos totales)`

Donde:
- **Casos favorables:** Son los resultados que cumplen con la condición del evento que estamos estudiando.
- **Casos totales:** Son todos los resultados posibles del experimento (también conocido como espacio muestral).

## Ejemplo Práctico: Lanzar un Dado

**Pregunta:** ¿Cuál es la probabilidad de obtener un número mayor que 4 al lanzar un dado de seis caras?

1.  **Identificamos los casos totales:**
    - Al lanzar un dado, los resultados posibles son {1, 2, 3, 4, 5, 6}.
    - Número de casos totales = 6.

2.  **Identificamos los casos favorables:**
    - El evento es "obtener un número mayor que 4".
    - Los resultados que cumplen esta condición son {5, 6}.
    - Número de casos favorables = 2.

3.  **Aplicamos la Regla de Laplace:**
    - `P(número > 4) = 2 / 6`

4.  **Simplificamos el resultado:**
    - `P(número > 4) = 1 / 3`

**Respuesta:** La probabilidad es de `1/3`, lo que equivale aproximadamente a un 33.3%.
