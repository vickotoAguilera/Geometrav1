---
title: 'Geometría Analítica'
description: 'Explora la geometría usando coordenadas: distancia, punto medio y aplicaciones.'
---

## Geometría Analítica en el Plano

La **geometría analítica** combina el álgebra con la geometría, permitiéndonos estudiar figuras geométricas usando coordenadas y ecuaciones.

## Distancia entre Dos Puntos

Dados dos puntos $A(x_1, y_1)$ y $B(x_2, y_2)$, la distancia entre ellos se calcula con la fórmula:

$$d(A,B) = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$

Esta fórmula se deriva del **teorema de Pitágoras**.

### Ejemplo 1: Calcular Distancia

Encuentra la distancia entre los puntos $A(1, 2)$ y $B(4, 6)$.

**Solución:**
$$d(A,B) = \sqrt{(4-1)^2 + (6-2)^2} = \sqrt{3^2 + 4^2} = \sqrt{9 + 16} = \sqrt{25} = 5$$

## Punto Medio

El **punto medio** $M$ entre dos puntos $A(x_1, y_1)$ y $B(x_2, y_2)$ tiene coordenadas:

$$M = \left(\frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2}\right)$$

### Ejemplo 2: Encontrar Punto Medio

Encuentra el punto medio entre $A(2, 3)$ y $B(8, 7)$.

**Solución:**
$$M = \left(\frac{2+8}{2}, \frac{3+7}{2}\right) = \left(\frac{10}{2}, \frac{10}{2}\right) = (5, 5)$$

## Pendiente de una Recta

La **pendiente** $m$ de una recta que pasa por los puntos $A(x_1, y_1)$ y $B(x_2, y_2)$ es:

$$m = \frac{y_2 - y_1}{x_2 - x_1}$$

La pendiente indica la inclinación de la recta:
- $m > 0$: La recta sube (de izquierda a derecha)
- $m < 0$: La recta baja
- $m = 0$: La recta es horizontal
- $m$ indefinida: La recta es vertical

### Ejemplo 3: Calcular Pendiente

Calcula la pendiente de la recta que pasa por $A(1, 2)$ y $B(5, 10)$.

**Solución:**
$$m = \frac{10-2}{5-1} = \frac{8}{4} = 2$$

## Aplicación: Verificar si Tres Puntos son Colineales

Tres puntos son **colineales** (están en la misma recta) si la pendiente entre el primer y segundo punto es igual a la pendiente entre el segundo y tercer punto.

**Ejemplo:** ¿Son colineales los puntos $A(1,1)$, $B(2,3)$ y $C(3,5)$?

**Solución:**
- Pendiente $AB$: $m_{AB} = \frac{3-1}{2-1} = 2$
- Pendiente $BC$: $m_{BC} = \frac{5-3}{3-2} = 2$

Como $m_{AB} = m_{BC}$, los puntos **son colineales**.
