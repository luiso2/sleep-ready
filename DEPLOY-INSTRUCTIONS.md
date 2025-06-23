# Configuración de Auto-Deploy en EasyPanel

## Problema Actual
El servicio frontend en EasyPanel no se actualiza automáticamente cuando se hacen cambios en el repositorio de GitHub.

## Solución Temporal
Para actualizar el frontend después de hacer cambios:

1. **Hacer push de los cambios a GitHub**
   ```bash
   git add .
   git commit -m "tu mensaje"
   git push origin main
   ```

2. **En EasyPanel, reconstruir el servicio**
   - Ir a http://168.231.92.67:3000
   - Navegar a Projects > sleep-ready > frontend
   - Click en "Deploy" o "Rebuild"

## Configuración Recomendada para Auto-Deploy

### Opción 1: Webhook de GitHub
1. En EasyPanel, ir a la configuración del servicio frontend
2. Buscar la sección de "Deploy Settings" o "Git Settings"
3. Activar "Auto Deploy on Push"
4. Copiar el webhook URL proporcionado
5. En GitHub:
   - Ir a Settings > Webhooks
   - Add webhook
   - Pegar la URL de EasyPanel
   - Seleccionar "Just the push event"
   - Guardar

### Opción 2: GitHub Actions + EasyPanel API
Si EasyPanel tiene una API para triggers de deploy:

```yaml
- name: Trigger EasyPanel Deploy
  run: |
    curl -X POST \
      -H "Authorization: Bearer ${{ secrets.EASYPANEL_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d '{"project": "sleep-ready", "service": "frontend", "action": "deploy"}' \
      http://168.231.92.67:3000/api/deploy
```

### Opción 3: Docker Hub Integration
1. Construir y pushear la imagen a Docker Hub en cada commit
2. Configurar EasyPanel para usar la imagen de Docker Hub
3. Activar "watchtower" o similar para auto-updates

## Configuración Actual del Frontend

### Dockerfile
El frontend usa un Dockerfile multi-stage que:
1. Construye la aplicación con Node.js
2. Sirve los archivos estáticos con Nginx

### Variables de Entorno
- `VITE_API_URL`: URL del backend API (http://168.231.92.67:3002/api)

### Puertos
- Frontend: 8081 (configurado en nginx.conf)
- Backend: 3002

## Comandos Útiles

### Reconstruir manualmente con Docker
```bash
# En el servidor de EasyPanel
cd /path/to/sleep-ready/frontend
docker build -t sleep-ready-frontend .
docker run -d -p 8081:3000 --name frontend sleep-ready-frontend
```

### Verificar logs
```bash
docker logs frontend
```

### Reiniciar servicio
```bash
docker restart frontend
```

## Notas Importantes
- Siempre hacer commit y push de los cambios antes de reconstruir
- El proceso de build puede tomar 2-3 minutos
- Verificar que no hay errores de TypeScript antes de deployar
