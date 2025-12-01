# Sistema de Generación de Pools con Auto-Corrección IA

## 🎯 Objetivo
Generar pools de 100 ejercicios por materia sin perder ningún ejercicio, incluso cuando la IA genera JSON malformado.

## 🔄 Flujo de Auto-Corrección

### Cuando se genera un lote de ejercicios:

```
┌─────────────────────────────────────────────────────────┐
│ 1️⃣ IA genera ejercicios                                 │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│ 2️⃣ Intenta parsear JSON directamente                    │
│    ✅ Éxito → Agrega ejercicios                         │
│    ❌ Falla → Continúa al paso 3                        │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│ 3️⃣ Limpia el JSON (remueve comentarios, trailing       │
│    commas, etc.) e intenta parsear de nuevo             │
│    ✅ Éxito → Agrega ejercicios                         │
│    ❌ Falla → Continúa al paso 4                        │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│ 4️⃣ 🤖 PIDE A LA IA QUE CORRIJA EL JSON                 │
│    - Envía el JSON malformado + error                   │
│    - IA intenta corregirlo                               │
│    ✅ Éxito → Agrega ejercicios                         │
│    ❌ Falla → Continúa al paso 5                        │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│ 5️⃣ 🛑 ERROR FATAL - DETIENE EL PROCESO                 │
│    - Muestra el JSON problemático                       │
│    - Muestra todos los errores                          │
│    - Requiere intervención manual                       │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Sistema de Auto-Recuperación

El script `auto-recover-generation.sh` monitorea el proceso cada 30 segundos y:

### Detecta y reinicia en estos casos:

| Condición | Acción | Razón |
|-----------|--------|-------|
| **Error Fatal** | 🛑 Detiene y notifica | Requiere intervención manual |
| **>5 errores JSON** | 🔄 Reinicia proceso | Problema sistemático con API key |
| **Proceso muere** | 🔄 Reinicia proceso | Error inesperado |
| **Completado** | ✅ Termina | Trabajo finalizado |

## 📊 Garantías del Sistema

### ✅ NO se pierden ejercicios porque:
1. **Múltiples intentos de parsing**: 3 intentos antes de fallar
2. **Auto-corrección con IA**: La IA intenta arreglar JSON malformado
3. **Detención en caso de fallo**: Si no puede corregirse, se detiene para revisión manual
4. **Logs detallados**: Todo queda registrado para debugging

### ✅ Recuperación automática de errores:
- **52 API keys**: Rotación masiva para evitar rate limits
- **Auto-reinicio**: Hasta 10 reintentos automáticos
- **Monitoreo continuo**: Detecta problemas cada 30 segundos

## 📝 Archivos de Log

- **`generation-output.log`**: Progreso de generación en tiempo real
- **`auto-recover.log`**: Log del sistema de auto-recuperación

## 🚀 Comandos Útiles

```bash
# Ver progreso en tiempo real
tail -f generation-output.log

# Ver estado del auto-recovery
tail -f auto-recover.log

# Verificar pools completados
npx tsx scripts/check-r2-pools.ts

# Ver procesos activos
ps aux | grep "continue-generation"
```

## 🎯 Resultado Esperado

Con este sistema:
- ✅ **100 ejercicios por materia** (garantizado)
- ✅ **Sin pérdida de datos** (auto-corrección + detención en fallos)
- ✅ **Recuperación automática** (reintentos inteligentes)
- ✅ **Intervención manual solo cuando es necesario** (errores irrecuperables)
