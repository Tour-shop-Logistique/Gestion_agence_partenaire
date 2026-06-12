# Script PowerShell pour tester le build production
# Usage: .\test-production.ps1

Write-Host "🧪 Test du Build Production" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Node est installé
Write-Host "✓ Vérification de Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Nettoyer l'ancien build
Write-Host "🧹 Nettoyage de l'ancien build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "  ✓ Dossier dist supprimé" -ForegroundColor Green
}
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "  ✓ Cache Vite supprimé" -ForegroundColor Green
}
Write-Host ""

# Build production
Write-Host "🔨 Construction du build production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Build réussi" -ForegroundColor Green
Write-Host ""

# Afficher la taille des bundles
Write-Host "📦 Taille des bundles générés:" -ForegroundColor Yellow
Get-ChildItem -Path "dist\assets\*.js" | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 2)
    $color = if ($sizeKB -gt 500) { "Red" } elseif ($sizeKB -gt 200) { "Yellow" } else { "Green" }
    Write-Host "  $($_.Name): $sizeKB KB" -ForegroundColor $color
}
Write-Host ""

# Demander si l'utilisateur veut lancer le preview
Write-Host "🚀 Voulez-vous lancer le serveur de preview?" -ForegroundColor Cyan
Write-Host "   (Le serveur sera accessible sur http://localhost:4173)" -ForegroundColor Gray
$response = Read-Host "   Lancer maintenant? (O/n)"

if ($response -eq "" -or $response -eq "O" -or $response -eq "o") {
    Write-Host ""
    Write-Host "🌐 Démarrage du serveur de preview..." -ForegroundColor Yellow
    Write-Host "   Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Gray
    Write-Host ""
    
    # Lancer le serveur de preview
    npm run preview
} else {
    Write-Host ""
    Write-Host "✅ Build terminé avec succès!" -ForegroundColor Green
    Write-Host "   Pour tester, exécutez: npm run preview" -ForegroundColor Gray
    Write-Host ""
}

# Checklist finale
Write-Host ""
Write-Host "📋 Checklist de Test:" -ForegroundColor Cyan
Write-Host "  [ ] Page de connexion fonctionne" -ForegroundColor White
Write-Host "  [ ] Dashboard s'affiche correctement" -ForegroundColor White
Write-Host "  [ ] Tarifs Groupage - Modifier fonctionne" -ForegroundColor White
Write-Host "  [ ] Profil Agence - Modifier fonctionne" -ForegroundColor White
Write-Host "  [ ] Pas de pages blanches" -ForegroundColor White
Write-Host "  [ ] Pas d'erreurs dans la console" -ForegroundColor White
Write-Host ""
