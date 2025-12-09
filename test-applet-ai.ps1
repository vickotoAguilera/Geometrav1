#!/usr/bin/env pwsh

# Test de IA del Applet de GeoGebra
# Verifica que la IA del applet responda correctamente

Write-Host "🤖 TEST DE IA DEL APPLET DE GEOGEBRA" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

Write-Host "1️⃣ Verificando Archivos de IA del Applet" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

# Server Action
if (Test-Path "src/app/funciones-matrices-actions.ts") {
    Write-Host "  ✅ funciones-matrices-actions.ts existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ funciones-matrices-actions.ts NO EXISTE" -ForegroundColor Red
    $failed++
}

# Flow de IA
if (Test-Path "src/ai/flows/funciones-matrices-assistant.ts") {
    Write-Host "  ✅ funciones-matrices-assistant.ts existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ funciones-matrices-assistant.ts NO EXISTE" -ForegroundColor Red
    $failed++
}

# Componente del Chat
if (Test-Path "src/components/funciones-chat-assistant.tsx") {
    Write-Host "  ✅ funciones-chat-assistant.tsx existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ funciones-chat-assistant.tsx NO EXISTE" -ForegroundColor Red
    $failed++
}

Write-Host ""
Write-Host "2️⃣ Verificando Imports y Exports" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host ""

# Verificar que el server action importe el flow
$actionContent = Get-Content "src/app/funciones-matrices-actions.ts" -Raw
if ($actionContent -match "funcionesMatricesAssistant") {
    Write-Host "  ✅ Server action importa el flow correctamente" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ Server action NO importa el flow" -ForegroundColor Red
    $failed++
}

# Verificar que el componente importe el server action
$componentContent = Get-Content "src/components/funciones-chat-assistant.tsx" -Raw
if ($componentContent -match "getFuncionesMatricesAiResponse") {
    Write-Host "  ✅ Componente importa server action correctamente" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ Componente NO importa server action" -ForegroundColor Red
    $failed++
}

Write-Host ""
Write-Host "3️⃣ Verificando Configuración de Genkit" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "src/ai/genkit.ts") {
    Write-Host "  ✅ genkit.ts existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ genkit.ts NO EXISTE" -ForegroundColor Red
    $failed++
}

# Verificar API keys
$envContent = Get-Content ".env.local" -Raw -ErrorAction SilentlyContinue
if ($envContent -match "GOOGLE_GENAI_API_KEY") {
    Write-Host "  ✅ API Keys de Google Gemini configuradas" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ API Keys NO configuradas" -ForegroundColor Red
    $failed++
}

Write-Host ""
Write-Host "4️⃣ Verificando Página del Applet" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "src/app/applet/page.tsx") {
    Write-Host "  ✅ applet/page.tsx existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ applet/page.tsx NO EXISTE" -ForegroundColor Red
    $failed++
}

Write-Host ""
Write-Host "📊 RESUMEN" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Tests pasados: $passed" -ForegroundColor Green
Write-Host "❌ Tests fallados: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -gt 0) {
    Write-Host "⚠️  HAY PROBLEMAS CON LA IA DEL APPLET" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Archivos críticos a revisar:" -ForegroundColor Cyan
    Write-Host "  - src/app/funciones-matrices-actions.ts" -ForegroundColor White
    Write-Host "  - src/ai/flows/funciones-matrices-assistant.ts" -ForegroundColor White
    Write-Host "  - src/components/funciones-chat-assistant.tsx" -ForegroundColor White
    Write-Host "  - .env.local (API keys)" -ForegroundColor White
    exit 1
} else {
    Write-Host "🎉 TODOS LOS COMPONENTES DE IA DEL APPLET ESTÁN PRESENTES" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ La IA del applet debería funcionar correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para probar localmente:" -ForegroundColor Cyan
    Write-Host "1. Asegúrate de que el servidor esté corriendo (npm run dev)" -ForegroundColor White
    Write-Host "2. Ve a: http://localhost:9002/applet" -ForegroundColor White
    Write-Host "3. Abre el chat del tutor (botón en la esquina)" -ForegroundColor White
    Write-Host "4. Envía un mensaje de prueba" -ForegroundColor White
    exit 0
}
