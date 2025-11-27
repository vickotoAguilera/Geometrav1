---
title: 'Función Exponencial'
description: 'Modela crecimientos y decrecimientos acelerados, desde poblaciones hasta inversiones.'
---

## ¿Qué es la Función Exponencial?

Una función exponencial es aquella en la que la variable independiente (`x`) aparece en el exponente. Su forma general es:

`f(x) = a * b^x`

Donde:
- **a** es el valor inicial (el valor de la función cuando `x = 0`), y `a ≠ 0`.
- **b** es la base o factor de cambio (debe ser un número positivo y `b ≠ 1`).
- **x** es la variable independiente.

Esta función es clave para modelar fenómenos que cambian a un ritmo proporcional a su valor actual.

## Crecimiento y Decrecimiento

1.  **Crecimiento Exponencial:**
    - Ocurre cuando la base `b` es mayor que 1 (`b > 1`).
    - La función aumenta cada vez más rápido.
    - Ejemplos: Crecimiento de una población de bacterias, interés compuesto.

2.  **Decrecimiento Exponencial:**
    - Ocurre cuando la base `b` está entre 0 y 1 (`0 < b < 1`).
    - La función disminuye cada vez más rápido al principio y luego más lento.
    - Ejemplos: Desintegración radioactiva, depreciación de un auto.

## Ejemplo Práctico: Crecimiento de Bacterias

Supongamos que una población de bacterias comienza con **100** individuos y se duplica cada hora.

**Pregunta:** ¿Cuál es la función que modela este crecimiento y cuántas bacterias habrá después de 4 horas?

1.  **Identificamos los parámetros:**
    - Valor inicial (`a`): 100 bacterias.
    - Factor de cambio (`b`): se duplica, así que `b = 2`.
    - La variable `x` será el tiempo en horas.

2.  **Escribimos la función:**
    `f(x) = 100 * 2^x`

3.  **Calculamos para 4 horas (x = 4):**
    `f(4) = 100 * 2⁴`
    `f(4) = 100 * 16`
    `f(4) = 1600`

**Respuesta:** Después de 4 horas, habrá **1600** bacterias.

**En GeoGebra:** Puedes escribir `f(x) = 100 * 2^x` para visualizar la curva de crecimiento exponencial.
