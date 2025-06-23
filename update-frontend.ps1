# Script para forzar la actualización del frontend en EasyPanel
# Este script debe ejecutarse después de hacer push a GitHub

Write-Host "🚀 Iniciando actualización del frontend en EasyPanel..." -ForegroundColor Green

# Configuración
$EASYPANEL_URL = "http://168.231.92.67:3000"
$PROJECT = "sleep-ready"
$SERVICE = "frontend"

Write-Host "📦 Proyecto: $PROJECT" -ForegroundColor Cyan
Write-Host "🔧 Servicio: $SERVICE" -ForegroundColor Cyan

# Instrucciones manuales
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Sigue estos pasos manualmente:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abre EasyPanel: $EASYPANEL_URL" -ForegroundColor White
Write-Host "2. Ve a Projects > $PROJECT" -ForegroundColor White
Write-Host "3. Haz clic en el servicio '$SERVICE'" -ForegroundColor White
Write-Host "4. En la pestaña 'Source', verifica que esté configurado así:" -ForegroundColor White
Write-Host "   - Type: GitHub" -ForegroundColor Gray
Write-Host "   - Repository: luiso2/sleep-ready" -ForegroundColor Gray
Write-Host "   - Branch: main" -ForegroundColor Gray
Write-Host "   - Root Directory: /frontend" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Si está configurado como 'Image' en lugar de 'GitHub':" -ForegroundColor White
Write-Host "   a. Cambia el tipo a 'GitHub'" -ForegroundColor Gray
Write-Host "   b. Configura el repositorio y branch" -ForegroundColor Gray
Write-Host "   c. Establece el Root Directory como '/frontend'" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Haz clic en 'Deploy' o 'Redeploy'" -ForegroundColor White
Write-Host ""
Write-Host "7. Espera a que termine el build (2-3 minutos)" -ForegroundColor White
Write-Host ""
Write-Host "✅ Una vez completado, el frontend estará actualizado!" -ForegroundColor Green

# Opción para abrir EasyPanel automáticamente
$response = Read-Host "¿Deseas abrir EasyPanel en el navegador? (S/N)"
if ($response -eq 'S' -or $response -eq 's') {
    Start-Process $EASYPANEL_URL
}
