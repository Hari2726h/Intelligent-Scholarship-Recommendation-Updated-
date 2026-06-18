# PowerShell Script to Replace Dark Theme Classes with Modern Theme Classes
# Run this in the scholarship-portal-frontend\src directory

Write-Host "🎨 Starting Modern Theme Class Replacement..." -ForegroundColor Cyan

$replacements = @{
    'dashboard-card' = 'modern-card'
    'btn-primary-dark' = 'btn-primary-modern'
    'btn-outline-dark' = 'btn-outline-modern'
    'form-control-dark' = 'form-control-modern'
    'form-label-dark' = 'form-label-modern'
    'stat-card"' = 'stat-card-modern"'
    'stat-icon"' = 'stat-icon-modern"'
    'stat-label"' = 'stat-label-modern"'
    'stat-value"' = 'stat-value-modern"'
    'badge-primary"' = 'badge-primary-modern"'
    'badge-success"' = 'badge-success-modern"'
    'badge-warning"' = 'badge-warning-modern"'
    'badge-danger"' = 'badge-danger-modern"'
    'badge-info"' = 'badge-info-modern"'
    'navbar-dark' = 'navbar-modern'
    'text-gradient' = 'gradient-text'
    'table-dark' = 'table-modern'
    'modal-dark' = 'modern-card'
    'alert-success-dark' = 'badge-success-modern'
    'alert-danger-dark' = 'badge-danger-modern'
    'spinner-dark' = 'spinner-modern'
    'card-title' = 'modern-card-title'
    'card-body' = 'modern-card-body'
    'card-footer' = 'modern-card-footer'
    'card-header' = 'modern-card-header'
}

$filesChanged = 0
$totalReplacements = 0

Get-ChildItem -Path . -Include *.jsx,*.js -Recurse -Exclude node_modules | ForEach-Object {
    $file = $_
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $pattern = [regex]::Escape($old)
        $matches = [regex]::Matches($content, $pattern)
        if ($matches.Count -gt 0) {
            $content = $content -replace $pattern, $new
            $fileReplacements += $matches.Count
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesChanged++
        $totalReplacements += $fileReplacements
        Write-Host "✅ Updated: $($file.Name) ($fileReplacements replacements)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Replacement Complete!" -ForegroundColor Cyan
Write-Host "📊 Files Changed: $filesChanged" -ForegroundColor Yellow
Write-Host "🔄 Total Replacements: $totalReplacements" -ForegroundColor Yellow
Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review changes: git diff" -ForegroundColor White
Write-Host "2. Start frontend: npm start" -ForegroundColor White
Write-Host "3. Test all pages" -ForegroundColor White
