---
title: 'Función Lineal'
description: 'Comprende las funciones lineales, su representación gráfica y aplicaciones.'
---

## ¿Qué es una Función Lineal?

Una **función lineal** es una función de la forma:

$$f(x) = mx + n$$

Donde:
- $m$ es la **pendiente** (indica la inclinación de la recta)
- $n$ es el **coeficiente de posición** o **intercepto** con el eje Y
- $x$ es la variable independiente

## Características de la Función Lineal

### 1. Gráfica
La gráfica de una función lineal es siempre una **línea recta**.

### 2. Pendiente ($m$)
La pendiente indica:
- **Si $m > 0$**: La función es **creciente** (sube de izquierda a derecha)
- **Si $m < 0$**: La función es **decreciente** (baja de izquierda a derecha)
- **Si $m = 0$**: La función es **constante** (línea horizontal)

La pendiente también representa la **tasa de cambio**: cuánto cambia $y$ cuando $x$ aumenta en 1 unidad.

### 3. Intercepto con el Eje Y
El valor $n$ indica dónde la recta cruza el eje Y (cuando $x = 0$).

## Casos Especiales

### Función Lineal Pura
Cuando $n = 0$, tenemos $f(x) = mx$. La recta pasa por el origen $(0, 0)$.

**Ejemplo:** $f(x) = 2x$

### Función Constante
Cuando $m = 0$, tenemos $f(x) = n$. La recta es horizontal.

**Ejemplo:** $f(x) = 5$ (línea horizontal en $y = 5$)

## Cómo Graficar una Función Lineal

### Método 1: Tabla de Valores
1. Elige valores para $x$
2. Calcula los correspondientes valores de $y$
3. Marca los puntos en el plano cartesiano
4. Une los puntos con una línea recta

### Método 2: Pendiente e Intercepto
1. Marca el intercepto $(0, n)$ en el eje Y
2. Usa la pendiente para encontrar otro punto:
   - Si $m = \frac{2}{3}$, desde $(0, n)$ sube 2 y avanza 3 a la derecha
3. Une los dos puntos

## Ejemplo 1: Graficar $f(x) = 2x + 1$

- Pendiente: $m = 2$ (por cada unidad que avanza $x$, $y$ sube 2)
- Intercepto: $n = 1$ (cruza el eje Y en $(0, 1)$)

**Tabla de valores:**
| $x$ | $f(x) = 2x + 1$ |
|-----|-----------------|
| -1  | -1              |
| 0   | 1               |
| 1   | 3               |
| 2   | 5               |

## Ejemplo 2: Encontrar la Ecuación

**Problema:** Una recta pasa por los puntos $(1, 3)$ y $(3, 7)$. ¿Cuál es su ecuación?

**Solución:**

1. **Calcular la pendiente:**
$$m = \frac{y_2 - y_1}{x_2 - x_1} = \frac{7 - 3}{3 - 1} = \frac{4}{2} = 2$$

2. **Usar un punto para encontrar $n$:**
Usando el punto $(1, 3)$ en $y = mx + n$:
$$3 = 2(1) + n$$
$$3 = 2 + n$$
$$n = 1$$

3. **Ecuación:** $f(x) = 2x + 1$

## Aplicaciones en la Vida Real

### Ejemplo: Taxi
Un taxi cobra \$500 de bajada de bandera más \$300 por kilómetro.

**Función:** $C(x) = 300x + 500$
- $x$ = kilómetros recorridos
- $C(x)$ = costo total

Si recorres 10 km: $C(10) = 300(10) + 500 = 3500$ pesos

### Ejemplo: Conversión de Temperatura
Para convertir de Celsius ($C$) a Fahrenheit ($F$):

$$F = \frac{9}{5}C + 32$$

Esta es una función lineal con pendiente $\frac{9}{5}$ e intercepto $32$.

## Intersección de Dos Rectas

Dos rectas se intersectan en el punto donde tienen el mismo valor de $y$ para el mismo $x$.

**Ejemplo:** Encuentra la intersección de $y = 2x + 1$ y $y = -x + 4$

**Solución:**
Igualamos:
$$2x + 1 = -x + 4$$
$$3x = 3$$
$$x = 1$$

Sustituyendo en cualquier ecuación: $y = 2(1) + 1 = 3$

**Punto de intersección:** $(1, 3)$

## Rectas Paralelas y Perpendiculares

- **Paralelas**: Tienen la misma pendiente ($m_1 = m_2$)
- **Perpendiculares**: Sus pendientes cumplen $m_1 \cdot m_2 = -1$

**Ejemplo:** $y = 2x + 1$ y $y = -\frac{1}{2}x + 3$ son perpendiculares porque $2 \cdot (-\frac{1}{2}) = -1$
