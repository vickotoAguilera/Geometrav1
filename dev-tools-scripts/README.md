# Scripts de Gestión - Generación 2° Medio

Scripts para gestionar la generación de pools de ejercicios de 2° Medio en segundo plano.

## 📋 Scripts Disponibles

### 🚀 `start-segundo-medio.sh`
Inicia el proceso de generación en segundo plano.

```bash
./start-segundo-medio.sh
```

**Características:**
- Ejecuta el proceso en background
- Guarda el PID para control posterior
- Registra toda la salida en un log
- Verifica que no haya otro proceso corriendo

### 📊 `status-segundo-medio.sh`
Muestra el estado actual del proceso.

```bash
./status-segundo-medio.sh
```

**Muestra:**
- Estado del proceso (corriendo/pausado)
- Uso de CPU y RAM
- Tiempo de ejecución
- Progreso de pools completados
- Últimas líneas del log

### ⏸️ `pause-segundo-medio.sh`
Pausa o reanuda el proceso.

```bash
./pause-segundo-medio.sh
```

**Funcionalidad:**
- Primera ejecución: pausa el proceso
- Segunda ejecución: reanuda el proceso
- El proceso pausado no consume CPU
- Mantiene el estado en memoria

### 🛑 `stop-segundo-medio.sh`
Detiene el proceso completamente.

```bash
./stop-segundo-medio.sh
```

**Características:**
- Intenta detener gracefully primero (SIGTERM)
- Si no responde, fuerza la detención (SIGKILL)
- Muestra resumen de pools completados
- Limpia archivos de control

### ✅ `completed-segundo-medio.sh`
Muestra los pools completados.

```bash
./completed-segundo-medio.sh
```

**Información:**
- Lista de pools generados
- Número de ejercicios por pool
- Número de hints generados
- Progreso total con barra visual
- Verificación opcional en R2

## 🔧 Instalación

1. **Mover scripts a dev-tools:**
   ```bash
   mv /home/vickoto/Documentos/geometra/dev-tools-scripts/* /home/vickoto/Documentos/dev-tools/
   ```

2. **Dar permisos de ejecución:**
   ```bash
   cd /home/vickoto/Documentos/dev-tools
   chmod +x *.sh
   ```

## 📖 Flujo de Uso

### Inicio típico:
```bash
# 1. Iniciar el proceso
./start-segundo-medio.sh

# 2. Ver el progreso
./status-segundo-medio.sh

# 3. Ver pools completados
./completed-segundo-medio.sh

# 4. Seguir el log en tiempo real (opcional)
tail -f segundo-medio.log
```

### Pausar temporalmente:
```bash
# Pausar
./pause-segundo-medio.sh

# ... hacer otras cosas ...

# Reanudar
./pause-segundo-medio.sh
```

### Detener:
```bash
./stop-segundo-medio.sh
```

## 📁 Archivos Generados

- `segundo-medio.pid` - PID del proceso en ejecución
- `segundo-medio.log` - Log completo de la generación
- `segundo-medio.status` - Estado actual (running/paused)

## 💡 Tips

1. **Ver log en tiempo real:**
   ```bash
   tail -f segundo-medio.log
   ```

2. **Buscar errores:**
   ```bash
   grep "❌" segundo-medio.log
   ```

3. **Contar pools completados:**
   ```bash
   grep -c "✅ Pool subido" segundo-medio.log
   ```

4. **Ver solo resúmenes:**
   ```bash
   grep "📚" segundo-medio.log
   ```

## 🔄 Recuperación Automática

El script `generate-segundo-medio.ts` incluye:
- ✅ Verificación de pools ya completados
- ✅ Continuación desde donde se detuvo
- ✅ Manejo de interrupciones (Ctrl+C)
- ✅ Guardado automático de progreso

Puedes detener y reiniciar el proceso sin perder progreso.

## ⚠️ Notas Importantes

- Los scripts deben ejecutarse desde la carpeta `dev-tools`
- El proceso puede tardar varias horas en completar
- Se recomienda monitorear el uso de recursos
- Los pools se guardan automáticamente en R2
- El progreso se mantiene entre reinicios
