---
title: "Geometría 3D: Rectas y Planos"
description: "Explora la geometría en el espacio tridimensional, ecuaciones de rectas y planos"
level: "cuarto-medio"
subject: "matemática"
---

# Geometría 3D: Rectas y Planos

En Cuarto Medio extendemos nuestro conocimiento de la geometría analítica al espacio tridimensional ($\mathbb{R}^3$).

## Sistema de Coordenadas 3D

Cada punto en el espacio se representa por una terna ordenada $(x, y, z)$.
- Eje $x$: Abscisas
- Eje $y$: Ordenadas
- Eje $z$: Cotas

## Vectores en el Espacio

Un vector $\vec{v}$ en $\mathbb{R}^3$ tiene tres componentes: $\vec{v} = (v_1, v_2, v_3)$.

**Módulo:** $|\vec{v}| = \sqrt{v_1^2 + v_2^2 + v_3^2}$

## Ecuación de la Recta en el Espacio

Para definir una recta necesitamos un punto $P_0(x_0, y_0, z_0)$ y un vector director $\vec{d} = (a, b, c)$.

### 1. Ecuación Vectorial
$$(x, y, z) = (x_0, y_0, z_0) + \lambda(a, b, c), \quad \lambda \in \mathbb{R}$$

### 2. Ecuaciones Paramétricas
$$\begin{cases}
x = x_0 + \lambda a \\
y = y_0 + \lambda b \\
z = z_0 + \lambda c
\end{cases}$$

### 3. Ecuación Continua (Simétrica)
Despejando $\lambda$ en cada ecuación:
$$\frac{x - x_0}{a} = \frac{y - y_0}{b} = \frac{z - z_0}{c}$$

## Ecuación del Plano

Para definir un plano necesitamos un punto $P_0(x_0, y_0, z_0)$ y un vector normal $\vec{n} = (A, B, C)$ perpendicular al plano.

### Ecuación General (Cartesiana)
$$A(x - x_0) + B(y - y_0) + C(z - z_0) = 0$$

O simplificada:
$$Ax + By + Cz + D = 0$$

## Distancias

### Distancia entre dos puntos
$$d(A, B) = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$$

### Distancia de un punto a un plano
$$d(P, \pi) = \frac{|Ax_0 + By_0 + Cz_0 + D|}{\sqrt{A^2 + B^2 + C^2}}$$

## Cuerpos Geométricos y Volúmenes

### Volúmenes por Rotación
Si rotamos una función $f(x)$ alrededor del eje $x$ entre $a$ y $b$, el volumen generado es:

$$V = \pi \int_{a}^{b} [f(x)]^2 dx$$

## Ejercicios

1. Encuentra la ecuación vectorial de la recta que pasa por $A(1, 2, 3)$ y $B(4, 5, 6)$.
2. Determina la ecuación del plano que pasa por el punto $(2, -1, 3)$ y tiene vector normal $\vec{n} = (1, 4, -2)$.
3. Calcula la distancia entre los puntos $P(1, 0, 2)$ y $Q(3, 4, 6)$.
