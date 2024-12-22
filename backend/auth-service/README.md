# Auth Service - Microservicio de Autenticación

## Descripción
Microservicio independiente para gestión de autenticación centralizada con JWT, refresh tokens y validación local.

## Características
- ✅ Autenticación con JWT (access + refresh tokens)
- ✅ Validación local sin consultas constantes
- ✅ Blacklist de tokens revocados
- ✅ Rate limiting en endpoints sensibles
- ✅ Base de datos independiente

## Arquitectura

```
auth-service/
├── src/
│   ├── config/
│   │   └── database.py       # Configuración de BD
│   ├── models/
│   │   ├── user.py           # Modelo de Usuario
│   │   └── token.py          # Modelo de RefreshToken
│   ├── routes/
│   │   └── auth_routes.py    # Endpoints de autenticación
│   ├── services/
│   │   ├── auth_service.py   # Lógica de negocio
│   │   └── jwt_service.py    # Generación y validación JWT
│   ├── middleware/
│   │   └── rate_limiter.py   # Rate limiting
│   └── main.py               # Punto de entrada
├── requirements.txt
├── .env.example
└── README.md
```

## Endpoints

### POST /auth/register
Registrar nuevo usuario
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "nombre": "Usuario Test"
}
```

### POST /auth/login
Iniciar sesión y obtener tokens
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

### POST /auth/refresh
Renovar access token usando refresh token
```json
{
  "refresh_token": "eyJ..."
}
```

### POST /auth/logout
Cerrar sesión y revocar tokens
```http
Authorization: Bearer eyJ...
```

### GET /auth/me
Obtener información del usuario autenticado
```http
Authorization: Bearer eyJ...
```

### GET /auth/validate (Interno)
Validar token - endpoint interno para otros servicios
```http
Authorization: Bearer eyJ...
```

## Configuración

### Variables de Entorno
```env
# Base de datos
DATABASE_URL=mongodb://localhost:27017/auth_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Rate Limiting
RATE_LIMIT_LOGIN=5  # Intentos por minuto
RATE_LIMIT_REGISTER=3

# Server
PORT=8001
HOST=0.0.0.0
```

## Instalación

```powershell
# Crear entorno virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar
python src/main.py
```

## Seguridad

### Validación Local de JWT
Los demás microservicios pueden validar tokens sin consultar al Auth Service:
1. Verifican la firma usando la clave pública/secreta compartida
2. Comprueban la fecha de expiración
3. Solo consultan la blacklist para tokens revocados (opcional)

### Rate Limiting
- Login: Máximo 5 intentos por minuto por IP
- Register: Máximo 3 registros por minuto por IP
- Bloqueo temporal tras intentos fallidos consecutivos

### Blacklist de Tokens
Los tokens revocados se almacenan en una lista negra:
- Al hacer logout
- Al cambiar contraseña
- Al detectar actividad sospechosa

## Integración con Otros Servicios

### Ejemplo de validación en otro microservicio (Python)
```python
import jwt
from datetime import datetime

def validate_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
        
        # Verificar expiración
        if datetime.fromtimestamp(payload['exp']) < datetime.now():
            raise Exception("Token expirado")
            
        return payload
    except jwt.InvalidTokenError:
        raise Exception("Token inválido")
```

### Ejemplo en Node.js
```javascript
const jwt = require('jsonwebtoken');

function validateToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (error) {
    throw new Error('Token inválido');
  }
}
```

## Testing

```powershell
# Ejecutar tests
pytest tests/

# Con coverage
pytest --cov=src tests/
```

## Responsable
**Odalis Senge** - Implementación del Auth Service

## Fecha de Implementación
Semana 1: 22-28 Diciembre 2024
