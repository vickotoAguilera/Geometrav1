#!/bin/bash

# Script para agregar la API key de Resend al archivo .env.local

ENV_FILE=".env.local"

# Verificar si el archivo existe
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: El archivo $ENV_FILE no existe"
    exit 1
fi

# Verificar si ya existe la variable RESEND_API_KEY
if grep -q "^RESEND_API_KEY=" "$ENV_FILE"; then
    echo "⚠️  RESEND_API_KEY ya existe en $ENV_FILE"
    echo "Reemplazando el valor existente..."
    # Reemplazar la línea existente
    sed -i 's/^RESEND_API_KEY=.*/RESEND_API_KEY=re_ZvHLtxn3_CvTe1wG1XX48X6XZBuvoDatM/' "$ENV_FILE"
else
    echo "➕ Agregando RESEND_API_KEY a $ENV_FILE"
    # Agregar al final del archivo
    echo "RESEND_API_KEY=re_ZvHLtxn3_CvTe1wG1XX48X6XZBuvoDatM" >> "$ENV_FILE"
fi

echo "✅ RESEND_API_KEY configurada correctamente en $ENV_FILE"
echo ""
echo "⚠️  IMPORTANTE: Reinicia el servidor de desarrollo para que los cambios surtan efecto:"
echo "   1. Detén el servidor (Ctrl+C)"
echo "   2. Ejecuta: npm run dev"
