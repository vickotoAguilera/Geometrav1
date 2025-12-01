# 🎮 Comandos de Gestión - Generación de Pools

Comandos para gestionar la generación de pools de ejercicios en segundo plano.

---

## 📚 2° Medio

### 🚀 Iniciar Generación
Inicia el proceso de generación en segundo plano.

    cd ~/Documentos/dev-tools && ./start-segundo-medio.sh

### 📊 Ver Estado y Progreso
Muestra el estado actual, uso de recursos y progreso.

    cd ~/Documentos/dev-tools && ./status-segundo-medio.sh

### 👀 Ver Log en Tiempo Real
Sigue el log en tiempo real (Ctrl+C para salir).

    tail -f ~/Documentos/dev-tools/segundo-medio.log

### 📈 Ver Estado Actualizado Automáticamente
Actualiza el estado cada 30 segundos.

    cd ~/Documentos/dev-tools && watch -n 30 ./status-segundo-medio.sh

### ⏸️ Pausar/Reanudar
Primera ejecución: pausa. Segunda ejecución: reanuda.

    cd ~/Documentos/dev-tools && ./pause-segundo-medio.sh

### 🛑 Detener
Detiene el proceso completamente.

    cd ~/Documentos/dev-tools && ./stop-segundo-medio.sh

### ✅ Ver Pools Completados
Lista todos los pools generados con estadísticas.

    cd ~/Documentos/dev-tools && ./completed-segundo-medio.sh

---

## 📚 3° Medio

### 🚀 Iniciar Generación
*Pendiente de crear*

    cd ~/Documentos/dev-tools && ./start-tercero-medio.sh

### 📊 Ver Estado y Progreso
*Pendiente de crear*

    cd ~/Documentos/dev-tools && ./status-tercero-medio.sh

### 👀 Ver Log en Tiempo Real
*Pendiente de crear*

    tail -f ~/Documentos/dev-tools/tercero-medio.log

### 📈 Ver Estado Actualizado Automáticamente
*Pendiente de crear*

    cd ~/Documentos/dev-tools && watch -n 30 ./status-tercero-medio.sh

### ⏸️ Pausar/Reanudar
*Pendiente de crear*

    cd ~/Documentos/dev-tools && ./pause-tercero-medio.sh

### 🛑 Detener
*Pendiente de crear*

    cd ~/Documentos/dev-tools && ./stop-tercero-medio.sh

### ✅ Ver Pools Completados
*Pendiente de crear*

    cd ~/Documentos/dev-tools && ./completed-tercero-medio.sh

---

## 📚 4° Medio

### 🚀 Iniciar Generación
*Pendiente de crear*

    cd ~/Documentos/dev-tools && ./start-cuarto-medio.sh

### 📊 Ver Estado y Progreso
*Pendiente de crear*

    cd ~/Documentos/dev-tools && ./status-cuarto-medio.sh

### 👀 Ver Log en Tiempo Real
*Pendiente de crear*

    tail -f ~/Documentos/dev-tools/cuarto-medio.log

### 📈 Ver Estado Actualizado Automáticamente
*Pendiente de crear*

    cd ~/Documentos/dev-tools && watch -n 30 ./status-cuarto-medio.sh

### ⏸️ Pausar/Reanudar
*Pendiente de crear*

    cd ~/Documentos/dev-tools && ./pause-cuarto-medio.sh

### 🛑 Detener
*Pendiente de crear*

    cd ~/Documentos/dev-tools && ./stop-cuarto-medio.sh

### ✅ Ver Pools Completados
*Pendiente de crear*

    cd ~/Documentos/dev-tools && ./completed-cuarto-medio.sh

---

## 🔧 Comandos Útiles Generales

### Ver todos los procesos en ejecución

    ps aux | grep generate-

### Ver todos los logs

    ls -lh ~/Documentos/dev-tools/*.log

### Limpiar logs antiguos

    rm ~/Documentos/dev-tools/*.log

### Ver espacio usado por logs

    du -sh ~/Documentos/dev-tools/*.log

### Buscar errores en logs

    grep "❌" ~/Documentos/dev-tools/*.log

### Contar pools completados en todos los niveles

    grep -c "✅ Pool subido" ~/Documentos/dev-tools/*.log

---

## 📋 Notas

- Todos los scripts deben ejecutarse desde `~/Documentos/dev-tools/`
- Los procesos continúan desde donde se detuvieron (auto-recovery)
- Los logs se guardan automáticamente
- Puedes tener múltiples niveles corriendo simultáneamente
- Usa `Ctrl+C` para salir de `tail -f` o `watch`

---

## 🎯 Flujo Recomendado

1. **Iniciar**: `./start-[nivel]-medio.sh`
2. **Monitorear**: `tail -f ~/Documentos/dev-tools/[nivel]-medio.log`
3. **Verificar**: `./status-[nivel]-medio.sh` (en otra terminal)
4. **Completados**: `./completed-[nivel]-medio.sh`
5. **Detener**: `./stop-[nivel]-medio.sh` (cuando termine o necesites)

---

*Última actualización: 2025-12-01*
