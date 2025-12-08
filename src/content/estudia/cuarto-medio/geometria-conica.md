---
title: 'Geometría Cónica'
description: 'Descubre las secciones cónicas: circunferencia, elipse, parábola e hipérbola.'
---

## ¿Qué son las Cónicas?

Las **secciones cónicas** (o simplemente **cónicas**) son curvas que se obtienen al intersectar un cono con un plano. Dependiendo del ángulo de corte, obtenemos diferentes curvas.

### Las Cuatro Cónicas

1. **Circunferencia**: Corte perpendicular al eje del cono
2. **Elipse**: Corte oblicuo que no pasa por la base
3. **Parábola**: Corte paralelo a una generatriz del cono
4. **Hipérbola**: Corte que intersecta ambas napas del cono

## 1. Circunferencia

La **circunferencia** es el conjunto de puntos que equidistan de un punto fijo llamado centro.

### Ecuación Estándar

$$(x - h)^2 + (y - k)^2 = r^2$$

Donde:
- $(h, k)$ es el centro
- $r$ es el radio

### Ejemplo 1

**Ecuación**: $(x - 2)^2 + (y + 3)^2 = 25$

- Centro: $(2, -3)$
- Radio: $r = \sqrt{25} = 5$

### Ecuación General

$$x^2 + y^2 + Dx + Ey + F = 0$$

Para convertir a forma estándar, completamos cuadrados.

## 2. Elipse

La **elipse** es el conjunto de puntos cuya suma de distancias a dos puntos fijos (focos) es constante.

### Ecuación Estándar (Centro en el Origen)

**Eje mayor horizontal**:
$$\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1 \quad (a > b)$$

**Eje mayor vertical**:
$$\frac{x^2}{b^2} + \frac{y^2}{a^2} = 1 \quad (a > b)$$

Donde:
- $a$: semieje mayor
- $b$: semieje menor
- $c$: distancia del centro a cada foco, donde $c^2 = a^2 - b^2$

### Elementos de la Elipse

- **Focos**: $F_1(-c, 0)$ y $F_2(c, 0)$ (si es horizontal)
- **Vértices**: $(\pm a, 0)$ (si es horizontal)
- **Excentricidad**: $e = \frac{c}{a}$ (mide qué tan "aplastada" es, $0 < e < 1$)

### Ejemplo 2

**Ecuación**: $\frac{x^2}{25} + \frac{y^2}{9} = 1$

- $a^2 = 25 \Rightarrow a = 5$ (semieje mayor)
- $b^2 = 9 \Rightarrow b = 3$ (semieje menor)
- $c^2 = 25 - 9 = 16 \Rightarrow c = 4$
- Focos: $(-4, 0)$ y $(4, 0)$
- Vértices: $(-5, 0)$ y $(5, 0)$

### Aplicación

Las órbitas planetarias son elipses con el Sol en uno de los focos (Primera Ley de Kepler).

## 3. Parábola

La **parábola** es el conjunto de puntos que equidistan de un punto fijo (foco) y una recta fija (directriz).

### Ecuación Estándar (Vértice en el Origen)

**Abre hacia arriba/abajo**:
$$x^2 = 4py$$

**Abre hacia izquierda/derecha**:
$$y^2 = 4px$$

Donde:
- $p$: distancia del vértice al foco
- Si $p > 0$: abre hacia arriba o derecha
- Si $p < 0$: abre hacia abajo o izquierda

### Elementos de la Parábola

- **Vértice**: $(0, 0)$
- **Foco**: $(0, p)$ (si abre vertical) o $(p, 0)$ (si abre horizontal)
- **Directriz**: $y = -p$ (si abre vertical) o $x = -p$ (si abre horizontal)
- **Eje de simetría**: Línea que pasa por el vértice y el foco

### Ejemplo 3

**Ecuación**: $x^2 = 8y$

Comparando con $x^2 = 4py$:
- $4p = 8 \Rightarrow p = 2$
- Vértice: $(0, 0)$
- Foco: $(0, 2)$
- Directriz: $y = -2$
- Abre hacia arriba

### Forma Vértice (Vértice en $(h, k)$)

$$(x - h)^2 = 4p(y - k)$$

### Aplicaciones

- **Antenas parabólicas**: Reflejan señales hacia el foco
- **Faros**: Luz desde el foco se refleja en rayos paralelos
- **Trayectorias**: Proyectiles bajo gravedad

## 4. Hipérbola

La **hipérbola** es el conjunto de puntos cuya diferencia de distancias a dos focos es constante.

### Ecuación Estándar (Centro en el Origen)

**Eje transversal horizontal**:
$$\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$$

**Eje transversal vertical**:
$$\frac{y^2}{a^2} - \frac{x^2}{b^2} = 1$$

Donde:
- $a$: distancia del centro a cada vértice
- $c$: distancia del centro a cada foco, donde $c^2 = a^2 + b^2$
- $b$: relacionado con las asíntotas

### Elementos de la Hipérbola

- **Focos**: $F_1(-c, 0)$ y $F_2(c, 0)$ (si es horizontal)
- **Vértices**: $(\pm a, 0)$ (si es horizontal)
- **Asíntotas**: $y = \pm\frac{b}{a}x$ (si es horizontal)
- **Excentricidad**: $e = \frac{c}{a}$ (siempre $e > 1$)

### Ejemplo 4

**Ecuación**: $\frac{x^2}{9} - \frac{y^2}{16} = 1$

- $a^2 = 9 \Rightarrow a = 3$
- $b^2 = 16 \Rightarrow b = 4$
- $c^2 = 9 + 16 = 25 \Rightarrow c = 5$
- Focos: $(-5, 0)$ y $(5, 0)$
- Vértices: $(-3, 0)$ y $(3, 0)$
- Asíntotas: $y = \pm\frac{4}{3}x$

### Aplicaciones

- **Navegación**: Sistema LORAN
- **Astronomía**: Trayectorias de cometas
- **Torres de enfriamiento**: Forma hiperbólica por resistencia estructural

## Resumen Comparativo

| Cónica | Ecuación Característica | Excentricidad |
|--------|------------------------|---------------|
| Circunferencia | $x^2 + y^2 = r^2$ | $e = 0$ |
| Elipse | $\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1$ | $0 < e < 1$ |
| Parábola | $x^2 = 4py$ | $e = 1$ |
| Hipérbola | $\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$ | $e > 1$ |

## Identificación de Cónicas

Dada la ecuación general:
$$Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$$

- Si $A = C$ y $B = 0$: **Circunferencia**
- Si $AC > 0$ y $A \neq C$: **Elipse**
- Si $AC = 0$: **Parábola**
- Si $AC < 0$: **Hipérbola**

## En GeoGebra

Puedes graficar cónicas en GeoGebra:
1. Usa el comando `Cónica` con 5 puntos
2. O escribe directamente la ecuación
3. Explora cómo cambian al modificar parámetros
