#!/usr/bin/env pwsh

# Script de Verificación Completa de Geometra
# Prueba todas las funcionalidades localmente antes de deploy a Vercel

Write-Host "🔍 VERIFICACIÓN COMPLETA DE GEOMETRA" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$passed = 0
$failed = 0

# Función para test
function Test-Feature {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            Write-Host " ❌ FAIL" -ForegroundColor Red
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

Write-Host "1️⃣ VERIFICANDO ARCHIVOS DE CONFIGURACIÓN" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

Test-Feature ".env.local existe" {
    Test-Path ".env.local"
}

Test-Feature "package.json existe" {
    Test-Path "package.json"
}

Test-Feature "next.config.ts existe" {
    Test-Path "next.config.ts"
}

Write-Host ""
Write-Host "2️⃣ VERIFICANDO VARIABLES DE ENTORNO" -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Yellow

$envContent = Get-Content ".env.local" -Raw -ErrorAction SilentlyContinue

Test-Feature "Firebase configurado" {
    $envContent -match "NEXT_PUBLIC_FIREBASE_API_KEY"
}

Test-Feature "Google Gemini API configurado" {
    $envContent -match "GOOGLE_GENAI_API_KEY"
}

Test-Feature "R2 configurado" {
    $envContent -match "R2_ACCOUNT_ID"
}

Test-Feature "Google Client ID configurado" {
    $envContent -match "NEXT_PUBLIC_GOOGLE_CLIENT_ID"
}

Write-Host ""
Write-Host "3️⃣ VERIFICANDO ESTRUCTURA DE ARCHIVOS" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow

Test-Feature "Directorio exercise-validation existe" {
    Test-Path "src/exercise-validation"
}

Test-Feature "FeedbackPopup existe" {
    Test-Path "src/components/exercises/FeedbackPopup.tsx"
}

Test-Feature "exercise-validator existe" {
    Test-Path "src/lib/exercise-validator.ts"
}

Test-Feature "r2-exercises existe" {
    Test-Path "src/lib/r2-exercises.ts"
}

Test-Feature "exercises-r2 action existe" {
    Test-Path "src/app/actions/exercises-r2.ts"
}

Write-Host ""
Write-Host "4️⃣ VERIFICANDO ARCHIVOS DE VALIDACIÓN" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow

$validationFiles = Get-ChildItem -Path "src/exercise-validation" -Recurse -Filter "*.ts" -ErrorAction SilentlyContinue
$validationCount = ($validationFiles | Measure-Object).Count

Test-Feature "Archivos de validación ($validationCount archivos)" {
    $validationCount -gt 0
}

Write-Host ""
Write-Host "5️⃣ VERIFICANDO DEPENDENCIAS" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow

Test-Feature "node_modules existe" {
    Test-Path "node_modules"
}

Test-Feature "package-lock.json existe" {
    Test-Path "package-lock.json"
}

Write-Host ""
Write-Host "6️⃣ VERIFICANDO GIT" -ForegroundColor Yellow
Write-Host "------------------" -ForegroundColor Yellow

Test-Feature "Git inicializado" {
    Test-Path ".git"
}

Test-Feature "Remote configurado" {
    $remote = git remote -v 2>$null
    $remote -match "github.com"
}

Write-Host ""
Write-Host "7️⃣ VERIFICANDO BUILD" -ForegroundColor Yellow
Write-Host "--------------------" -ForegroundColor Yellow

Write-Host "Ejecutando build de Next.js..." -ForegroundColor Cyan
$buildOutput = npm run build 2>&1
$buildSuccess = $LASTEXITCODE -eq 0

if ($buildSuccess) {
    Write-Host "✅ Build exitoso" -ForegroundColor Green
    $passed++
} else {
    Write-Host "❌ Build falló" -ForegroundColor Red
    Write-Host "Últimas líneas del error:" -ForegroundColor Red
    $buildOutput | Select-Object -Last 20 | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    $failed++
    $errors += "Build failed"
}

Write-Host ""
Write-Host "📊 RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Tests pasados: $passed" -ForegroundColor Green
Write-Host "❌ Tests fallados: $failed" -ForegroundColor Red
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "❌ ERRORES ENCONTRADOS:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "⚠️  NO SUBIR A VERCEL HASTA RESOLVER ESTOS ERRORES" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "🎉 TODAS LAS VERIFICACIONES PASARON" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ El proyecto está listo para deploy a Vercel" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. git add ." -ForegroundColor White
    Write-Host "2. git commit -m 'ready for deployment'" -ForegroundColor White
    Write-Host "3. git push origin main" -ForegroundColor White
    exit 0
}
