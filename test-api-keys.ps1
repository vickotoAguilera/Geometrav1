#!/usr/bin/env pwsh

# Script para probar TODAS las API keys de Google Gemini
# Identifica cuáles funcionan y cuáles están filtradas/bloqueadas

Write-Host "🔑 PROBANDO TODAS LAS API KEYS DE GOOGLE GEMINI" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Cargar variables de entorno
$envContent = Get-Content ".env.local" -Raw

# Extraer todas las API keys
$apiKeys = @()
for ($i = 1; $i -le 7; $i++) {
    if ($i -eq 1) {
        $keyName = "GOOGLE_GENAI_API_KEY"
    } else {
        $keyName = "GOOGLE_GENAI_API_KEY_$i"
    }
    
    if ($envContent -match "$keyName=([^\r\n]+)") {
        $apiKeys += @{
            Name = $keyName
            Key = $matches[1]
            Index = $i
        }
    }
}

Write-Host "📋 Encontradas $($apiKeys.Count) API keys en .env.local" -ForegroundColor Yellow
Write-Host ""

$workingKeys = @()
$failedKeys = @()

foreach ($apiKey in $apiKeys) {
    Write-Host "Probando $($apiKey.Name)..." -NoNewline
    
    try {
        # Hacer una petición simple a la API de Gemini
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $body = @{
            contents = @(
                @{
                    parts = @(
                        @{
                            text = "Hola"
                        }
                    )
                }
            )
        } | ConvertTo-Json -Depth 10
        
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$($apiKey.Key)"
        
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ErrorAction Stop
        
        Write-Host " ✅ FUNCIONA" -ForegroundColor Green
        $workingKeys += $apiKey
        
    } catch {
        $errorMessage = $_.Exception.Message
        
        if ($errorMessage -match "leaked" -or $errorMessage -match "403") {
            Write-Host " ❌ FILTRADA/BLOQUEADA" -ForegroundColor Red
        } elseif ($errorMessage -match "429" -or $errorMessage -match "quota") {
            Write-Host " ⚠️  LÍMITE ALCANZADO" -ForegroundColor Yellow
        } else {
            Write-Host " ❌ ERROR: $errorMessage" -ForegroundColor Red
        }
        
        $failedKeys += @{
            Key = $apiKey
            Error = $errorMessage
        }
    }
    
    # Pequeña pausa entre peticiones
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "📊 RESUMEN" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ API Keys funcionando: $($workingKeys.Count)" -ForegroundColor Green
Write-Host "❌ API Keys con problemas: $($failedKeys.Count)" -ForegroundColor Red
Write-Host ""

if ($workingKeys.Count -gt 0) {
    Write-Host "🎉 CLAVES QUE FUNCIONAN:" -ForegroundColor Green
    foreach ($key in $workingKeys) {
        Write-Host "  ✅ $($key.Name)" -ForegroundColor Green
    }
    Write-Host ""
    
    $firstWorkingKey = $workingKeys[0]
    Write-Host "💡 RECOMENDACIÓN:" -ForegroundColor Cyan
    Write-Host "Actualiza src/ai/genkit.ts para usar: $($firstWorkingKey.Name)" -ForegroundColor White
    Write-Host ""
    Write-Host "Código sugerido:" -ForegroundColor Yellow
    Write-Host "const API_KEY = process.env.$($firstWorkingKey.Name);" -ForegroundColor White
    
} else {
    Write-Host "⚠️  NINGUNA API KEY FUNCIONA" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "1. Generar nuevas API keys en Google AI Studio" -ForegroundColor White
    Write-Host "2. Verificar que las keys no estén bloqueadas" -ForegroundColor White
    Write-Host "3. Revisar límites de cuota" -ForegroundColor White
}

Write-Host ""
