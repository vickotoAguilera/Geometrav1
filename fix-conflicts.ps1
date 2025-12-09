#!/usr/bin/env pwsh

# Script para eliminar todos los marcadores de conflicto de merge
# Mantiene solo la versión HEAD (local)

$files = Get-ChildItem -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx,*.json | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" }

$fixedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($content -match '<<<<<<< HEAD') {
        Write-Host "Fixing: $($file.FullName)" -ForegroundColor Yellow
        
        # Patrón para eliminar conflictos: mantener solo HEAD, eliminar el resto
        $pattern = '<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n[\s\S]*?\r?\n>>>>>>> [^\r\n]+'
        $newContent = $content -replace $pattern, '$1'
        
        # También manejar el caso sin contenido en HEAD
        $pattern2 = '<<<<<<< HEAD\r?\n=======\r?\n[\s\S]*?\r?\n>>>>>>> [^\r\n]+'
        $newContent = $newContent -replace $pattern2, ''
        
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $fixedCount++
    }
}

Write-Host "`nFixed $fixedCount files" -ForegroundColor Green
Write-Host "Run 'git add . && git commit -m \"fix: Auto-resolve all merge conflicts\" && git push origin main'" -ForegroundColor Cyan
