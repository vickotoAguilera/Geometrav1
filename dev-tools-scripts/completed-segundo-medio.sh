#!/bin/bash

# Script para ver los pools completados

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/segundo-medio.log"
PROJECT_DIR="/home/vickoto/Documentos/geometra"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   ✅ POOLS COMPLETADOS - 2° MEDIO                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si existe el log
if [ ! -f "$LOG_FILE" ]; then
    echo "⚠️  No se encontró archivo de log"
    echo "   El proceso aún no se ha ejecutado"
    echo ""
    exit 0
fi

# Extraer información de pools completados del log
echo "📦 Pools generados exitosamente:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

COMPLETED_COUNT=0
while IFS= read -r line; do
    if [[ $line =~ "📚 "(.+) ]]; then
        CURRENT_SUBJECT="${BASH_REMATCH[1]}"
    fi
    
    if [[ $line =~ "✅ Pool subido" ]]; then
        ((COMPLETED_COUNT++))
        EXERCISES=$(echo "$line" | grep -oP '📦 \K\d+')
        HINTS=$(echo "$line" | grep -oP '💡 \K\d+')
        
        echo ""
        echo "  $COMPLETED_COUNT. $CURRENT_SUBJECT"
        echo "     📦 Ejercicios: $EXERCISES"
        echo "     💡 Con hints: $HINTS"
    fi
done < "$LOG_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Resumen
TOTAL=7
PERCENT=$((COMPLETED_COUNT * 100 / TOTAL))

echo "📊 Resumen:"
echo "   Completados: $COMPLETED_COUNT / $TOTAL"
echo "   Progreso: ${PERCENT}%"
echo ""

# Barra de progreso
FILLED=$((PERCENT / 2))
EMPTY=$((50 - FILLED))
printf "   ["
printf "%${FILLED}s" | tr ' ' '█'
printf "%${EMPTY}s" | tr ' ' '░'
printf "] ${PERCENT}%%\n"
echo ""

# Mostrar pendientes si los hay
if [ $COMPLETED_COUNT -lt $TOTAL ]; then
    PENDING=$((TOTAL - COMPLETED_COUNT))
    echo "⏳ Pendientes: $PENDING materias"
    echo ""
fi

# Verificar en R2 (opcional, requiere el script de TypeScript)
if [ -f "$PROJECT_DIR/scripts/check-r2-pools.ts" ]; then
    echo "🔍 Verificando en R2..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cd "$PROJECT_DIR"
    npx tsx scripts/check-r2-pools.ts 2>/dev/null | grep -A 20 "segundo-medio" || echo "   (No disponible)"
    echo ""
fi

echo "💡 Comandos:"
echo "   - Ver log completo:  cat $LOG_FILE"
echo "   - Ver estado:        ./status-segundo-medio.sh"
echo ""
