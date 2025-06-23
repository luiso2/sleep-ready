# Script para actualizar el frontend en EasyPanel

Write-Host "🔄 Actualizando frontend para Sleep Ready..." -ForegroundColor Cyan

# Navigate to project directory
Set-Location "C:\Users\Andybeats\Desktop\Claude Projects\vargas\sleep-ready"

# Check git status
Write-Host "`n📊 Estado actual del repositorio:" -ForegroundColor Yellow
git status

# Add all changes
Write-Host "`n➕ Agregando cambios..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "`n💾 Haciendo commit..." -ForegroundColor Yellow
git commit -m "Fix: Corregir problema de navegación y autenticación

- Actualizar dataProvider para manejar mejor errores 401
- Mejorar authProvider para evitar redirecciones forzadas
- Cambiar URL de producción a HTTP (EasyPanel no soporta HTTPS)
- Mantener el contexto de navegación al recibir errores de auth"

# Push to GitHub
Write-Host "`n📤 Subiendo cambios a GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "`n✅ Cambios subidos exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Siguiente paso:" -ForegroundColor Cyan
Write-Host "1. Ve a EasyPanel: http://168.231.92.67:3000" -ForegroundColor White
Write-Host "2. Projects → sleep-ready → frontend" -ForegroundColor White
Write-Host "3. Click en 'Deploy' para actualizar" -ForegroundColor White

# Pause to see the output
Write-Host "`nPresiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
