---
title: 'Estadística Inferencial Básica'
description: 'Introducción a cómo hacer inferencias sobre poblaciones a partir de muestras.'
---

## ¿Qué es la Estadística Inferencial?

La **estadística inferencial** nos permite hacer conclusiones sobre una **población** completa basándonos en el análisis de una **muestra** representativa.

### Conceptos Clave

- **Población**: Conjunto completo de elementos que queremos estudiar
- **Muestra**: Subconjunto de la población que realmente observamos
- **Parámetro**: Valor que describe a la población (ej: media poblacional $\mu$)
- **Estadístico**: Valor calculado de la muestra (ej: media muestral $\bar{x}$)

## Muestreo

### Tipos de Muestreo

1. **Muestreo Aleatorio Simple**: Cada elemento tiene la misma probabilidad de ser seleccionado
2. **Muestreo Estratificado**: La población se divide en grupos (estratos) y se muestrea de cada uno
3. **Muestreo Sistemático**: Se selecciona cada k-ésimo elemento

### Tamaño de la Muestra

Una muestra más grande generalmente proporciona estimaciones más precisas, pero también es más costosa. El tamaño adecuado depende de:
- La variabilidad en la población
- El nivel de precisión deseado
- Los recursos disponibles

## Estimación Puntual

Una **estimación puntual** es un valor único que usamos para estimar un parámetro poblacional.

**Ejemplos:**
- La media muestral $\bar{x}$ estima la media poblacional $\mu$
- La proporción muestral $\hat{p}$ estima la proporción poblacional $p$

### Cálculo de la Media Muestral

$$\bar{x} = \frac{\sum_{i=1}^{n} x_i}{n}$$

## Margen de Error

El **margen de error** indica cuánto puede diferir nuestra estimación del valor real. Para una muestra grande, el margen de error aproximado es:

$$ME \approx \frac{s}{\sqrt{n}}$$

Donde:
- $s$ es la desviación estándar de la muestra
- $n$ es el tamaño de la muestra

## Ejemplo Práctico 1: Estimación de Media

**Problema:** Queremos estimar la altura promedio de los estudiantes de un colegio (1000 estudiantes). Medimos una muestra de 50 estudiantes y obtenemos:
- Media muestral: $\bar{x} = 165$ cm
- Desviación estándar: $s = 10$ cm

**Estimación:** La altura promedio de todos los estudiantes es aproximadamente **165 cm**.

**Margen de error:**
$$ME \approx \frac{10}{\sqrt{50}} \approx \frac{10}{7.07} \approx 1.41 \text{ cm}$$

Podemos decir que la altura promedio está entre 163.59 cm y 166.41 cm (aproximadamente).

## Ejemplo Práctico 2: Estimación de Proporción

**Problema:** Una encuesta a 200 personas muestra que 120 prefieren el producto A. ¿Qué proporción de toda la población prefiere el producto A?

**Solución:**
$$\hat{p} = \frac{120}{200} = 0.6 = 60\%$$

Estimamos que el **60% de la población** prefiere el producto A.

## Importancia de la Representatividad

Para que nuestras inferencias sean válidas, la muestra debe ser **representativa** de la población:
- Debe incluir la diversidad de la población
- No debe tener sesgos sistemáticos
- Debe ser suficientemente grande

## Aplicaciones

La estadística inferencial se usa para:
- Encuestas de opinión pública
- Control de calidad en manufactura
- Estudios médicos y científicos
- Análisis de mercado
- Predicciones económicas
