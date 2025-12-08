---
title: "Distribución Binomial"
description: "Aprende sobre la distribución binomial y su aplicación en situaciones de probabilidad con dos resultados posibles"
level: "cuarto-medio"
subject: "matemática"
---

# Distribución Binomial

La distribución binomial modela situaciones donde se realizan experimentos con exactamente dos resultados posibles (éxito o fracaso).

## Características

Una variable aleatoria sigue una distribución binomial cuando:

1. Se realizan $n$ ensayos independientes
2. Cada ensayo tiene solo dos resultados posibles: éxito o fracaso
3. La probabilidad de éxito $p$ es constante en todos los ensayos
4. Los ensayos son independientes entre sí

**Notación:** $X \sim B(n, p)$

Donde:
- $n$ = número de ensayos
- $p$ = probabilidad de éxito
- $q = 1 - p$ = probabilidad de fracaso

## Función de Probabilidad

La probabilidad de obtener exactamente $k$ éxitos en $n$ ensayos es:

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$$

Donde $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ es el coeficiente binomial.

## Media y Varianza

- **Media (Esperanza):** $E(X) = np$
- **Varianza:** $Var(X) = np(1-p) = npq$
- **Desviación estándar:** $\sigma = \sqrt{npq}$

## Ejemplo

**Problema:** Se lanza una moneda 10 veces. ¿Cuál es la probabilidad de obtener exactamente 6 caras?

**Solución:**
- $n = 10$ ensayos
- $p = 0.5$ (probabilidad de cara)
- $k = 6$ éxitos deseados

$$P(X = 6) = \binom{10}{6} (0.5)^6 (0.5)^4$$
$$P(X = 6) = 210 \times 0.015625 \times 0.0625$$
$$P(X = 6) \approx 0.205$$

## Aplicaciones

La distribución binomial se usa para:
- Control de calidad (productos defectuosos)
- Medicina (efectividad de tratamientos)
- Encuestas (respuestas sí/no)
- Genética (herencia de características)
- Deportes (probabilidad de victorias)

## Aproximación a la Normal

Cuando $n$ es grande y $p$ no está muy cerca de 0 o 1, la distribución binomial se puede aproximar por una distribución normal:

$$X \sim B(n,p) \approx N(np, npq)$$

**Regla práctica:** Esta aproximación es buena cuando $np > 5$ y $nq > 5$

## Ejercicios

1. Un examen tiene 20 preguntas de verdadero/falso. Si un estudiante responde al azar, ¿cuál es la probabilidad de que acierte exactamente 12?

2. La probabilidad de que un producto sea defectuoso es 0.02. En una muestra de 100 productos, ¿cuál es la probabilidad de encontrar más de 3 defectuosos?
