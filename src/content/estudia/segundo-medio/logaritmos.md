---
title: 'Logaritmos'
description: 'Entiende qué son los logaritmos y cómo se relacionan con las potencias.'
---

## ¿Qué es un Logaritmo?

El logaritmo es la operación inversa de la exponenciación. El logaritmo de un número (argumento) en una cierta base es el exponente al cual se debe elevar la base para obtener dicho número.

La fórmula es:

`log_b(a) = c`  es equivalente a  `b^c = a`

Donde:
- **b** es la base del logaritmo (debe ser un número positivo y distinto de 1).
- **a** es el argumento (debe ser un número positivo).
- **c** es el logaritmo (el resultado).

En palabras simples, cuando calculas `log₂(8)`, te preguntas: "¿A qué número debo elevar el 2 para que me dé 8?". La respuesta es 3.

## Ejemplo Práctico

Calculemos el valor de `x` en `log₃(81) = x`.

1.  **Convertimos a forma exponencial:**
    La pregunta es: "¿A qué número (`x`) debo elevar la base (`3`) para obtener el argumento (`81`)?"
    `3^x = 81`

2.  **Buscamos el exponente:**
    Sabemos que `3 * 3 = 9`, `9 * 3 = 27` y `27 * 3 = 81`.
    Esto es `3⁴`.
    Por lo tanto, `x = 4`.

**Respuesta:** `log₃(81) = 4`.

## Propiedades Importantes

- **Logaritmo de la base:** `log_b(b) = 1`
- **Logaritmo de 1:** `log_b(1) = 0`
- **Logaritmo de un producto:** `log_b(m * n) = log_b(m) + log_b(n)`
- **Logaritmo de un cociente:** `log_b(m / n) = log_b(m) - log_b(n)`
- **Logaritmo de una potencia:** `log_b(m^n) = n * log_b(m)`
