---
title: "Funciones Periódicas"
description: "Estudia el comportamiento de fenómenos que se repiten en el tiempo y su modelamiento matemático"
level: "cuarto-medio"
subject: "matemática"
---

# Funciones Periódicas

Una función periódica es aquella que repite sus valores a intervalos regulares. Son esenciales para modelar fenómenos cíclicos.

## Definición Formal

Una función $f$ es periódica si existe un número real positivo $T$ tal que:

$$f(x + T) = f(x)$$

para todo $x$ en el dominio de $f$. El menor valor positivo de $T$ se llama **período fundamental**.

## Ejemplos de Fenómenos Periódicos

- **Naturales:** Las estaciones del año, las fases de la luna, las mareas, el latido del corazón.
- **Físicos:** El movimiento de un péndulo, la vibración de una cuerda, la corriente alterna.
- **Económicos:** Ciclos estacionales de ventas, ciclos económicos.

## Modelamiento con Funciones Trigonométricas

La mayoría de los fenómenos periódicos se pueden modelar usando variaciones de las funciones seno y coseno:

$$f(t) = A \sin(B(t - C)) + D$$

Donde:
- **$A$ (Amplitud):** Mitad de la diferencia entre el valor máximo y mínimo.
  $$A = \frac{\text{máx} - \text{mín}}{2}$$

- **$D$ (Eje medio):** Promedio entre el valor máximo y mínimo.
  $$D = \frac{\text{máx} + \text{mín}}{2}$$

- **$T$ (Período):** Tiempo que tarda en completarse un ciclo.
  $$T = \frac{2\pi}{B} \implies B = \frac{2\pi}{T}$$

- **$C$ (Fase):** Desplazamiento horizontal que indica en qué punto del ciclo comienza la medición.

## Ejemplo de Aplicación

**Problema:** La temperatura en una ciudad varía durante el día de forma aproximadamente sinusoidal. La temperatura mínima es de 10°C a las 4 AM y la máxima es de 26°C a las 4 PM.

**Solución:**
1. **Máximo:** 26, **Mínimo:** 10
2. **Eje medio ($D$):** $\frac{26 + 10}{2} = 18$
3. **Amplitud ($A$):** $\frac{26 - 10}{2} = 8$
4. **Período ($T$):** 24 horas. Entonces $B = \frac{2\pi}{24} = \frac{\pi}{12}$
5. **Fase ($C$):** Usaremos la función coseno negativa ($-\cos$) porque empezamos cerca del mínimo, o desplazamos el seno.
   El mínimo ocurre a las 4 AM ($t=4$). La función coseno normal tiene el máximo en $t=0$. La función $-\cos$ tiene el mínimo en $t=0$.
   Si usamos $f(t) = -A\cos(B(t - C)) + D$, el mínimo ocurre en $t=C$.
   Entonces $C = 4$.

**Modelo:**
$$T(t) = -8 \cos\left(\frac{\pi}{12}(t - 4)\right) + 18$$

## Ejercicios

1. Determina el período de la función $f(x) = 5\sin(4x) - 2$.
2. Una rueda de la fortuna de 20m de diámetro da una vuelta completa cada 4 minutos. Si te subes en el punto más bajo (a 1m del suelo), modela tu altura en función del tiempo.
