#!/bin/bash

# Script para detener la generación de 3° Medio

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/tercero-medio.pid"
STATUS_FILE="$SCRIPT_DIR/tercero-medio.status"
LOG_FILE="$SCRIPT_DIR/tercero-medio.log"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🛑 DETENER GENERACIÓN 3° MEDIO                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si el proceso existe
if [ ! -f "$PID_FILE" ]; then
    echo "❌ No hay proceso en ejecución"
    exit 0
fi

PID=$(cat "$PID_FILE")

# Verificar si el proceso está corriendo
if ! ps -p $PID > /dev/null 2>&1; then
    echo "⚠️  El proceso ya no está corriendo (PID: $PID)"
    rm -f "$PID_FILE" "$STATUS_FILE"
    exit 0
fi

# Intentar detener gracefully primero
echo "⏳ Deteniendo proceso (PID: $PID)..."
kill -TERM $PID

# Esperar hasta 10 segundos
for i in {1..10}; do
    if ! ps -p $PID > /dev/null 2>&1; then
        echo "✅ Proceso detenido correctamente"
        rm -f "$PID_FILE" "$STATUS_FILE"
        
        # Mostrar resumen
        echo ""
        echo "📊 Resumen:"
        COMPLETED=$(grep -c "✅ Pool subido" "$LOG_FILE" 2>/dev/null || echo "0")
        echo "   Pools completados: $COMPLETED"
        echo "   Log guardado en: $LOG_FILE"
        echo ""
        echo "💡 Puedes reiniciar con: ./start-tercero-medio.sh"
        echo "   (El proceso continuará desde donde se detuvo)"
        echo ""
        exit 0
    fi
    sleep 1
done

# Si no se detuvo, forzar
echo "⚠️  Forzando detención..."
kill -KILL $PID
sleep 1

if ! ps -p $PID > /dev/null 2>&1; then
    echo "✅ Proceso detenido (forzado)"
    rm -f "$PID_FILE" "$STATUS_FILE"
else
    echo "❌ No se pudo detener el proceso"
    exit 1
fi

echo ""
