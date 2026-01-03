# Guía de Setup Local

## 📋 Requisitos Previos

- Docker Desktop (versión 4.0+)
- Docker Compose (versión 2.0+)
- Git
- Node.js 18+ (para desarrollo frontend)
- Python 3.11+ (para desarrollo backend)

## 🚀 Instalación Rápida (1 minuto)

### Windows PowerShell
```powershell
# Navegar al directorio del proyecto
cd C:\Users\HP\OneDrive - ULEAM\Escritorio\ppp\ProyectoSWEB_RecomendacionesTuristicas

# Ejecutar script de despliegue
.\deploy.ps1
```

### Linux/macOS (Bash)
```bash
cd ~/path/to/ProyectoSWEB_RecomendacionesTuristicas
chmod +x deploy.sh
./deploy.sh
```

## 📦 Estructura de Servicios

```
┌─────────────────────────────────────┐
│        NGINX API Gateway (80)       │
└────────────────┬────────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
Auth (3001)  Payment (8001) AI (8002)
PostgreSQL   PostgreSQL     MongoDB
Redis        Redis
```

## 🔧 Configuración Manual

### Paso 1: Variables de Entorno

Copiar archivos `.env.example` a `.env` en cada servicio:

```bash
# Auth Service
cp backend/auth-service/.env.example backend/auth-service/.env

# Payment Service
cp backend/payment-service/.env.example backend/payment-service/.env

# AI Orchestrator
cp backend/ai-orchestrator/.env.example backend/ai-orchestrator/.env
```

Editar cada `.env` con tus credenciales:
- `POSTGRES_PASSWORD`: Contraseña para PostgreSQL
- `MONGODB_PASSWORD`: Contraseña para MongoDB
- `JWT_SECRET`: Clave secreta para JWT
- `PAYMENT_PROVIDER`: Mock, Stripe, o MercadoPago
- `LLM_PROVIDER`: Gemini o OpenAI
- `GEMINI_API_KEY`: Tu API key de Google Gemini
- `OPENAI_API_KEY`: Tu API key de OpenAI

### Paso 2: Construir Imágenes

```bash
# Todas las imágenes
docker-compose build

# Servicio específico
docker-compose build auth-service
docker-compose build payment-service
docker-compose build ai-orchestrator
```

### Paso 3: Iniciar Servicios

```bash
# Todos los servicios en background
docker-compose up -d

# Con logs en terminal
docker-compose up

# Servicio específico
docker-compose up -d auth-service
```

### Paso 4: Verificar Servicios

```bash
# Ver estatus
docker-compose ps

# Ver logs
docker-compose logs -f

# Servicio específico
docker-compose logs -f auth-service
```

## 🧪 Testing

### Test Rápido de Endpoints

```powershell
# Windows
.\test-endpoints.ps1
```

```bash
# Linux/macOS
chmod +x test-endpoints.sh
./test-endpoints.sh
```

### Test Manual con curl

```bash
# Health check
curl http://localhost/health

# Register
curl -X POST http://localhost/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!",
    "name":"Test User"
  }'

# Login
curl -X POST http://localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!"
  }'

# Chat
curl -X POST http://localhost/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message":"Busca tours a la Amazonía",
    "conversation_id":"conv_123"
  }'
```

## 📊 Acceso a Servicios

| Servicio | URL | Puerto |
|----------|-----|--------|
| API Gateway | http://localhost | 80 |
| Auth Service | http://localhost:3001 | 3001 |
| Payment Service | http://localhost:8001 | 8001 |
| AI Orchestrator | http://localhost:8002 | 8002 |
| REST API | http://localhost:8000 | 8000 |
| GraphQL | http://localhost:4000 | 4000 |
| WebSocket | http://localhost:8080 | 8080 |
| n8n | http://localhost:5678 | 5678 |
| Frontend | http://localhost:5173 | 5173 |
| PostgreSQL | localhost:5432 | 5432 |
| MongoDB | localhost:27017 | 27017 |
| Redis | localhost:6379 | 6379 |

## 🛠️ Troubleshooting

### Puerto ya está en uso

```bash
# Windows - Encontrar proceso que usa puerto
netstat -ano | findstr :80

# Matar proceso
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :80
kill -9 <PID>
```

### Servicio no inicia

```bash
# Ver logs detallados
docker-compose logs auth-service

# Reiniciar servicio
docker-compose restart auth-service

# Reconstruir servicio
docker-compose up -d --build auth-service
```

### Base de datos no responde

```bash
# Reiniciar PostgreSQL
docker-compose restart postgres

# Reiniciar MongoDB
docker-compose restart mongodb

# Reiniciar Redis
docker-compose restart redis
```

### Limpiar todo y empezar de nuevo

```bash
# Detener todos los servicios
docker-compose down

# Remover volúmenes (⚠️ BORRA DATOS)
docker-compose down -v

# Remover imágenes
docker-compose down -v --remove-images

# Empezar de nuevo
docker-compose up -d
```

## 📚 Documentación Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
- [N8N_INTEGRATION_GUIDE.md](./N8N_INTEGRATION_GUIDE.md) - Integración con n8n
- [PARTNER_INTEGRATION_GUIDE.md](./PARTNER_INTEGRATION_GUIDE.md) - Integración webhook para partners
- [backend/auth-service/README.md](./backend/auth-service/README.md) - Auth Service
- [backend/payment-service/README.md](./backend/payment-service/README.md) - Payment Service
- [backend/ai-orchestrator/README.md](./backend/ai-orchestrator/README.md) - AI Orchestrator

## 🔐 Seguridad

⚠️ **IMPORTANTE para Producción:**

1. No commitear archivos `.env` con secretos reales
2. Usar variables de entorno desde CI/CD
3. Cambiar todas las contraseñas por defecto
4. Configurar SSL/TLS con certificados reales
5. Implementar WAF (Web Application Firewall)
6. Configurar autenticación en n8n
7. Usar secretos compartidos únicos por partner

## 📞 Soporte

- **Issues**: Crear issue en GitHub
- **Documentación**: Ver archivos README en cada servicio
- **Contacto**: webhook-support@nuestro-sistema.com

---

**Última actualización**: 2 de enero de 2026
