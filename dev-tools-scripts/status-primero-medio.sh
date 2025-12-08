#!/bin/bash

# Script para ver el estado y progreso de la generación de 3° Medio

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/primero-medio.pid"
LOG_FILE="$SCRIPT_DIR/primero-medio.log"
STATUS_FILE="$SCRIPT_DIR/primero-medio.status"

clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   📊 ESTADO GENERACIÓN 1° MEDIO                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si el proceso existe
if [ ! -f "$PID_FILE" ]; then
    echo "❌ No hay proceso en ejecución"
    echo "   Usa './start-primero-medio.sh' para iniciar"
    exit 1
fi

PID=$(cat "$PID_FILE")

# Verificar si el proceso está corriendo
if ! ps -p $PID > /dev/null 2>&1; then
    echo "❌ El proceso no está corriendo (PID: $PID)"
    echo "   El proceso pudo haber terminado o fallado"
    echo ""
    echo "📄 Últimas líneas del log:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -n 20 "$LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi

# Leer estado
STATUS="running"
if [ -f "$STATUS_FILE" ]; then
    STATUS=$(cat "$STATUS_FILE")
fi

# Mostrar información del proceso
echo "✅ Proceso activo"
echo "   📝 PID: $PID"
echo "   🔄 Estado: $STATUS"
echo ""

# Obtener información del proceso
CPU=$(ps -p $PID -o %cpu --no-headers | xargs)
MEM=$(ps -p $PID -o %mem --no-headers | xargs)
TIME=$(ps -p $PID -o etime --no-headers | xargs)

echo "💻 Recursos:"
echo "   CPU: ${CPU}%"
echo "   RAM: ${MEM}%"
echo "   Tiempo: $TIME"
echo ""

# Contar pools completados
COMPLETED=$(grep -c "✅ Pool subido" "$LOG_FILE" 2>/dev/null || echo "0")
TOTAL=12  # Total de materias en 3° Medio

echo "📦 Progreso de pools:"
echo "   Completados: $COMPLETED / $TOTAL"
if [ $TOTAL -gt 0 ]; then
    PERCENT=$((COMPLETED * 100 / TOTAL))
    echo "   Porcentaje: ${PERCENT}%"
    
    # Barra de progreso
    FILLED=$((PERCENT / 2))
    EMPTY=$((50 - FILLED))
    printf "   ["
    printf "%${FILLED}s" | tr ' ' '█'
    printf "%${EMPTY}s" | tr ' ' '░'
    printf "] ${PERCENT}%%\n"
fi
echo ""

# Mostrar última actividad
echo "📝 Última actividad:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -n 10 "$LOG_FILE" | sed 's/^/   /'
echo ""

echo "💡 Comandos:"
echo "   - Ver log completo:  tail -f $LOG_FILE"
echo "   - Pausar:            ./pause-primero-medio.sh"
echo "   - Detener:           ./stop-primero-medio.sh"
echo "   - Actualizar:        ./status-primero-medio.sh"
echo ""
