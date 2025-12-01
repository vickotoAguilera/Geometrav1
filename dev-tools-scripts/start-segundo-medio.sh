#!/bin/bash

# Script para iniciar la generación de 2° Medio en segundo plano

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/home/vickoto/Documentos/geometra"
PID_FILE="$SCRIPT_DIR/segundo-medio.pid"
LOG_FILE="$SCRIPT_DIR/segundo-medio.log"
STATUS_FILE="$SCRIPT_DIR/segundo-medio.status"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🚀 INICIAR GENERACIÓN 2° MEDIO EN SEGUNDO PLANO            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si ya está corriendo
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "❌ El proceso ya está corriendo (PID: $PID)"
        echo "   Usa './stop-segundo-medio.sh' para detenerlo primero"
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
nohup npx tsx scripts/generate-segundo-medio.ts >> "$LOG_FILE" 2>&1 &
PID=$!

# Guardar PID
echo $PID > "$PID_FILE"

echo "✅ Proceso iniciado en segundo plano"
echo "   📝 PID: $PID"
echo "   📄 Log: $LOG_FILE"
echo ""
echo "💡 Comandos útiles:"
echo "   - Ver progreso:  ./status-segundo-medio.sh"
echo "   - Ver log:       tail -f $LOG_FILE"
echo "   - Pausar:        ./pause-segundo-medio.sh"
echo "   - Detener:       ./stop-segundo-medio.sh"
echo ""
