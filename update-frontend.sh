#!/bin/bash

echo "🔄 Actualizando frontend para Sleep Ready..."

# Navigate to project directory
cd "C:/Users/Andybeats/Desktop/Claude Projects/vargas/sleep-ready"

# Check git status
echo "📊 Estado actual del repositorio:"
git status

# Add all changes
echo "➕ Agregando cambios..."
git add .

# Commit changes
echo "💾 Haciendo commit..."
git commit -m "Fix: Corregir problema de navegación y autenticación

- Actualizar dataProvider para manejar mejor errores 401
- Mejorar authProvider para evitar redirecciones forzadas
- Cambiar URL de producción a HTTP (EasyPanel no soporta HTTPS)
- Mantener el contexto de navegación al recibir errores de auth"

# Push to GitHub
echo "📤 Subiendo cambios a GitHub..."
git push origin main

echo "✅ Cambios subidos exitosamente!"
echo ""
echo "📝 Siguiente paso:"
echo "1. Ve a EasyPanel: http://168.231.92.67:3000"
echo "2. Projects → sleep-ready → frontend"
echo "3. Click en 'Deploy' para actualizar"
