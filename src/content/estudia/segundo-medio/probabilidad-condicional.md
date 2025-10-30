---
title: 'Probabilidad Condicional'
description: 'Calcula la probabilidad de que ocurra un evento, dado que otro evento ya ha ocurrido.'
---

## ¿Qué es la Probabilidad Condicional?

La probabilidad condicional es la probabilidad de que ocurra un evento A, sabiendo que también sucede (o ha sucedido) otro evento B. Se denota como `P(A|B)` y se lee "la probabilidad de A dado B".

La fórmula para calcularla es:

`P(A|B) = P(A ∩ B) / P(B)`

Donde:
- `P(A|B)`: Probabilidad de A dado que B ocurrió.
- `P(A ∩ B)`: Probabilidad de que ocurran ambos eventos, A y B (la intersección).
- `P(B)`: Probabilidad de que ocurra el evento B. `P(B)` debe ser mayor que cero.

## Eventos Independientes vs. Dependientes

- **Independientes:** Si la ocurrencia de un evento no afecta la probabilidad del otro. En este caso, `P(A|B) = P(A)`.
- **Dependientes:** Si la ocurrencia de un evento sí afecta la probabilidad del otro. La mayoría de los casos de probabilidad condicional tratan con eventos dependientes.

## Ejemplo Práctico

Imagina una caja con 10 bolitas: 7 son rojas y 3 son azules. Sacamos dos bolitas, una después de la otra, **sin devolver la primera a la caja**.

**Pregunta:** ¿Cuál es la probabilidad de que la segunda bolita sea azul, dado que la primera fue roja?

1.  **Definimos los eventos:**
    - Evento A: La segunda bolita es azul.
    - Evento B: La primera bolita es roja.
    - Queremos calcular `P(A|B)`.

2.  **Analizamos el escenario:**
    - Después de sacar una bolita roja (evento B), la situación inicial cambia.
    - Ya no hay 10 bolitas en la caja, sino 9.
    - El número de bolitas rojas es 6.
    - El número de bolitas azules sigue siendo 3.

3.  **Calculamos la probabilidad:**
    La probabilidad de sacar una bolita azul de las 9 que quedan es `3/9`.

**Respuesta:** La probabilidad de que la segunda bolita sea azul, dado que la primera fue roja, es `3/9`, que se simplifica a `1/3` (aproximadamente 33.3%).