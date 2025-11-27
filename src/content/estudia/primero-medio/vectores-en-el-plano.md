---
title: 'Vectores en el Plano'
description: 'Aprende sobre vectores, sus operaciones y aplicaciones en geometría analítica.'
---

## ¿Qué son los Vectores?

Un **vector** es una magnitud que tiene tanto dirección como magnitud (tamaño). Se representa gráficamente como una flecha que va desde un punto inicial hasta un punto final.

### Notación de Vectores

Un vector se puede escribir de varias formas:
- **Notación con flecha**: $\vec{v}$ o $\vec{AB}$ (vector desde A hasta B)
- **Notación en componentes**: $\vec{v} = (v_x, v_y)$ donde $v_x$ y $v_y$ son las componentes horizontal y vertical
- **Notación con vectores unitarios**: $\vec{v} = v_x\hat{i} + v_y\hat{j}$

## Operaciones con Vectores

### 1. Suma de Vectores

Para sumar dos vectores $\vec{u} = (u_x, u_y)$ y $\vec{v} = (v_x, v_y)$:

$$\vec{u} + \vec{v} = (u_x + v_x, u_y + v_y)$$

**Ejemplo:** Si $\vec{u} = (3, 2)$ y $\vec{v} = (1, 4)$, entonces:
$$\vec{u} + \vec{v} = (3+1, 2+4) = (4, 6)$$

### 2. Multiplicación por un Escalar

Para multiplicar un vector $\vec{v} = (v_x, v_y)$ por un número real $k$:

$$k\vec{v} = (kv_x, kv_y)$$

**Ejemplo:** Si $\vec{v} = (2, -3)$ y $k = 3$:
$$3\vec{v} = (3 \cdot 2, 3 \cdot (-3)) = (6, -9)$$

### 3. Magnitud de un Vector

La magnitud (o módulo) de un vector $\vec{v} = (v_x, v_y)$ se calcula usando el teorema de Pitágoras:

$$|\vec{v}| = \sqrt{v_x^2 + v_y^2}$$

**Ejemplo:** Si $\vec{v} = (3, 4)$:
$$|\vec{v}| = \sqrt{3^2 + 4^2} = \sqrt{9 + 16} = \sqrt{25} = 5$$

## Aplicaciones de Vectores

Los vectores se utilizan para:
- Representar fuerzas en física
- Describir velocidades y aceleraciones
- Resolver problemas de navegación
- Modelar desplazamientos en el plano

## Ejemplo Práctico

**Problema:** Un barco navega 5 km al este y luego 3 km al norte. ¿Cuál es su desplazamiento total?

**Solución:**
1. Vector este: $\vec{v_1} = (5, 0)$
2. Vector norte: $\vec{v_2} = (0, 3)$
3. Desplazamiento total: $\vec{v} = \vec{v_1} + \vec{v_2} = (5, 3)$
4. Magnitud: $|\vec{v}| = \sqrt{5^2 + 3^2} = \sqrt{34} \approx 5.83$ km
