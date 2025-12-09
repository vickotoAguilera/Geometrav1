#!/usr/bin/env pwsh

# Script de Verificación Completa de TODAS las IAs y Funcionalidades
# NO subir a Vercel hasta que TODAS las pruebas pasen

Write-Host "🤖 VERIFICACIÓN COMPLETA DE IAs Y FUNCIONALIDADES" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$passed = 0
$failed = 0

function Test-Feature {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    Write-Host "  Testing: $Name..." -NoNewline
    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✅" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            Write-Host " ❌" -ForegroundColor Red
            $script:failed++
            $script:errors += $Name
            return $false
        }
    } catch {
        Write-Host " ❌ ERROR: $_" -ForegroundColor Red
        $script:failed++
        $script:errors += "$Name - $_"
        return $false
    }
}

Write-Host "1️⃣ VERIFICANDO ARCHIVOS DE IA" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

# Genkit
Test-Feature "genkit.ts existe" {
    Test-Path "src/ai/genkit.ts"
}

Test-Feature "api-key-fallback.ts existe" {
    Test-Path "src/ai/api-key-fallback.ts"
}

# Flows de IA
Test-Feature "math-assistant.ts existe" {
    Test-Path "src/ai/flows/math-assistant.ts"
}

Test-Feature "hints-generator.ts existe" {
    Test-Path "src/ai/flows/hints-generator.ts"
}

Test-Feature "exercise-generator.ts existe" {
    Test-Path "src/ai/flows/exercise-generator.ts"
}

Test-Feature "evaluacion-nivel-flow.ts existe" {
    Test-Path "src/ai/flows/evaluacion-nivel-flow.ts"
}

Test-Feature "feedback-suggestions-flow.ts existe" {
    Test-Path "src/ai/flows/feedback-suggestions-flow.ts"
}

Test-Feature "task-analysis-flow.ts existe" {
    Test-Path "src/ai/flows/task-analysis-flow.ts"
}

Test-Feature "verificador-tablas-flow.ts existe" {
    Test-Path "src/ai/flows/verificador-tablas-flow.ts"
}

Write-Host ""
Write-Host "2️⃣ VERIFICANDO COMPONENTES DE IA" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

Test-Feature "ChatBeta.tsx existe" {
    Test-Path "src/components/chat-beta/ChatBeta.tsx"
}

Test-Feature "chat-assistant.tsx existe" {
    Test-Path "src/components/chat-assistant.tsx"
}

Write-Host ""
Write-Host "3️⃣ VERIFICANDO ACTIONS DE IA" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

Test-Feature "exercises.ts existe" {
    Test-Path "src/app/actions/exercises.ts"
}

Test-Feature "exercises-r2.ts existe" {
    Test-Path "src/app/actions/exercises-r2.ts"
}

Test-Feature "actions.ts existe" {
    Test-Path "src/app/actions.ts"
}

Write-Host ""
Write-Host "4️⃣ VERIFICANDO PÁGINAS CON IA" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

Test-Feature "applet/page.tsx existe" {
    Test-Path "src/app/applet/page.tsx"
}

Test-Feature "ejercicios/[curso]/[materia]/page.tsx existe" {
    Test-Path "src/app/ejercicios/[curso]/[materia]/page.tsx"
}

Write-Host ""
Write-Host "5️⃣ VERIFICANDO IMPORTS EN ARCHIVOS DE IA" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

# Verificar que genkit.ts tenga los imports correctos
$genkitContent = Get-Content "src/ai/genkit.ts" -Raw -ErrorAction SilentlyContinue
Test-Feature "genkit.ts tiene import de @genkit-ai/ai" {
    $genkitContent -match "@genkit-ai/ai"
}

Test-Feature "genkit.ts tiene import de google-genai" {
    $genkitContent -match "@genkit-ai/google-genai"
}

# Verificar math-assistant
$mathContent = Get-Content "src/ai/flows/math-assistant.ts" -Raw -ErrorAction SilentlyContinue
Test-Feature "math-assistant.ts tiene definición de flow" {
    $mathContent -match "defineFlow"
}

# Verificar actions.ts
$actionsContent = Get-Content "src/app/actions.ts" -Raw -ErrorAction SilentlyContinue
Test-Feature "actions.ts tiene getAiResponse" {
    $actionsContent -match "getAiResponse"
}

Write-Host ""
Write-Host "6️⃣ VERIFICANDO SINTAXIS DE ARCHIVOS TS/TSX" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow

Write-Host "  Ejecutando TypeScript check..." -ForegroundColor Cyan
$tscOutput = npx tsc --noEmit 2>&1
$tscSuccess = $LASTEXITCODE -eq 0

if ($tscSuccess) {
    Write-Host "  ✅ TypeScript check pasó" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ TypeScript check falló" -ForegroundColor Red
    $errors += "TypeScript errors"
    $failed++
    
    # Mostrar solo errores de archivos de IA
    $tscOutput | Select-String -Pattern "src/(ai|app/actions|components/chat)" | Select-Object -First 10 | ForEach-Object {
        Write-Host "    $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "7️⃣ VERIFICANDO BUILD" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow

Write-Host "  Ejecutando build..." -ForegroundColor Cyan
$buildOutput = npm run build 2>&1
$buildSuccess = $LASTEXITCODE -eq 0

if ($buildSuccess) {
    Write-Host "  ✅ Build exitoso" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ Build falló" -ForegroundColor Red
    $errors += "Build failed"
    $failed++
    
    # Mostrar errores relacionados con IA
    $buildOutput | Select-String -Pattern "error|Error" | Select-Object -First 15 | ForEach-Object {
        Write-Host "    $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 RESUMEN FINAL" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Tests pasados: $passed" -ForegroundColor Green
Write-Host "❌ Tests fallados: $failed" -ForegroundColor Red
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "❌ ERRORES ENCONTRADOS:" -ForegroundColor Red
    Write-Host ""
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "⚠️  SISTEMA NO ESTÁ AL 100%" -ForegroundColor Yellow
    Write-Host "⚠️  NO SUBIR A VERCEL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Archivos a revisar:" -ForegroundColor Cyan
    Write-Host "  - src/ai/genkit.ts" -ForegroundColor White
    Write-Host "  - src/ai/flows/*.ts" -ForegroundColor White
    Write-Host "  - src/app/actions.ts" -ForegroundColor White
    Write-Host "  - src/app/applet/page.tsx" -ForegroundColor White
    exit 1
} else {
    Write-Host "🎉 TODAS LAS VERIFICACIONES PASARON" -ForegroundColor Green
    Write-Host "🎉 SISTEMA AL 100%" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Listo para deploy a Vercel" -ForegroundColor Green
    exit 0
}
