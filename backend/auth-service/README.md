# 🔐 Auth Service - Microservicio de Autenticación

Microservicio independiente para gestión de autenticación con JWT, implementando access tokens de corta duración y refresh tokens de larga duración.

## 📋 Características

✅ **Autenticación JWT completa**
- Access tokens (15 minutos)
- Refresh tokens (7 días)
- Validación local de tokens (sin consultar al servicio)

✅ **Seguridad**
- Bcrypt para hash de contraseñas
- Rate limiting en login (5 intentos/minuto)
- Blacklist de tokens revocados
- Validación de contraseñas robustas

✅ **Base de datos propia**
- MongoDB independiente (auth_service_db)
- Colecciones: users, refresh_tokens, revoked_tokens

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```powershell
.\run.ps1
```

O manualmente:

```powershell
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### 2. Configurar variables de entorno

Editar `.env`:

```env
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production-123456789
MONGODB_URL=mongodb://localhost:27017
DB_NAME=auth_service_db
```

⚠️ **IMPORTANTE**: La `JWT_SECRET_KEY` debe ser la MISMA en todos los servicios que validen tokens.

### 3. Acceder al servicio

- **API**: http://localhost:8001
- **Docs**: http://localhost:8001/docs
- **Health**: http://localhost:8001/health

## 📡 Endpoints

### POST /auth/register

Registrar nuevo usuario.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "Password123",
  "full_name": "Juan Pérez",
  "role": "user"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": "507f...",
    "email": "usuario@example.com",
    "full_name": "Juan Pérez",
    "role": "user",
    "is_active": true
  }
}
```

### POST /auth/login

Iniciar sesión (rate limited: 5/minuto).

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "Password123"
}
```

**Response:** (igual que register)

### POST /auth/refresh

Renovar access token usando refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",  // Nuevo access token
  "refresh_token": "eyJhbGc...",  // Mismo refresh token
  "token_type": "bearer",
  "expires_in": 900,
  "user": { ... }
}
```

### POST /auth/logout

Cerrar sesión (revoca tokens).

**Request:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."  // Opcional
}
```

### POST /auth/validate

Validar un token (incluye verificación de blacklist).

**Request:**
```json
{
  "token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "valid": true,
  "user_id": "507f...",
  "email": "usuario@example.com",
  "role": "user",
  "error": null
}
```

### GET /auth/me

Obtener información del usuario actual.

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "id": "507f...",
  "email": "usuario@example.com",
  "full_name": "Juan Pérez",
  "role": "user",
  "is_active": true
}
```

## 🔧 Validación Local en Otros Servicios

Para **evitar el antipatrón** de llamar al Auth Service en cada petición, los otros servicios deben validar tokens **localmente**.

### 1. Copiar módulo de validación

Copiar `local_jwt_validator.py` a cada servicio que necesite validar tokens.

### 2. Configurar clave secreta

```python
# En local_jwt_validator.py
JWT_SECRET_KEY = "your-super-secret-jwt-key-change-in-production-123456789"  # MISMA que Auth Service
```

### 3. Usar en endpoints

```python
from local_jwt_validator import get_current_user_from_token, require_role, TokenPayload
from fastapi import Depends, FastAPI

app = FastAPI()

# Ruta protegida básica
@app.get("/protected")
async def protected_route(user: TokenPayload = Depends(get_current_user_from_token)):
    return {
        "message": f"Hello {user.email}!",
        "user_id": user.user_id,
        "role": user.role
    }

# Ruta que requiere rol específico
@app.get("/admin")
async def admin_route(user: TokenPayload = Depends(require_role(["admin"]))):
    return {"message": "Admin access granted"}
```

### 4. Validación manual

```python
from local_jwt_validator import validate_access_token

token = "eyJhbGc..."
try:
    user = validate_access_token(token)
    print(f"User: {user.email}, Role: {user.role}")
except HTTPException as e:
    print(f"Token inválido: {e.detail}")
```

## 🔒 Seguridad

### Requisitos de contraseña

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número

### Rate Limiting

- Login: 5 intentos por minuto
- Previene ataques de fuerza bruta

### Blacklist de tokens

Tokens revocados se almacenan en MongoDB y se verifican en:
- POST /auth/validate
- GET /auth/me

**Limpieza automática**: Los tokens expirados se pueden limpiar con:

```python
from jwt_service import JWTService
await JWTService.cleanup_expired_tokens()
```

## 📊 Arquitectura

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         Auth Service (Puerto 8001)      │
│  ┌─────────────────────────────────┐   │
│  │  POST /auth/register            │   │
│  │  POST /auth/login               │   │
│  │  POST /auth/refresh             │   │
│  │  POST /auth/logout              │   │
│  │  POST /auth/validate            │   │
│  │  GET  /auth/me                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  JWT Service                    │   │
│  │  - create_access_token()        │   │
│  │  - create_refresh_token()       │   │
│  │  - validate_token()             │   │
│  │  - revoke_token()               │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │
               ▼
     ┌──────────────────┐
     │  MongoDB         │
     │  auth_service_db │
     │  - users         │
     │  - refresh_tokens│
     │  - revoked_tokens│
     └──────────────────┘

┌─────────────────┐
│  REST API       │  ← Valida tokens LOCALMENTE
│  GraphQL        │  ← Valida tokens LOCALMENTE
│  Otros servicios│  ← Valida tokens LOCALMENTE
└─────────────────┘
   (usando local_jwt_validator.py)
```

## 🧪 Pruebas

### Registro

```bash
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "full_name": "Test User",
    "role": "user"
  }'
```

### Login

```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Validar token

```bash
curl -X POST http://localhost:8001/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGc..."
  }'
```

### Obtener usuario actual

```bash
curl http://localhost:8001/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

## ⚙️ Configuración

Ver archivo `.env` para configuración completa:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `JWT_SECRET_KEY` | Clave secreta para JWT | ⚠️ Cambiar en producción |
| `JWT_ALGORITHM` | Algoritmo JWT | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración access token | 15 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Duración refresh token | 7 |
| `MONGODB_URL` | URL de MongoDB | mongodb://localhost:27017 |
| `DB_NAME` | Nombre de la BD | auth_service_db |
| `PORT` | Puerto del servicio | 8001 |
| `RATE_LIMIT_LOGIN` | Rate limit login | 5/minute |

## 📝 Notas Importantes

1. **Clave secreta compartida**: Todos los servicios deben usar la MISMA `JWT_SECRET_KEY` para validar tokens localmente.

2. **Validación local vs remota**:
   - **Local** (rápido): Valida firma y expiración sin consultar Auth Service
   - **Remota** (completo): Incluye verificación de blacklist

3. **Antipatrón evitado**: Los servicios NO llaman al Auth Service en cada petición, solo validan localmente.

4. **Refresh tokens**: Permiten renovar access tokens sin requerir login nuevamente.

5. **Blacklist**: Los tokens revocados se guardan hasta su expiración natural.

## 🎯 Cumplimiento de Requisitos

✅ **Auth Service independiente**: Microservicio dedicado en puerto 8001  
✅ **JWT con access y refresh tokens**: Access (15 min), Refresh (7 días)  
✅ **Validación local**: Módulo `local_jwt_validator.py` para otros servicios  
✅ **Base de datos propia**: MongoDB `auth_service_db` independiente  
✅ **Rate limiting**: 5 intentos/minuto en login  
✅ **Blacklist**: Tokens revocados en colección `revoked_tokens`  
✅ **Endpoints mínimos**: POST /auth/register, POST /auth/login  

## 📚 Referencias

- [JWT.io](https://jwt.io/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Bcrypt](https://pypi.org/project/bcrypt/)
