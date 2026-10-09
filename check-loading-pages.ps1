# Script PowerShell pour vérifier les pages avec problèmes de chargement

Write-Host "🔍 Vérification des pages avec chargement de données..." -ForegroundColor Cyan
Write-Host ""

$problematicPages = @()

# Liste des pages critiques à vérifier
$pagesToCheck = @(
    "app\[locale]\dashboard\admin\page.tsx",
    "app\[locale]\dashboard\fournisseur\page.tsx",
    "app\[locale]\dashboard\marketiste\page.tsx",
    "app\[locale]\dashboard\client\page.tsx",
    "app\[locale]\dashboard\admin\orders\page.tsx",
    "app\[locale]\dashboard\admin\users\page.tsx",
    "app\[locale]\dashboard\admin\products\page.tsx",
    "app\[locale]\products\page.tsx",
    "app\[locale]\orders\page.tsx",
    "app\[locale]\page.tsx"
)

foreach ($page in $pagesToCheck) {
    if (Test-Path $page) {
        $content = Get-Content $page -Raw
        
        $hasGetDocs = $content -match "getDocs"
        $hasUseState = $content -match "useState"
        $hasUseEffect = $content -match "useEffect"
        $hasLoading = $content -match "loading|Loading"
        $hasSetLoading = $content -match "setLoading"
        
        if ($hasGetDocs -and (!$hasUseEffect -or !$hasSetLoading)) {
            Write-Host "⚠️  $page" -ForegroundColor Yellow
            if (!$hasUseEffect) {
                Write-Host "   ❌ Manque useEffect" -ForegroundColor Red
            }
            if (!$hasSetLoading) {
                Write-Host "   ❌ Manque setLoading" -ForegroundColor Red
            }
            $problematicPages += $page
            Write-Host ""
        } else {
            Write-Host "✅ $page" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
if ($problematicPages.Count -eq 0) {
    Write-Host "🎉 Aucun problème détecté !" -ForegroundColor Green
} else {
    Write-Host "⚠️  $($problematicPages.Count) page(s) potentiellement problématique(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pages à vérifier manuellement :" -ForegroundColor Yellow
    foreach ($page in $problematicPages) {
        Write-Host "  - $page" -ForegroundColor Yellow
    }
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
