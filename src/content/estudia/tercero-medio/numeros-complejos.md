---
title: 'Números Complejos'
description: 'Descubre los números complejos, sus operaciones y aplicaciones en matemáticas avanzadas.'
---

## ¿Qué son los Números Complejos?

Los **números complejos** extienden el sistema de números reales para incluir soluciones a ecuaciones que no tienen solución en los reales, como $x^2 + 1 = 0$.

Un número complejo tiene la forma:

$$z = a + bi$$

Donde:
- $a$ es la **parte real**
- $b$ es la **parte imaginaria**
- $i$ es la **unidad imaginaria**, definida como $i = \sqrt{-1}$, por lo tanto $i^2 = -1$

## La Unidad Imaginaria

La unidad imaginaria $i$ cumple con:

$$i^2 = -1$$

**Potencias de $i$**:
- $i^1 = i$
- $i^2 = -1$
- $i^3 = i^2 \cdot i = -i$
- $i^4 = i^2 \cdot i^2 = 1$
- $i^5 = i$ (el patrón se repite cada 4 potencias)

## Representación Gráfica: Plano Complejo

Los números complejos se representan en el **plano complejo** (o plano de Argand):
- Eje horizontal: parte real
- Eje vertical: parte imaginaria

**Ejemplo**: $z = 3 + 2i$ se representa en el punto $(3, 2)$

## Operaciones con Números Complejos

### 1. Suma y Resta

Se suman/restan las partes reales e imaginarias por separado:

$$(a + bi) + (c + di) = (a + c) + (b + d)i$$

**Ejemplo**:
$$(3 + 2i) + (1 - 4i) = (3+1) + (2-4)i = 4 - 2i$$

### 2. Multiplicación

Se multiplica usando la propiedad distributiva y $i^2 = -1$:

$$(a + bi)(c + di) = ac + adi + bci + bdi^2 = (ac - bd) + (ad + bc)i$$

**Ejemplo**:
$$(2 + 3i)(1 + 4i) = 2 + 8i + 3i + 12i^2 = 2 + 11i - 12 = -10 + 11i$$

### 3. Conjugado

El **conjugado** de $z = a + bi$ es $\bar{z} = a - bi$

**Propiedad importante**: $z \cdot \bar{z} = a^2 + b^2$ (un número real)

### 4. División

Para dividir, multiplicamos numerador y denominador por el conjugado del denominador:

$$\frac{a + bi}{c + di} = \frac{(a + bi)(c - di)}{(c + di)(c - di)} = \frac{(ac + bd) + (bc - ad)i}{c^2 + d^2}$$

**Ejemplo**:
$$\frac{3 + 2i}{1 + i} = \frac{(3 + 2i)(1 - i)}{(1 + i)(1 - i)} = \frac{3 - 3i + 2i - 2i^2}{1 - i^2} = \frac{5 - i}{2} = \frac{5}{2} - \frac{1}{2}i$$

## Módulo y Argumento

### Módulo

El **módulo** (o valor absoluto) de $z = a + bi$ es:

$$|z| = \sqrt{a^2 + b^2}$$

Representa la distancia del número al origen en el plano complejo.

**Ejemplo**: $|3 + 4i| = \sqrt{3^2 + 4^2} = \sqrt{25} = 5$

### Argumento

El **argumento** $\theta$ es el ángulo que forma el número con el eje real positivo:

$$\theta = \arctan\left(\frac{b}{a}\right)$$

## Forma Polar

Un número complejo también se puede expresar en **forma polar**:

$$z = r(\cos\theta + i\sin\theta) = r \text{ cis } \theta$$

Donde:
- $r = |z|$ es el módulo
- $\theta$ es el argumento

**Forma exponencial** (Fórmula de Euler):
$$z = re^{i\theta}$$

## Aplicaciones

Los números complejos se usan en:
- **Ingeniería eléctrica**: Análisis de circuitos AC
- **Física cuántica**: Funciones de onda
- **Procesamiento de señales**: Transformadas de Fourier
- **Aerodinámica**: Flujo de fluidos
- **Fractales**: Conjunto de Mandelbrot

## Ejemplo Práctico

**Problema**: Resuelve la ecuación $x^2 + 4 = 0$

**Solución**:
$$x^2 = -4$$
$$x = \pm\sqrt{-4} = \pm\sqrt{4 \cdot (-1)} = \pm 2i$$

Las soluciones son $x_1 = 2i$ y $x_2 = -2i$

## Teorema Fundamental del Álgebra

Todo polinomio de grado $n$ con coeficientes complejos tiene exactamente $n$ raíces complejas (contando multiplicidad).

**Ejemplo**: $x^2 - 2x + 5 = 0$

Usando la fórmula cuadrática:
$$x = \frac{2 \pm \sqrt{4 - 20}}{2} = \frac{2 \pm \sqrt{-16}}{2} = \frac{2 \pm 4i}{2} = 1 \pm 2i$$
