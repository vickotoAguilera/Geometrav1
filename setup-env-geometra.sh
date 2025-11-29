#!/bin/bash

# ============================================
# Script de Configuración de Variables de Entorno
# Para el proyecto Geometra
# ============================================
# 
# Este script configura automáticamente todas las variables
# de entorno necesarias en el archivo .env.local
#
# Uso: ./setup-env-geometra.sh [ruta-al-proyecto]
# Ejemplo: ./setup-env-geometra.sh ~/Documentos/geometra
#

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ruta al proyecto (por defecto)
PROJECT_PATH="${1:-$HOME/Documentos/geometra}"
ENV_FILE="$PROJECT_PATH/.env.local"

echo "============================================"
echo "  Configuración de Variables de Entorno"
echo "  Proyecto: Geometra"
echo "============================================"
echo ""

# Verificar que el directorio del proyecto existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Error: El directorio del proyecto no existe: $PROJECT_PATH${NC}"
    echo "Uso: $0 [ruta-al-proyecto]"
    exit 1
fi

# Crear archivo .env.local si no existe
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  El archivo .env.local no existe. Creando...${NC}"
    touch "$ENV_FILE"
fi

# Hacer backup del archivo existente
if [ -s "$ENV_FILE" ]; then
    BACKUP_FILE="$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup creado: $BACKUP_FILE${NC}"
fi

# Función para agregar o actualizar una variable
update_or_add_var() {
    local var_name="$1"
    local var_value="$2"
    
    if grep -q "^${var_name}=" "$ENV_FILE"; then
        # Actualizar variable existente
        sed -i "s|^${var_name}=.*|${var_name}=${var_value}|" "$ENV_FILE"
        echo -e "${YELLOW}🔄 Actualizado: $var_name${NC}"
    else
        # Agregar nueva variable
        echo "${var_name}=${var_value}" >> "$ENV_FILE"
        echo -e "${GREEN}➕ Agregado: $var_name${NC}"
    fi
}

echo ""
echo "Configurando variables de entorno..."
echo ""

# ============================================
# FIREBASE VARIABLES
# ============================================
echo "📱 Configurando Firebase..."
update_or_add_var "NEXT_PUBLIC_FIREBASE_API_KEY" "AIzaSyCAmqE1-QKZqJJ59zyHgwhg7szwFffZbcg"
update_or_add_var "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "geogebra-476523.firebaseapp.com"
update_or_add_var "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "geogebra-476523"
update_or_add_var "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "geogebra-476523.firebasestorage.app"
update_or_add_var "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "929725972973"
update_or_add_var "NEXT_PUBLIC_FIREBASE_APP_ID" "1:929725972973:web:43969e5859f54ef8b2a7e4"
update_or_add_var "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" "G-4517Z1F1CS"

# ============================================
# RESEND (Email Service)
# ============================================
echo ""
echo "📧 Configurando Resend..."
update_or_add_var "RESEND_API_KEY" "re_ZvHLtxn3_CvTe1wG1XX48X6XZBuvoDatM"

# ============================================
# R2 / CLOUDFLARE STORAGE
# ============================================
echo ""
echo "☁️  Configurando R2/Cloudflare..."
update_or_add_var "R2_ACCOUNT_ID" "2a83ab8e5e3e3f3b8f3e3f3b8f3e3d34c"
update_or_add_var "R2_ACCESS_KEY_ID" "291411526e526e526e526e526e526e"
update_or_add_var "R2_SECRET_ACCESS_KEY" "605c3d204e204e204e204e204e204e"
update_or_add_var "R2_BUCKET_NAME" "geometra"

echo ""
echo "============================================"
echo -e "${GREEN}✅ Configuración completada exitosamente${NC}"
echo "============================================"
echo ""
echo "📁 Archivo configurado: $ENV_FILE"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   Para que los cambios surtan efecto, reinicia el servidor:"
echo "   1. Detén el servidor (Ctrl+C)"
echo "   2. Ejecuta: npm run dev"
echo ""
echo "📋 Variables configuradas:"
echo "   - Firebase: 7 variables"
echo "   - Resend: 1 variable"
echo "   - R2/Cloudflare: 4 variables"
echo "   Total: 12 variables"
echo ""
