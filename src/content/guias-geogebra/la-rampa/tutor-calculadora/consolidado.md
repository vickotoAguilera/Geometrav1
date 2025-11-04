# CONTEXTO CONSOLIDADO: MÓDULO 1.1 - LA RAMPA (TUTOR CALCULADORA)

Este documento contiene toda la información teórica y conceptual para los ejercicios del Módulo 1.1 "La Rampa", que el usuario resolverá usando lógica y una calculadora.

---
### SITUACIÓN GENERAL
Un usuario está trabajando en un módulo sobre el diseño de rampas. Se analizan conceptos como pendiente, razones trigonométricas y dimensiones. El módulo contiene varias actividades, incluyendo dos tablas interactivas que el usuario debe completar.

---
### CONTEXTO DE LA TABLA - ACTIVIDAD 1: CÁLCULO DE DIFERENCIA DE NIVEL
En esta actividad, el usuario debe completar una tabla. Se le da la **Distancia Horizontal (D)** y la **Pendiente (%)** de varias rampas. Su tarea es calcular la "Diferencia de Nivel (N)".

**Lógica de Resolución que debes guiar:**
- La pendiente como decimal se calcula dividiendo el porcentaje por 100 (ej: 12% = 0.12).
- La fórmula es: `Diferencia de Nivel = Distancia Horizontal * Pendiente (como decimal)`.
- Ejemplo para guiar al usuario: "Para una distancia de 100 cm y una pendiente del 12%, el cálculo es `100 * 0.12`, lo que da 12 cm. ¿Puedes aplicar esa misma lógica para los otros valores?".

---
### CONTEXTO DE LA TABLA - ACTIVIDAD 4: RAZONES TRIGONOMÉTRICAS
En esta actividad, el usuario debe completar una tabla mucho más compleja. Para diferentes pendientes (12%, 8%, 6%), debe calcular:
1.  **Ángulo (α):** Se obtiene a partir de la tangente de la pendiente. `α = arctan(Pendiente como decimal)`.
2.  **Seno, Coseno y Tangente:** Se calculan a partir del ángulo `α` ya encontrado.
3.  **Cocientes (N/H, N/D, D/H):** El usuario debe notar que estos cocientes son equivalentes a las razones trigonométricas. `N/D` es la tangente, `N/H` es el seno y `D/H` es el coseno.

**Lógica de Resolución que debes guiar:**
- Para el ángulo `α`: "Para encontrar el ángulo a partir de la pendiente, debes usar la función inversa de la tangente, que es arcotangente (`atan` o `tan⁻¹`). Por ejemplo, para una pendiente del 12% (0.12), ¿qué resultado te da `atan(0.12)` en tu calculadora?".
- Para las razones: "Una vez que tienes el ángulo, puedes calcular su seno, coseno y tangente directamente".
- Para los cocientes: "Observa las columnas. ¿Notas alguna relación entre `tan(α)` y el cociente `N/D`? Deberían ser iguales, ya que ambos representan la pendiente."

---
### EJERCICIOS DE CÁLCULO (Actividad 5)

**Problema 1: ¿Qué funciones inversas se usan?**
- **Guía:** Recuérdale al usuario las funciones `arcsin` (o `sin⁻¹`), `arccos` (o `cos⁻¹`) y `arctan` (o `tan⁻¹`), que permiten encontrar un ángulo a partir de una razón.

**Problema 2: Pendiente para un ángulo de 4°**
- **Guía:** "Si conoces el ángulo, ¿qué razón trigonométrica (seno, coseno o tangente) representa la pendiente? Calcula `tan(4°)` y luego convierte ese decimal a porcentaje."
- **Cálculo:** `tan(4°) ≈ 0.0699`, que es aproximadamente 7%.

**Problema 3: Distancia horizontal para una altura de 25 cm y ángulo de 4°**
- **Guía:** "Ya conoces la altura (Cateto Opuesto = 25 cm) y el ángulo (4°). Necesitas encontrar la Distancia Horizontal (Cateto Adyacente). Revisa SOH-CAH-TOA. ¿Qué fórmula relaciona Opuesto y Adyacente?".
- **Resolución:** `tan(4°) = 25 / D`, por lo tanto `D = 25 / tan(4°)`.
- **Cálculo:** `D ≈ 25 / 0.0699 ≈ 357.6` cm.
