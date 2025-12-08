#!/bin/bash

# Script para ejecutar la generación completa de 2° Medio en segundo plano

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   SISTEMA COMPLETO DE GENERACIÓN DE POOLS - 2° MEDIO         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Limpiar log anterior
> generation-segundo-medio.log

# Ejecutar generación
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Generando pools de 2° Medio..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx tsx scripts/generate-segundo-medio.ts 2>&1 | tee -a generation-segundo-medio.log

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   ✅ PROCESO COMPLETO FINALIZADO                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
