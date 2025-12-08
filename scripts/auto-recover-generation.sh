#!/bin/bash

# Script de auto-recuperación para generación de pools
# Monitorea el proceso y lo reinicia automáticamente si falla

LOG_FILE="generation-output.log"
SCRIPT_PATH="scripts/master-generation.sh"
MAX_RETRIES=10
RETRY_COUNT=0

echo "🔄 Iniciando sistema de auto-recuperación..."
echo "📝 Log: $LOG_FILE"
echo "🔁 Reintentos máximos: $MAX_RETRIES"
echo ""

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Intento #$((RETRY_COUNT + 1)) - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Limpiar procesos anteriores
    pkill -f "master-generation.sh" 2>/dev/null
    pkill -f "continue-generation.ts" 2>/dev/null
    pkill -f "verify-and-complete-pools.ts" 2>/dev/null
    sleep 2
    
    # Iniciar proceso en segundo plano
    nohup bash "$SCRIPT_PATH" > "$LOG_FILE" 2>&1 &
    PID=$!
    
    echo "✅ Proceso iniciado (PID: $PID)"
    echo "📊 Monitoreando progreso..."
    echo ""
    
    # Monitorear el proceso
    while kill -0 $PID 2>/dev/null; do
        sleep 30
        
        # Verificar si hay errores fatales en el log
        if tail -20 "$LOG_FILE" | grep -q "Error fatal"; then
            echo "❌ Error fatal detectado!"
            echo "🔍 Últimas líneas del log:"
            tail -10 "$LOG_FILE" | sed 's/^/   /'
            echo ""
            
            # Matar el proceso
            kill $PID 2>/dev/null
            sleep 2
            
            RETRY_COUNT=$((RETRY_COUNT + 1))
            echo "⏳ Esperando 10 segundos antes de reintentar..."
            sleep 10
            break
        fi
        
        # Verificar si hay muchos errores de JSON parsing (más de 5 en las últimas 50 líneas)
        JSON_ERRORS=$(tail -50 "$LOG_FILE" | grep -c "Error generating exercises.*JSON" || echo "0")
        if [ "$JSON_ERRORS" -gt 5 ]; then
            echo "⚠️  Demasiados errores de JSON parsing detectados ($JSON_ERRORS)"
            echo "🔄 Reiniciando para intentar con otras API keys..."
            
            # Matar el proceso
            kill $PID 2>/dev/null
            sleep 2
            
            RETRY_COUNT=$((RETRY_COUNT + 1))
            echo "⏳ Esperando 10 segundos antes de reintentar..."
            sleep 10
            break
        fi
        
        # Verificar si el proceso terminó exitosamente
        if ! kill -0 $PID 2>/dev/null; then
            if tail -5 "$LOG_FILE" | grep -q "✅ Proceso completado"; then
                echo "🎉 ¡Generación completada exitosamente!"
                exit 0
            fi
        fi
    done
    
    # Si el proceso terminó pero no fue exitoso
    if ! kill -0 $PID 2>/dev/null; then
        if ! tail -5 "$LOG_FILE" | grep -q "✅ Proceso completado"; then
            echo "⚠️  Proceso terminó inesperadamente"
            RETRY_COUNT=$((RETRY_COUNT + 1))
            echo "⏳ Esperando 10 segundos antes de reintentar..."
            sleep 10
        fi
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ Se alcanzó el máximo de reintentos ($MAX_RETRIES)"
echo "📋 Revisa el log: $LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit 1
