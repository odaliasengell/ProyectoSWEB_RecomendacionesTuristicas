# 🔐 Auth Service - Microservicio de Autenticación

Servicio centralizado de autenticación con JWT, refresh tokens, validación local y rate limiting.

## 🚀 Características

- ✅ JWT con access tokens (corta duración) y refresh tokens (larga duración)
- ✅ Validación local en otros servicios (sin llamadas constantes)
- ✅ Rate limiting en login (5 intentos por 10 minutos)
- ✅ Blacklist de tokens revocados (Redis)
- ✅ Base de datos propia (PostgreSQL)
- ✅ Endpoints RESTful seguros

## 📋 Endpoints

### Públicos

- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Renovar access token

### Protegidos

- `GET /auth/me` - Obtener perfil del usuario autenticado
- `POST /auth/logout` - Cerrar sesión (revoca refresh token)

### Internos (API Gateway)

- `GET /auth/validate` - Validar JWT (sin renovación)
- `GET /auth/public-key` - Obtener clave pública para validación local

## 🗂️ Estructura del Código

```
auth-service/
├── src/
│   ├── main.ts                 # Punto de entrada
│   ├── config/
│   │   ├── database.ts         # Configuración TypeORM
│   │   ├── redis.ts            # Configuración Redis
│   │   └── jwt.ts              # Configuración JWT
│   ├── entities/
│   │   ├── user.entity.ts      # Entidad Usuario
│   │   ├── refresh-token.entity.ts
│   │   └── token-blacklist.entity.ts
│   ├── services/
│   │   ├── auth.service.ts     # Lógica de autenticación
│   │   ├── jwt.service.ts      # Manejo de tokens
│   │   └── redis.service.ts    # Cache y blacklist
│   ├── controllers/
│   │   └── auth.controller.ts  # Rutas HTTP
│   ├── middleware/
│   │   ├── jwt.middleware.ts   # Verificación JWT
│   │   └── rate-limit.middleware.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   └── token-response.dto.ts
│   └── utils/
│       └── validators.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔧 Instalación

### Requisitos previos

- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Pasos

```bash
cd backend/auth-service

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Ejecutar migraciones (si usa TypeORM migrations)
npm run typeorm migration:run

# Desarrollar
npm run dev

# Producción
npm run build
npm start
```

## 🔑 Flujo de Autenticación

```
1. Usuario registra cuenta
   POST /auth/register
   {
     "email": "user@example.com",
     "password": "secure_password"
   }
   └─► Hashea contraseña con bcrypt (factor: 12)
   └─► Crea usuario en PostgreSQL
   └─► Retorna {user_id, email}

2. Usuario inicia sesión
   POST /auth/login
   {
     "email": "user@example.com",
     "password": "secure_password"
   }
   └─► Valida credenciales
   └─► Genera JWT (exp: 15 min)
   └─► Genera Refresh Token (exp: 7 días)
   └─► Almacena RT en PostgreSQL + Redis
   └─► Retorna {accessToken, refreshToken, expiresIn}

3. Cliente usa accessToken
   GET /other-service/resource
   Headers: Authorization: Bearer {accessToken}
   └─► Servicio valida JWT localmente
   └─► Si válido, permite acceso
   └─► Si expirado, retorna 401

4. Cliente renueva token
   POST /auth/refresh
   {
     "refreshToken": "..."
   }
   └─► Valida RT en PostgreSQL
   └─► Si válido, genera nuevo JWT
   └─► Retorna {accessToken, expiresIn}

5. Usuario cierra sesión
   POST /auth/logout
   Headers: Authorization: Bearer {accessToken}
   └─► Revoca refresh token
   └─► Añade JWT a blacklist (Redis)
   └─► Retorna {message: "Logged out"}
```

## 🛡️ Seguridad

### Contraseñas

- Hash con bcrypt (factor: 12)
- Mínimo 8 caracteres, mayúscula, número y carácter especial

### JWT

- Firma con HS256
- Access token: 15 minutos
- Refresh token: 7 días
- Blacklist en Redis para logout

### Rate Limiting

- Máximo 5 intentos de login por IP en 10 minutos
- Lockout temporal si se excede

### CORS

- Configurado para servicios específicos
- Validar orígenes en .env

## 📊 Base de Datos

### Tabla: users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: refresh_tokens

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

### Tabla: token_blacklist

```sql
CREATE TABLE token_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    reason VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blacklist_expires ON token_blacklist(expires_at);
```

## 🔗 Integración con Otros Servicios

### 1. Obtener clave pública para validación local

```bash
GET /auth/public-key
```

Respuesta:

```json
{
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

### 2. Validar JWT en otro servicio (pseudocódigo)

```typescript
// middleware/jwt.middleware.ts en servicio REST/GraphQL
import jwt from 'jsonwebtoken';

export function validateJWT(token: string, publicKey: string) {
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['HS256'],
    });
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
```

### 3. Flujo de renovación transparente

```typescript
// En cliente HTTP (Axios interceptor)
async function axiosInterceptor(config) {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}

// Response interceptor
async function axiosResponseInterceptor(response) {
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    const newTokens = await refreshTokens(refreshToken);
    localStorage.setItem('accessToken', newTokens.accessToken);
    // Reintentar request original
  }
  return response;
}
```

## 🧪 Testing

```bash
# Unit tests
npm test

# Coverage
npm test -- --coverage
```

## 📈 Escalabilidad

- **Horizontal**: Stateless, puede escalarse con load balancer
- **Caché**: Redis para blacklist y sesiones
- **BD**: PostgreSQL con índices en campos críticos

## 🔍 Logs

Todos los eventos importantes se registran:

- Registros de usuario
- Logins exitosos y fallidos
- Rate limit violations
- Token revocations
- Refresh token usage

## 📞 Soporte

Para issues o preguntas, referirse a [ARCHITECTURE.md](../../ARCHITECTURE.md)
