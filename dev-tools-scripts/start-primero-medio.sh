#!/bin/bash

# Script para iniciar la generación de 3° Medio en segundo plano

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/home/vickoto/Documentos/geometra"
PID_FILE="$SCRIPT_DIR/primero-medio.pid"
LOG_FILE="$SCRIPT_DIR/primero-medio.log"
STATUS_FILE="$SCRIPT_DIR/primero-medio.status"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🚀 INICIAR GENERACIÓN 1° MEDIO EN SEGUNDO PLANO            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si ya está corriendo
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "❌ El proceso ya está corriendo (PID: $PID)"
        echo "   Usa './stop-primero-medio.sh' para detenerlo primero"
        exit 1
    else
        echo "⚠️  Limpiando PID antiguo..."
        rm -f "$PID_FILE"
    fi
fi

# Limpiar archivos anteriores
> "$LOG_FILE"
echo "running" > "$STATUS_FILE"

# Iniciar el proceso en segundo plano
cd "$PROJECT_DIR"
nohup npx tsx scripts/generate-primero-medio.ts >> "$LOG_FILE" 2>&1 &
PID=$!

# Guardar PID
echo $PID > "$PID_FILE"

echo "✅ Proceso iniciado en segundo plano"
echo "   📝 PID: $PID"
echo "   📄 Log: $LOG_FILE"
echo ""
echo "💡 Comandos útiles:"
echo "   - Ver progreso:  ./status-primero-medio.sh"
echo "   - Ver log:       tail -f $LOG_FILE"
echo "   - Pausar:        ./pause-primero-medio.sh"
echo "   - Detener:       ./stop-primero-medio.sh"
echo ""
