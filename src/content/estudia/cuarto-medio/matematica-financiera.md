---
title: 'Matemática Financiera'
description: 'Aprende a tomar decisiones financieras informadas usando matemáticas.'
---

## ¿Qué es la Matemática Financiera?

La **matemática financiera** estudia el valor del dinero en el tiempo y cómo tomar decisiones financieras óptimas. Un principio fundamental es que el dinero hoy vale más que la misma cantidad en el futuro.

## Conceptos Básicos

### Interés

El **interés** es el costo de pedir dinero prestado o la ganancia por prestar dinero.

- **Capital (C)**: Cantidad inicial de dinero
- **Tasa de interés (r)**: Porcentaje que se cobra o paga
- **Tiempo (t)**: Período durante el cual se aplica el interés
- **Monto (M)**: Capital más intereses acumulados

## Interés Simple

El interés se calcula solo sobre el capital inicial:

$$I = C \cdot r \cdot t$$

$$M = C + I = C(1 + rt)$$

### Ejemplo 1: Préstamo Simple

**Problema**: Prestas \$100,000 al 5% anual de interés simple por 3 años. ¿Cuánto recibirás al final?

**Solución**:
$$I = 100,000 \times 0.05 \times 3 = 15,000$$
$$M = 100,000 + 15,000 = \$115,000$$

## Interés Compuesto

El interés se calcula sobre el capital más los intereses acumulados:

$$M = C(1 + r)^t$$

Donde:
- $C$: capital inicial
- $r$: tasa de interés por período
- $t$: número de períodos

### Ejemplo 2: Ahorro con Interés Compuesto

**Problema**: Depositas \$100,000 en una cuenta que paga 5% anual de interés compuesto. ¿Cuánto tendrás después de 3 años?

**Solución**:
$$M = 100,000(1 + 0.05)^3 = 100,000(1.05)^3 = 100,000 \times 1.157625 = \$115,762.50$$

**Comparación**: Con interés simple tendrías \$115,000. El interés compuesto te da \$762.50 más.

## Capitalización en Diferentes Períodos

Si el interés se capitaliza $n$ veces al año:

$$M = C\left(1 + \frac{r}{n}\right)^{nt}$$

**Ejemplo**: \$10,000 al 12% anual capitalizado mensualmente por 2 años:
$$M = 10,000\left(1 + \frac{0.12}{12}\right)^{12 \times 2} = 10,000(1.01)^{24} \approx \$12,697.35$$

## Anualidades

Una **anualidad** es una serie de pagos iguales realizados a intervalos regulares.

### Valor Futuro de una Anualidad

Si depositas $R$ pesos al final de cada período durante $t$ períodos a una tasa $r$:

$$VF = R \cdot \frac{(1 + r)^t - 1}{r}$$

### Ejemplo 3: Ahorro Mensual

**Problema**: Ahorras \$50,000 mensuales en una cuenta que paga 6% anual (0.5% mensual). ¿Cuánto tendrás después de 12 meses?

**Solución**:
$$VF = 50,000 \cdot \frac{(1.005)^{12} - 1}{0.005} = 50,000 \cdot \frac{1.0617 - 1}{0.005} \approx \$617,000$$

### Valor Presente de una Anualidad

El valor hoy de una serie de pagos futuros:

$$VP = R \cdot \frac{1 - (1 + r)^{-t}}{r}$$

## Amortización de Préstamos

La **amortización** es el proceso de pagar un préstamo mediante cuotas periódicas.

### Cuota de un Préstamo

Para un préstamo de $C$ pesos a una tasa $r$ por $t$ períodos:

$$R = C \cdot \frac{r(1 + r)^t}{(1 + r)^t - 1}$$

### Ejemplo 4: Préstamo Hipotecario

**Problema**: Pides un préstamo de \$10,000,000 al 8% anual (0.667% mensual) a 5 años (60 meses). ¿Cuál es la cuota mensual?

**Solución**:
$$r = \frac{0.08}{12} = 0.00667$$
$$R = 10,000,000 \cdot \frac{0.00667(1.00667)^{60}}{(1.00667)^{60} - 1}$$
$$R \approx \$202,764$$

**Total pagado**: $202,764 \times 60 = \$12,165,840$

**Intereses totales**: $12,165,840 - 10,000,000 = \$2,165,840$

## Inflación y Valor Real

La **inflación** reduce el poder adquisitivo del dinero.

**Tasa real de interés**:
$$r_{real} = \frac{1 + r_{nominal}}{1 + i} - 1$$

Donde $i$ es la tasa de inflación.

### Ejemplo 5: Efecto de la Inflación

**Problema**: Inviertes al 10% anual, pero la inflación es 3%. ¿Cuál es tu ganancia real?

**Solución**:
$$r_{real} = \frac{1.10}{1.03} - 1 = 0.0680 = 6.8\%$$

Tu ganancia real es 6.8%, no 10%.

## Decisiones de Inversión

### Valor Presente Neto (VPN)

Para evaluar si una inversión es rentable:

$$VPN = -I_0 + \sum_{t=1}^{n} \frac{F_t}{(1 + r)^t}$$

Donde:
- $I_0$: inversión inicial
- $F_t$: flujo de caja en el período $t$
- $r$: tasa de descuento

**Criterio**: Si VPN > 0, la inversión es rentable.

### Ejemplo 6: Evaluación de Proyecto

**Problema**: Inviertes \$1,000,000 hoy. Recibirás \$400,000 cada año durante 3 años. Tasa de descuento: 10%. ¿Es rentable?

**Solución**:
$$VPN = -1,000,000 + \frac{400,000}{1.1} + \frac{400,000}{1.1^2} + \frac{400,000}{1.1^3}$$
$$VPN = -1,000,000 + 363,636 + 330,579 + 300,526$$
$$VPN = -5,259$$

Como VPN < 0, **no es rentable** a esta tasa.

## Aplicaciones Prácticas

### Planificación de Jubilación

¿Cuánto debo ahorrar mensualmente para tener \$100,000,000 en 30 años al 7% anual?

### Comparación de Créditos

¿Qué es mejor: 12% anual simple o 11% anual compuesto?

### Inversión en Educación

¿Vale la pena invertir en un postgrado considerando el aumento de ingresos futuro?

## Consejos Financieros

1. **Comienza temprano**: El interés compuesto favorece el tiempo
2. **Evita deudas caras**: Las tarjetas de crédito tienen tasas muy altas
3. **Diversifica**: No pongas todo en una sola inversión
4. **Considera la inflación**: La ganancia nominal no es la ganancia real
5. **Compara opciones**: Calcula siempre antes de decidir
