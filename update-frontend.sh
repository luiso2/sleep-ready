#!/bin/bash

# Script para forzar la actualización del frontend en EasyPanel
# Este script debe ejecutarse después de hacer push a GitHub

echo "🚀 Iniciando actualización del frontend en EasyPanel..."

# Configuración
EASYPANEL_URL="http://168.231.92.67:3000"
PROJECT="sleep-ready"
SERVICE="frontend"

echo "📦 Proyecto: $PROJECT"
echo "🔧 Servicio: $SERVICE"

# Instrucciones manuales (ya que no tenemos acceso directo a la API de EasyPanel)
echo ""
echo "⚠️  IMPORTANTE: Sigue estos pasos manualmente:"
echo ""
echo "1. Abre EasyPanel: $EASYPANEL_URL"
echo "2. Ve a Projects > $PROJECT"
echo "3. Haz clic en el servicio '$SERVICE'"
echo "4. En la pestaña 'Source', verifica que esté configurado así:"
echo "   - Type: GitHub"
echo "   - Repository: luiso2/sleep-ready"
echo "   - Branch: main"
echo "   - Root Directory: /frontend"
echo ""
echo "5. Si está configurado como 'Image' en lugar de 'GitHub':"
echo "   a. Cambia el tipo a 'GitHub'"
echo "   b. Configura el repositorio y branch"
echo "   c. Establece el Root Directory como '/frontend'"
echo ""
echo "6. Haz clic en 'Deploy' o 'Redeploy'"
echo ""
echo "7. Espera a que termine el build (2-3 minutos)"
echo ""
echo "✅ Una vez completado, el frontend estará actualizado!"
