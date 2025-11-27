---
title: 'Semejanza de Triángulos'
description: 'Aprende sobre triángulos semejantes y sus aplicaciones en geometría.'
---

## ¿Qué es la Semejanza?

Dos figuras son **semejantes** cuando tienen la misma forma pero no necesariamente el mismo tamaño. En el caso de los triángulos, dos triángulos son semejantes si:

1. Sus **ángulos correspondientes son iguales**
2. Sus **lados correspondientes son proporcionales**

Se denota: $\triangle ABC \sim \triangle DEF$ (el símbolo $\sim$ significa "es semejante a")

## Criterios de Semejanza

Existen tres criterios principales para determinar si dos triángulos son semejantes:

### 1. Criterio AA (Ángulo-Ángulo)

Si dos ángulos de un triángulo son iguales a dos ángulos de otro triángulo, entonces los triángulos son semejantes.

**Nota:** Como la suma de los ángulos internos de un triángulo es 180°, si dos ángulos son iguales, el tercero también lo será.

### 2. Criterio LAL (Lado-Ángulo-Lado)

Si dos lados de un triángulo son proporcionales a dos lados de otro triángulo, y los ángulos comprendidos entre esos lados son iguales, entonces los triángulos son semejantes.

### 3. Criterio LLL (Lado-Lado-Lado)

Si los tres lados de un triángulo son proporcionales a los tres lados de otro triángulo, entonces los triángulos son semejantes.

## Razón de Semejanza

La **razón de semejanza** $k$ es el cociente entre las longitudes de lados correspondientes:

$$k = \frac{\text{Lado del triángulo 1}}{\text{Lado correspondiente del triángulo 2}}$$

### Propiedades de la Razón de Semejanza

Si dos triángulos son semejantes con razón $k$:
- **Perímetros**: La razón de perímetros es $k$
- **Áreas**: La razón de áreas es $k^2$
- **Alturas**: La razón de alturas es $k$

## Ejemplo 1: Verificar Semejanza

**Problema:** El triángulo ABC tiene lados de 3, 4 y 5 cm. El triángulo DEF tiene lados de 6, 8 y 10 cm. ¿Son semejantes?

**Solución:**
Verificamos si los lados son proporcionales:
$$\frac{6}{3} = 2, \quad \frac{8}{4} = 2, \quad \frac{10}{5} = 2$$

Como todos los cocientes son iguales ($k = 2$), por el criterio **LLL**, los triángulos **son semejantes**.

## Ejemplo 2: Encontrar un Lado Desconocido

**Problema:** Dos triángulos semejantes tienen una razón de semejanza de 3. Si un lado del triángulo pequeño mide 4 cm, ¿cuánto mide el lado correspondiente del triángulo grande?

**Solución:**
$$k = \frac{\text{Lado grande}}{\text{Lado pequeño}}$$
$$3 = \frac{x}{4}$$
$$x = 3 \times 4 = 12 \text{ cm}$$

## Ejemplo 3: Razón de Áreas

**Problema:** Dos triángulos semejantes tienen razón de semejanza $k = 2$. Si el área del triángulo pequeño es 10 cm², ¿cuál es el área del triángulo grande?

**Solución:**
La razón de áreas es $k^2 = 2^2 = 4$

$$\frac{\text{Área grande}}{\text{Área pequeña}} = 4$$
$$\frac{\text{Área grande}}{10} = 4$$
$$\text{Área grande} = 40 \text{ cm}^2$$

## Teorema de Tales

El **Teorema de Tales** es una aplicación importante de la semejanza:

Si tres o más rectas paralelas son cortadas por dos transversales, los segmentos determinados en una transversal son proporcionales a los segmentos correspondientes en la otra.

### Aplicación Práctica

**Problema:** Queremos medir la altura de un edificio. Colocamos un palo de 2 metros que proyecta una sombra de 1.5 metros. Al mismo tiempo, el edificio proyecta una sombra de 15 metros. ¿Cuál es la altura del edificio?

**Solución:**
Los triángulos formados por el palo y su sombra, y el edificio y su sombra, son semejantes (tienen el mismo ángulo del sol).

$$\frac{\text{Altura edificio}}{\text{Sombra edificio}} = \frac{\text{Altura palo}}{\text{Sombra palo}}$$
$$\frac{h}{15} = \frac{2}{1.5}$$
$$h = \frac{2 \times 15}{1.5} = \frac{30}{1.5} = 20 \text{ metros}$$

## Aplicaciones

La semejanza de triángulos se usa en:
- **Mapas y planos**: Representar grandes áreas en papel
- **Fotografía**: Ampliar o reducir imágenes
- **Arquitectura**: Crear maquetas a escala
- **Topografía**: Medir distancias inaccesibles
- **Astronomía**: Calcular distancias a objetos lejanos

## En GeoGebra

Puedes explorar la semejanza en GeoGebra:
1. Crea un triángulo
2. Usa la herramienta `Homotecia` para crear un triángulo semejante
3. Mide los lados y ángulos de ambos triángulos
4. Verifica que los ángulos son iguales y los lados proporcionales
