# 🎮 Comandos de Gestión - Generación de Pools

Comandos para gestionar la generación de pools de ejercicios en segundo plano.

---

## 📚 2° Medio

### 🚀 Iniciar Generación
```bash
cd ~/Documentos/dev-tools && ./start-segundo-medio.sh
```
Inicia el proceso de generación en segundo plano.

### 📊 Ver Estado y Progreso
```bash
cd ~/Documentos/dev-tools && ./status-segundo-medio.sh
```
Muestra el estado actual, uso de recursos y progreso.

### 👀 Ver Log en Tiempo Real
```bash
tail -f ~/Documentos/dev-tools/segundo-medio.log
```
Sigue el log en tiempo real (Ctrl+C para salir).

### 📈 Ver Estado Actualizado Automáticamente
```bash
cd ~/Documentos/dev-tools && watch -n 30 ./status-segundo-medio.sh
```
Actualiza el estado cada 30 segundos.

### ⏸️ Pausar/Reanudar
```bash
cd ~/Documentos/dev-tools && ./pause-segundo-medio.sh
```
Primera ejecución: pausa. Segunda ejecución: reanuda.

### 🛑 Detener
```bash
cd ~/Documentos/dev-tools && ./stop-segundo-medio.sh
```
Detiene el proceso completamente.

### ✅ Ver Pools Completados
```bash
cd ~/Documentos/dev-tools && ./completed-segundo-medio.sh
```
Lista todos los pools generados con estadísticas.

---

## 📚 3° Medio

### 🚀 Iniciar Generación
```bash
cd ~/Documentos/dev-tools && ./start-tercero-medio.sh
```
*Pendiente de crear*

### 📊 Ver Estado y Progreso
```bash
cd ~/Documentos/dev-tools && ./status-tercero-medio.sh
```
*Pendiente de crear*

### 👀 Ver Log en Tiempo Real
```bash
tail -f ~/Documentos/dev-tools/tercero-medio.log
```
*Pendiente de crear*

### 📈 Ver Estado Actualizado Automáticamente
```bash
cd ~/Documentos/dev-tools && watch -n 30 ./status-tercero-medio.sh
```
*Pendiente de crear*

### ⏸️ Pausar/Reanudar
```bash
cd ~/Documentos/dev-tools && ./pause-tercero-medio.sh
```
*Pendiente de crear*

### 🛑 Detener
```bash
cd ~/Documentos/dev-tools && ./stop-tercero-medio.sh
```
*Pendiente de crear*

### ✅ Ver Pools Completados
```bash
cd ~/Documentos/dev-tools && ./completed-tercero-medio.sh
```
*Pendiente de crear*

---

## 📚 4° Medio

### 🚀 Iniciar Generación
```bash
cd ~/Documentos/dev-tools && ./start-cuarto-medio.sh
```
*Pendiente de crear*

### 📊 Ver Estado y Progreso
```bash
cd ~/Documentos/dev-tools && ./status-cuarto-medio.sh
```
*Pendiente de crear*

### 👀 Ver Log en Tiempo Real
```bash
tail -f ~/Documentos/dev-tools/cuarto-medio.log
```
*Pendiente de crear*

### 📈 Ver Estado Actualizado Automáticamente
```bash
cd ~/Documentos/dev-tools && watch -n 30 ./status-cuarto-medio.sh
```
*Pendiente de crear*

### ⏸️ Pausar/Reanudar
```bash
cd ~/Documentos/dev-tools && ./pause-cuarto-medio.sh
```
*Pendiente de crear*

### 🛑 Detener
```bash
cd ~/Documentos/dev-tools && ./stop-cuarto-medio.sh
```
*Pendiente de crear*

### ✅ Ver Pools Completados
```bash
cd ~/Documentos/dev-tools && ./completed-cuarto-medio.sh
```
*Pendiente de crear*

---

## 🔧 Comandos Útiles Generales

### Ver todos los procesos en ejecución
```bash
ps aux | grep generate-
```

### Ver todos los logs
```bash
ls -lh ~/Documentos/dev-tools/*.log
```

### Limpiar logs antiguos
```bash
rm ~/Documentos/dev-tools/*.log
```

### Ver espacio usado por logs
```bash
du -sh ~/Documentos/dev-tools/*.log
```

### Buscar errores en logs
```bash
grep "❌" ~/Documentos/dev-tools/*.log
```

### Contar pools completados en todos los niveles
```bash
grep -c "✅ Pool subido" ~/Documentos/dev-tools/*.log
```

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
