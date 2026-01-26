# 🚀 n8n con Docker - Turismo ULEAM

## ✅ Estado Actual

n8n está **ejecutándose correctamente** en Docker con la siguiente configuración:

- **URL**: http://localhost:5678
- **Contenedor**: `n8n-dev-turismo`
- **Estado**: UP y funcionando

## 📋 Comandos Principales

### Iniciar n8n

```powershell
# Opción 1: Script automatizado
./start_n8n_simple.ps1

# Opción 2: Manual
docker-compose -f docker-compose.dev.yml up -d
```

### Parar n8n

```powershell
# Opción 1: Script
./stop_n8n.ps1

# Opción 2: Manual
docker stop n8n-dev-turismo
```

### Ver logs en tiempo real

```powershell
docker logs -f n8n-dev-turismo
```

### Reiniciar n8n

```powershell
docker restart n8n-dev-turismo
```

## 🔧 Configuración Inicial

### 1. Primera vez accediendo a n8n

1. Abre http://localhost:5678
2. Crea tu cuenta de administrador:
   - **Email**: admin@turismo.com (o el que prefieras)
   - **Contraseña**: Elige una segura
   - **Nombre**: Admin Turismo ULEAM

### 2. Importar workflow de reportes

1. Ve a **Settings > Import/Export**
2. Click en **Import from file**
3. Selecciona: `./workflows/reportes_generales.json`
4. Confirma la importación

## 📊 Workflow Disponible

### Reportes Generales Diarios

- **Archivo**: `reportes_generales.json`
- **Función**: Automatiza reportes del sistema de turismo
- **Trigger**: Manual (puedes configurar cron automático)
- **Endpoints**: Conecta con REST API en puerto 8000

## 🔌 Integración con Backend

n8n está configurado para conectar con tus servicios:

- **REST API**: `http://host.docker.internal:8000`
- **Auth Service**: Disponible para autenticación JWT
- **Payment Service**: Reportes de pagos y reservas
- **WebSocket**: Notificaciones en tiempo real

## 🐳 Configuración Docker

### Volúmenes

- `./n8n_data`: Datos persistentes de n8n
- `./workflows`: Workflows del proyecto (solo lectura)

### Variables de Entorno

```env
REST_API_URL=http://host.docker.internal:8000
ADMIN_EMAIL=admin@turismo.com
WEBHOOK_URL=http://localhost:5678
```

## 🚀 Próximos Pasos

1. **Configurar webhook endpoints** en tus servicios backend
2. **Personalizar el workflow** según tus necesidades específicas
3. **Configurar triggers automáticos** (cron jobs)
4. **Añadir notificaciones** (Slack, Email)

## 📱 URLs Importantes

- **n8n Interface**: http://localhost:5678
- **REST API**: http://localhost:8000
- **Auth Service**: http://localhost:8001
- **Payment Service**: http://localhost:8002

## ⚠️ Solución de Problemas

### Si n8n no inicia

```powershell
# Ver logs del contenedor
docker logs n8n-dev-turismo

# Reiniciar completamente
docker stop n8n-dev-turismo
docker rm n8n-dev-turismo
docker-compose -f docker-compose.dev.yml up -d
```

### Si no conecta con backend

- Verifica que REST API esté en puerto 8000
- Revisa las variables de entorno en `.env`
- Usa `host.docker.internal` en lugar de `localhost`

---

**🎯 n8n está listo para automatizar tus reportes de turismo!**
