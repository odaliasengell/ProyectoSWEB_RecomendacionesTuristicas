# 🎯 SEMANA 1: REST API BASE + AUTENTICACIÓN JWT

**Responsable:** Nestor Ayala  
**Objetivos:** Implementar autenticación centralizada con JWT y refresh tokens

---

## 📋 TAREAS COMPLETADAS

### ✅ Cambios Implementados

#### 1. **Sistema JWT Completo**

- ✅ Access tokens de corta duración (15 minutos)
- ✅ Refresh tokens de larga duración (7 días)
- ✅ Almacenamiento de refresh tokens en MongoDB
- ✅ Blacklist de tokens revocados

**Ubicación:** `app/auth/jwt.py`

#### 2. **Modelos de Tokens**

- ✅ `RefreshToken` - Almacena tokens de refresco válidos
- ✅ `TokenRevocado` - Blacklist de tokens revocados

**Ubicación:** `app/models/token_model.py`

#### 3. **Controladores de Autenticación**

- ✅ Lógica de refresh token en BD
- ✅ Revocación de tokens
- ✅ Validación local (sin consultar BD en cada request)
- ✅ Blacklist check

**Ubicación:** `app/controllers/auth_controller.py`

#### 4. **Nuevas Rutas de Autenticación**

- ✅ `POST /auth/login` - Iniciar sesión
- ✅ `POST /auth/register` - Registrar usuario
- ✅ `POST /auth/refresh` - Renovar access token
- ✅ `POST /auth/logout` - Cerrar sesión
- ✅ `GET /auth/validate` - Validar token (INTERNO para otros servicios)
- ✅ `GET /auth/me` - Obtener datos del usuario actual

**Ubicación:** `app/routes/auth_routes.py`

#### 5. **Dependencias Actualizadas**

- ✅ `slowapi` - Para rate limiting futuro
- ✅ `PyJWT` - Manejo adicional de JWT

**Ubicación:** `requirements.txt`

---

## 🚀 CÓMO USAR LOS NUEVOS ENDPOINTS

### 1️⃣ Registrar Usuario

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "username": "juanperez",
    "password": "securepass123",
    "pais": "Ecuador"
  }'
```

**Respuesta:**

```json
{
  "message": "Usuario registrado exitosamente",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "username": "juanperez"
  }
}
```

### 2️⃣ Iniciar Sesión

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "securepass123"
  }'
```

**Respuesta:** (Mismo formato que registro)

### 3️⃣ Renovar Access Token

```bash
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Respuesta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

### 4️⃣ Validar Token (Para Otros Servicios)

```bash
curl -X GET http://localhost:8000/auth/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta:**

```json
{
  "valid": true,
  "user_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "email": "juan@example.com",
  "iat": 1704067200,
  "exp": 1704068100
}
```

### 5️⃣ Obtener Datos del Usuario Actual

```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta:**

```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "username": "juanperez"
}
```

### 6️⃣ Cerrar Sesión

```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Respuesta:**

```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

## 🔒 CARACTERÍSTICAS DE SEGURIDAD

| Feature              | Implementación                        |
| -------------------- | ------------------------------------- |
| **Access Tokens**    | 15 minutos de duración                |
| **Refresh Tokens**   | 7 días de duración                    |
| **Token Hashing**    | SHA256 para almacenamiento seguro     |
| **Blacklist**        | Tokens revocados quedan en BD         |
| **Validación Local** | Sin consultar BD en cada request      |
| **Tipos de Token**   | Diferenciación entre access y refresh |

---

## 📊 FLUJO DE AUTENTICACIÓN

```
┌─────────────────┐
│    Usuario      │
└────────┬────────┘
         │ 1. Login (email, password)
         ▼
┌─────────────────────────────┐
│   POST /auth/login          │
│ ✓ Verifica email/password   │
│ ✓ Crea access token         │
│ ✓ Crea refresh token        │
│ ✓ Guarda refresh en BD      │
└────────┬────────────────────┘
         │ 2. Tokens retornados
         ▼
┌─────────────────┐
│ Frontend/App    │ ◄────────────── Almacena tokens
└────────┬────────┘
         │ 3. GET /auth/me (con access token)
         ▼
┌──────────────────────────────┐
│   GET /auth/me               │
│ ✓ Valida access token        │
│ ✓ Retorna datos del usuario  │
└──────────────────────────────┘

         ┌─ Si token expira:
         ▼
┌──────────────────────────────┐
│  POST /auth/refresh          │
│ ✓ Valida refresh token en BD │
│ ✓ Emite nuevo access token   │
└──────────────────────────────┘
```

---

## 🔗 INTEGRACIÓN CON OTROS SERVICIOS

### Para validar tokens desde Payment Service o GraphQL:

```python
# Llamar endpoint interno
import httpx

async def validar_token_con_auth_service(token: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "http://localhost:8000/auth/validate",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception("Token inválido")
```

---

## 📁 ARCHIVOS MODIFICADOS/CREADOS

| Archivo                              | Cambio                          |
| ------------------------------------ | ------------------------------- |
| `requirements.txt`                   | ✅ Agregadas dependencias       |
| `app/auth/jwt.py`                    | ✅ Reescrito con refresh tokens |
| `app/models/token_model.py`          | ✅ Nuevo                        |
| `app/controllers/auth_controller.py` | ✅ Nuevo                        |
| `app/routes/auth_routes.py`          | ✅ Nuevo                        |
| `main.py`                            | ✅ Registrados modelos y rutas  |

---

## ⚠️ PRÓXIMAS TAREAS (SEMANA 2)

- [ ] Rate limiting en `/auth/login`
- [ ] Integración con Payment Service
- [ ] Cliente HTTP para conectar con grupo Reservas
- [ ] Webhook para recibir reservas confirmadas

---

## 🧪 TESTING RÁPIDO

Coloca esto en un archivo `test_auth_week1.py`:

```python
import httpx
import asyncio

BASE_URL = "http://localhost:8000"

async def test_auth_flow():
    async with httpx.AsyncClient() as client:
        # 1. Registrar
        print("1️⃣ Registrando usuario...")
        reg_resp = await client.post(f"{BASE_URL}/auth/register", json={
            "nombre": "Test", "apellido": "User",
            "email": "test@example.com", "username": "testuser",
            "password": "testpass123"
        })
        print(f"Status: {reg_resp.status_code}")
        reg_data = reg_resp.json()
        access_token = reg_data["access_token"]
        refresh_token = reg_data["refresh_token"]
        print(f"✓ Tokens obtenidos\n")

        # 2. Validar token
        print("2️⃣ Validando token...")
        val_resp = await client.get(
            f"{BASE_URL}/auth/validate",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        print(f"✓ Token válido: {val_resp.json()['valid']}\n")

        # 3. Obtener datos
        print("3️⃣ Obteniendo datos del usuario...")
        me_resp = await client.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        print(f"✓ Usuario: {me_resp.json()['email']}\n")

        # 4. Refrescar token
        print("4️⃣ Renovando access token...")
        refresh_resp = await client.post(f"{BASE_URL}/auth/refresh", json={
            "refresh_token": refresh_token
        })
        new_access = refresh_resp.json()["access_token"]
        print(f"✓ Nuevo access token: {new_access[:30]}...\n")

        # 5. Logout
        print("5️⃣ Cerrando sesión...")
        logout_resp = await client.post(
            f"{BASE_URL}/auth/logout",
            headers={"Authorization": f"Bearer {new_access}"},
            json={"access_token": new_access}
        )
        print(f"✓ Sesión cerrada: {logout_resp.json()['message']}")

if __name__ == "__main__":
    asyncio.run(test_auth_flow())
```

Ejecuta con:

```bash
python test_auth_week1.py
```

---

**Fin de Semana 1 ✓**
