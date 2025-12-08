#!/bin/bash

# Script para actualizar .env.local con las nuevas API keys

ENV_FILE=".env.local"
BACKUP_FILE=".env.local.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔄 Actualizando API keys en $ENV_FILE..."

# Crear backup
if [ -f "$ENV_FILE" ]; then
    echo "📦 Creando backup en $BACKUP_FILE..."
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo "✅ Backup creado"
else
    echo "⚠️  Archivo $ENV_FILE no encontrado, se creará uno nuevo"
    touch "$ENV_FILE"
fi

# Eliminar todas las keys antiguas (de la 8 a la 50)
echo "🗑️  Eliminando keys antiguas comprometidas..."
for i in {8..50}; do
    sed -i "/^GOOGLE_GENAI_API_KEY_$i=/d" "$ENV_FILE"
done

# Actualizar las primeras 7 keys
echo "✨ Actualizando keys nuevas..."

# Key 1
sed -i '/^GOOGLE_GENAI_API_KEY=/d' "$ENV_FILE"
echo "GOOGLE_GENAI_API_KEY=AIzaSyAICRexJuyAt13JgYCEoRRY7_29AzdXZVs" >> "$ENV_FILE"

# Key 2
sed -i '/^GOOGLE_GENAI_API_KEY_2=/d' "$ENV_FILE"
echo "GOOGLE_GENAI_API_KEY_2=AIzaSyArhO-1FmzkAh50UkGeZdKMZmjQLQnTO94" >> "$ENV_FILE"

# Key 3
sed -i '/^GOOGLE_GENAI_API_KEY_3=/d' "$ENV_FILE"
echo "GOOGLE_GENAI_API_KEY_3=AIzaSyCnTWVfxbeHaSO47vshAjBTKiTfemmRnNo" >> "$ENV_FILE"

# Key 4
sed -i '/^GOOGLE_GENAI_API_KEY_4=/d' "$ENV_FILE"
echo "GOOGLE_GENAI_API_KEY_4=AIzaSyAlvfZA9lA0TpoRRkG2jd9TqVqyD8AmUf0" >> "$ENV_FILE"

# Key 5
sed -i '/^GOOGLE_GENAI_API_KEY_5=/d' "$ENV_FILE"
echo "GOOGLE_GENAI_API_KEY_5=AIzaSyB1OVYOHV7mExrcObddzzF2UYAiaCD5sIs" >> "$ENV_FILE"

# Key 6
sed -i '/^GOOGLE_GENAI_API_KEY_6=/d' "$ENV_FILE"
echo "GOOGLE_GENAI_API_KEY_6=AIzaSyAQEj7VTdoKdF5eROrrWGQjsW_bwt8R5GQ" >> "$ENV_FILE"

# Key 7
sed -i '/^GOOGLE_GENAI_API_KEY_7=/d' "$ENV_FILE"
echo "GOOGLE_GENAI_API_KEY_7=AIzaSyC-jQnB_NldDFRy9lnywBoS22HtuNcAS_U" >> "$ENV_FILE"

echo ""
echo "✅ Actualización completada!"
echo ""
echo "📊 Resumen:"
echo "   - Backup guardado en: $BACKUP_FILE"
echo "   - Keys nuevas configuradas: 7"
echo "   - Keys antiguas eliminadas: 43"
echo ""
echo "🔄 Reinicia el servidor (npm run dev) para aplicar los cambios"
