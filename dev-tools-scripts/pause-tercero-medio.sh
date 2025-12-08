#!/bin/bash

# Script para pausar/reanudar la generación de 3° Medio

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/tercero-medio.pid"
STATUS_FILE="$SCRIPT_DIR/tercero-medio.status"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   ⏸️  PAUSAR/REANUDAR GENERACIÓN 3° MEDIO                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si el proceso existe
if [ ! -f "$PID_FILE" ]; then
    echo "❌ No hay proceso en ejecución"
    exit 1
fi

PID=$(cat "$PID_FILE")

# Verificar si el proceso está corriendo
if ! ps -p $PID > /dev/null 2>&1; then
    echo "❌ El proceso no está corriendo (PID: $PID)"
    rm -f "$PID_FILE"
    exit 1
fi

# Leer estado actual
STATUS="running"
if [ -f "$STATUS_FILE" ]; then
    STATUS=$(cat "$STATUS_FILE")
fi

# Toggle pause/resume
if [ "$STATUS" = "running" ]; then
    # Pausar
    kill -STOP $PID
    echo "paused" > "$STATUS_FILE"
    echo "⏸️  Proceso pausado (PID: $PID)"
    echo "   El proceso está suspendido y no consume CPU"
    echo "   Ejecuta este script nuevamente para reanudar"
else
    # Reanudar
    kill -CONT $PID
    echo "running" > "$STATUS_FILE"
    echo "▶️  Proceso reanudado (PID: $PID)"
    echo "   La generación continúa desde donde se pausó"
fi

echo ""
echo "💡 Ver estado: ./status-tercero-medio.sh"
echo ""
