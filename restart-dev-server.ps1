# Script de redémarrage du serveur de développement

Write-Host "Redemarrage du serveur de developpement..." -ForegroundColor Cyan

# Arrêter tous les processus Node qui tournent sur le port 5173
Write-Host "Arret des processus sur le port 5173..." -ForegroundColor Yellow
try {
    $connections = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($connections) {
        $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $processes) {
            Write-Host "   Arret du processus $pid" -ForegroundColor Gray
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
} catch {
    Write-Host "   Aucun processus a arreter" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Supprimer le cache Vite
Write-Host "Suppression du cache Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host "   Cache supprime" -ForegroundColor Green
}

# Supprimer le dossier dist
Write-Host "Suppression du dossier dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Host "   Dist supprime" -ForegroundColor Green
}

Write-Host ""
Write-Host "Nettoyage termine!" -ForegroundColor Green
Write-Host ""
Write-Host "Maintenant, executez manuellement :" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
