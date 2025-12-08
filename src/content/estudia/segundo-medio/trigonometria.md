---
title: 'Trigonometría'
description: 'Aprende las razones trigonométricas y sus aplicaciones en triángulos rectángulos.'
---

## ¿Qué es la Trigonometría?

La **trigonometría** es la rama de las matemáticas que estudia la relación entre los ángulos y los lados de los triángulos. En su forma básica, se centra en el **triángulo rectángulo**, que es aquel que tiene un ángulo de 90 grados.

## Componentes del Triángulo Rectángulo

En un triángulo rectángulo tenemos:
- **Hipotenusa**: El lado más largo, opuesto al ángulo recto
- **Cateto opuesto**: El lado opuesto al ángulo que estamos analizando
- **Cateto adyacente**: El lado que forma el ángulo junto con la hipotenusa

## Las Razones Trigonométricas

Para un ángulo agudo $\alpha$ en un triángulo rectángulo, definimos tres razones principales:

### 1. Seno (sin)
Es la razón entre el cateto opuesto y la hipotenusa:

$$\sin(\alpha) = \frac{\text{Cateto Opuesto}}{\text{Hipotenusa}}$$

### 2. Coseno (cos)
Es la razón entre el cateto adyacente y la hipotenusa:

$$\cos(\alpha) = \frac{\text{Cateto Adyacente}}{\text{Hipotenusa}}$$

### 3. Tangente (tan)
Es la razón entre el cateto opuesto y el cateto adyacente:

$$\tan(\alpha) = \frac{\text{Cateto Opuesto}}{\text{Cateto Adyacente}}$$

### Mnemotecnia: SOH-CAH-TOA

Una forma fácil de recordar estas relaciones es:
- **S**in = **O**pposite / **H**ypotenuse (Seno = Opuesto / Hipotenusa)
- **C**os = **A**djacent / **H**ypotenuse (Coseno = Adyacente / Hipotenusa)
- **T**an = **O**pposite / **A**djacent (Tangente = Opuesto / Adyacente)

## Razones Trigonométricas Recíprocas

Existen tres razones adicionales que son recíprocas de las anteriores:

- **Cosecante**: $\csc(\alpha) = \frac{1}{\sin(\alpha)} = \frac{\text{Hipotenusa}}{\text{Cateto Opuesto}}$
- **Secante**: $\sec(\alpha) = \frac{1}{\cos(\alpha)} = \frac{\text{Hipotenusa}}{\text{Cateto Adyacente}}$
- **Cotangente**: $\cot(\alpha) = \frac{1}{\tan(\alpha)} = \frac{\text{Cateto Adyacente}}{\text{Cateto Opuesto}}$

## Identidad Fundamental

Las razones trigonométricas cumplen con la **identidad pitagórica**:

$$\sin^2(\alpha) + \cos^2(\alpha) = 1$$

Esta identidad se deriva directamente del teorema de Pitágoras.

## Ejemplo Práctico 1: Escalera

Imagina que tienes una escalera de 5 metros (hipotenusa) apoyada en una pared. El punto donde la escalera toca la pared está a 3 metros de altura (cateto opuesto), y la base de la escalera está a 4 metros de la pared (cateto adyacente).

**Pregunta:** ¿Cuáles son las razones trigonométricas para el ángulo $\alpha$ que forma la escalera con el suelo?

**Solución:**
1. $\sin(\alpha) = \frac{3}{5} = 0.6$
2. $\cos(\alpha) = \frac{4}{5} = 0.8$
3. $\tan(\alpha) = \frac{3}{4} = 0.75$

## Ejemplo Práctico 2: Encontrar un Lado

**Problema:** En un triángulo rectángulo, la hipotenusa mide 10 cm y uno de los ángulos agudos es de 30°. ¿Cuánto mide el cateto opuesto a ese ángulo?

**Solución:**
Usamos la razón del seno:
$$\sin(30°) = \frac{\text{Cateto Opuesto}}{10}$$

Sabemos que $\sin(30°) = 0.5$, entonces:
$$0.5 = \frac{\text{Cateto Opuesto}}{10}$$
$$\text{Cateto Opuesto} = 10 \times 0.5 = 5 \text{ cm}$$

## Ángulos Notables

Es útil memorizar los valores de las razones trigonométricas para ciertos ángulos:

| Ángulo | sen | cos | tan |
|--------|-----|-----|-----|
| 30° | 1/2 | √3/2 | √3/3 |
| 45° | √2/2 | √2/2 | 1 |
| 60° | √3/2 | 1/2 | √3 |

## Aplicaciones

La trigonometría se usa en:
- **Navegación**: Calcular distancias y rumbos
- **Arquitectura**: Diseñar techos y rampas
- **Física**: Analizar fuerzas y movimientos
- **Topografía**: Medir alturas y distancias inaccesibles

## En GeoGebra

Puedes explorar la trigonometría en GeoGebra:
1. Crea un triángulo rectángulo con la herramienta `Polígono`
2. Mide un ángulo con la herramienta `Ángulo`
3. En la barra de entrada, escribe `sin(α)`, `cos(α)` y `tan(α)` (usando el nombre del ángulo)
4. Mueve los vértices y observa cómo cambian los valores
