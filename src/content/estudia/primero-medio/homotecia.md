---
title: 'Homotecia y Semejanza'
description: 'Aprende a crear figuras a escala y a entender el concepto de semejanza.'
---

## ¿Qué es la Homotecia?

La homotecia es una transformación geométrica que permite ampliar o reducir una figura a partir de un punto fijo llamado **centro de homotecia (O)** y un número real llamado **razón de homotecia (k)**.

Cada punto `P` de la figura original se transforma en un punto `P'` de tal manera que `P'` está alineado con `O` y `P`, y la distancia `OP'` es `k` veces la distancia `OP`.

`OP' = k * OP`

- Si **`|k| > 1`**, es una **ampliación**.
- Si **`0 < |k| < 1`**, es una **reducción**.
- Si **`k > 0`**, la figura homotética está al mismo lado del centro que la original (homotecia directa).
- Si **`k < 0`**, la figura homotética está al lado opuesto y se invierte (homotecia inversa).

## Homotecia y Semejanza

Dos figuras son **semejantes** si tienen la misma forma pero no necesariamente el mismo tamaño. La homotecia es una manera de generar figuras semejantes. La razón de semejanza entre dos figuras homotéticas es el valor absoluto de la razón de homotecia `|k|`.

## Ejemplo Práctico

Tenemos un triángulo con vértices `A=(2,1)`, `B=(4,1)` y `C=(2,3)`. Aplicamos una homotecia con centro en el origen `O=(0,0)` y razón `k=2`.

**Pregunta:** ¿Cuáles son las coordenadas de los nuevos vértices A', B' y C'?

1.  **Aplicamos la fórmula de homotecia:** Para cada punto, multiplicamos sus coordenadas por la razón `k`.
    - `A' = k * A = 2 * (2, 1) = (4, 2)`
    - `B' = k * B = 2 * (4, 1) = (8, 2)`
    - `C' = k * C = 2 * (2, 3) = (4, 6)`

**Respuesta:** El nuevo triángulo A'B'C' tendrá los vértices en `(4,2)`, `(8,2)` y `(4,6)`. Será el doble de grande que el original.

**En GeoGebra:** Puedes usar la herramienta `Homotecia` seleccionando la figura, el centro y la razón.