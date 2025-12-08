---
title: 'Modelos Probabilísticos'
description: 'Aprende a usar modelos matemáticos para predecir y analizar situaciones de incerteza.'
---

## ¿Qué es un Modelo Probabilístico?

Un **modelo probabilístico** es una representación matemática que nos permite predecir y analizar situaciones donde hay incertidumbre. Estos modelos asignan probabilidades a diferentes resultados posibles.

## Tipos de Modelos Probabilísticos

### 1. Modelo de Laplace (Equiprobable)

Cuando todos los resultados son **igualmente probables**, usamos:

$$P(A) = \frac{\text{Casos favorables}}{\text{Casos totales}}$$

**Ejemplo:** Al lanzar un dado justo, la probabilidad de obtener un 4 es:
$$P(\text{obtener 4}) = \frac{1}{6}$$

### 2. Modelo de Frecuencias Relativas

Basado en **datos experimentales**. Si un evento ocurre $f$ veces en $n$ experimentos:

$$P(A) \approx \frac{f}{n}$$

**Ejemplo:** Si lanzamos una moneda 100 veces y sale cara 53 veces:
$$P(\text{cara}) \approx \frac{53}{100} = 0.53$$

### 3. Modelo Binomial

Se usa cuando tenemos **experimentos repetidos** con solo dos resultados posibles (éxito/fracaso).

La probabilidad de obtener exactamente $k$ éxitos en $n$ intentos, donde la probabilidad de éxito es $p$:

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$$

Donde $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ es el coeficiente binomial.

**Ejemplo:** Si lanzamos una moneda 5 veces, ¿cuál es la probabilidad de obtener exactamente 3 caras?

$$P(X=3) = \binom{5}{3} \left(\frac{1}{2}\right)^3 \left(\frac{1}{2}\right)^2 = 10 \cdot \frac{1}{8} \cdot \frac{1}{4} = \frac{10}{32} = 0.3125$$

## Valor Esperado

El **valor esperado** $E(X)$ es el promedio que esperaríamos obtener si repetimos un experimento muchas veces:

$$E(X) = \sum_{i} x_i \cdot P(x_i)$$

**Ejemplo:** En un juego, ganas \$10 con probabilidad 0.3 y pierdes \$5 con probabilidad 0.7:

$$E(X) = 10(0.3) + (-5)(0.7) = 3 - 3.5 = -\$0.50$$

En promedio, pierdes 50 centavos por juego.

## Aplicaciones en la Vida Real

Los modelos probabilísticos se usan para:
- Predecir resultados de elecciones
- Evaluar riesgos en seguros
- Analizar datos científicos
- Tomar decisiones en situaciones de incerteza
- Modelar fenómenos naturales

## Ejemplo Práctico

**Problema:** Una empresa sabe que el 5% de sus productos son defectuosos. Si seleccionan 20 productos al azar, ¿cuál es la probabilidad de encontrar exactamente 2 defectuosos?

**Solución:** Usamos el modelo binomial con $n=20$, $k=2$, $p=0.05$:

$$P(X=2) = \binom{20}{2} (0.05)^2 (0.95)^{18}$$
$$= 190 \cdot 0.0025 \cdot 0.3972 \approx 0.189$$

Hay aproximadamente un 18.9% de probabilidad.
