#!/bin/bash

# Script para monitorear logs del servidor Next.js
# Guarda los logs en un archivo que puedes revisar

LOG_FILE="server-logs.txt"

echo "📝 Monitoreando logs del servidor..."
echo "Los logs se guardarán en: $LOG_FILE"
echo ""
echo "Presiona Ctrl+C para detener el monitoreo"
echo ""

# Limpiar archivo de logs anterior
> "$LOG_FILE"

# Buscar el proceso de Next.js
PID=$(pgrep -f "next dev")

if [ -z "$PID" ]; then
    echo "❌ No se encontró el servidor Next.js corriendo"
    echo "Inicia el servidor con: npm run dev"
    exit 1
fi

echo "✅ Servidor encontrado (PID: $PID)"
echo "📊 Monitoreando logs..."
echo ""

# Monitorear los logs del proceso
tail -f /proc/$PID/fd/1 /proc/$PID/fd/2 2>/dev/null | tee -a "$LOG_FILE"
