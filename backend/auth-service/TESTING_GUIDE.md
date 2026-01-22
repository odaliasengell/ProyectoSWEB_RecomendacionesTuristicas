# 🧪 Guía de Pruebas - Auth Service

## PowerShell (Windows)

### 1. Registro de Usuario

```powershell
$body = @{
    email = "test@example.com"
    password = "Password123"
    full_name = "Test User"
    role = "user"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8001/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### 2. Login

```powershell
$body = @{
    email = "test@example.com"
    password = "Password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8001/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Guardar tokens
$accessToken = $response.access_token
$refreshToken = $response.refresh_token

Write-Host "Access Token: $accessToken"
Write-Host "Refresh Token: $refreshToken"
```

### 3. Obtener Usuario Actual

```powershell
$headers = @{
    "Authorization" = "Bearer $accessToken"
}

Invoke-RestMethod -Uri "http://localhost:8001/auth/me" `
    -Method Get `
    -Headers $headers
```

### 4. Validar Token

```powershell
$body = @{
    token = $accessToken
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8001/auth/validate" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### 5. Renovar Access Token

```powershell
$body = @{
    refresh_token = $refreshToken
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8001/auth/refresh" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Actualizar access token
$accessToken = $response.access_token
```

### 6. Logout

```powershell
$body = @{
    access_token = $accessToken
    refresh_token = $refreshToken
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8001/auth/logout" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

## cURL (Linux/Mac)

### 1. Registro

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

### 2. Login

```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }' | jq .

# Guardar token
ACCESS_TOKEN=$(curl -s -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123"}' \
  | jq -r '.access_token')

echo $ACCESS_TOKEN
```

### 3. Usuario Actual

```bash
curl http://localhost:8001/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
```

### 4. Validar Token

```bash
curl -X POST http://localhost:8001/auth/validate \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$ACCESS_TOKEN\"}" | jq .
```

## Python

```python
import requests

BASE_URL = "http://localhost:8001"

# 1. Registro
response = requests.post(f"{BASE_URL}/auth/register", json={
    "email": "test@example.com",
    "password": "Password123",
    "full_name": "Test User",
    "role": "user"
})
print("Registro:", response.json())

# 2. Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "test@example.com",
    "password": "Password123"
})
tokens = response.json()
access_token = tokens["access_token"]
refresh_token = tokens["refresh_token"]
print("Access Token:", access_token[:50] + "...")

# 3. Usuario actual
headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
print("Usuario:", response.json())

# 4. Validar token
response = requests.post(f"{BASE_URL}/auth/validate", json={
    "token": access_token
})
print("Validación:", response.json())

# 5. Refresh token
response = requests.post(f"{BASE_URL}/auth/refresh", json={
    "refresh_token": refresh_token
})
new_tokens = response.json()
access_token = new_tokens["access_token"]
print("Nuevo Access Token:", access_token[:50] + "...")

# 6. Logout
response = requests.post(f"{BASE_URL}/auth/logout", json={
    "access_token": access_token,
    "refresh_token": refresh_token
})
print("Logout:", response.json())
```

## JavaScript/Fetch

```javascript
const BASE_URL = "http://localhost:8001";

// 1. Registro
const register = async () => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "Password123",
      full_name: "Test User",
      role: "user"
    })
  });
  return await response.json();
};

// 2. Login
const login = async () => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "Password123"
    })
  });
  return await response.json();
};

// 3. Usuario actual
const getCurrentUser = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  });
  return await response.json();
};

// Uso
(async () => {
  // Login
  const tokens = await login();
  console.log("Access Token:", tokens.access_token);
  
  // Usuario actual
  const user = await getCurrentUser(tokens.access_token);
  console.log("Usuario:", user);
})();
```

## Casos de Prueba

### ✅ Casos Exitosos

1. **Registro con datos válidos** → 201 Created
2. **Login con credenciales correctas** → 200 OK
3. **Validar token válido** → 200 OK, valid: true
4. **Refresh token válido** → 200 OK, nuevo access token
5. **Logout con tokens válidos** → 200 OK

### ❌ Casos de Error

1. **Registro con email duplicado** → 400 Bad Request
2. **Login con contraseña incorrecta** → 401 Unauthorized
3. **Login con email no existente** → 401 Unauthorized
4. **Validar token expirado** → 200 OK, valid: false, error: "Token expirado"
5. **Validar token revocado** → 200 OK, valid: false, error: "Token revocado"
6. **Refresh con token inválido** → 401 Unauthorized
7. **Rate limit excedido en login** → 429 Too Many Requests

### 🔒 Seguridad

1. **Contraseña débil** → 422 Validation Error
   ```json
   {
     "email": "test@example.com",
     "password": "123",  // Muy corta
     "full_name": "Test"
   }
   ```

2. **Rate limiting en login**
   ```powershell
   # Hacer más de 5 intentos en 1 minuto
   for ($i=1; $i -le 10; $i++) {
       Write-Host "Intento $i"
       Invoke-RestMethod -Uri "http://localhost:8001/auth/login" `
           -Method Post `
           -ContentType "application/json" `
           -Body '{"email":"test@example.com","password":"wrong"}'
   }
   # Intento 6+ debe retornar 429
   ```

## 📊 Pruebas de Flujo Completo

```powershell
# Script completo de prueba
Write-Host "=== Test Auth Service ===" -ForegroundColor Cyan

# 1. Registro
Write-Host "`n1. Registrando usuario..." -ForegroundColor Yellow
$registerBody = @{
    email = "testflow@example.com"
    password = "SecurePass123"
    full_name = "Flow Test User"
    role = "user"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8001/auth/register" `
        -Method Post -ContentType "application/json" -Body $registerBody
    Write-Host "✅ Usuario registrado: $($registerResponse.user.email)" -ForegroundColor Green
    
    $accessToken = $registerResponse.access_token
    $refreshToken = $registerResponse.refresh_token
} catch {
    Write-Host "❌ Error en registro: $_" -ForegroundColor Red
    exit
}

# 2. Obtener usuario actual
Write-Host "`n2. Obteniendo usuario actual..." -ForegroundColor Yellow
$headers = @{ "Authorization" = "Bearer $accessToken" }
$currentUser = Invoke-RestMethod -Uri "http://localhost:8001/auth/me" -Headers $headers
Write-Host "✅ Usuario: $($currentUser.full_name) ($($currentUser.role))" -ForegroundColor Green

# 3. Validar token
Write-Host "`n3. Validando access token..." -ForegroundColor Yellow
$validateBody = @{ token = $accessToken } | ConvertTo-Json
$validation = Invoke-RestMethod -Uri "http://localhost:8001/auth/validate" `
    -Method Post -ContentType "application/json" -Body $validateBody
Write-Host "✅ Token válido: $($validation.valid)" -ForegroundColor Green

# 4. Esperar 1 segundo y renovar token
Write-Host "`n4. Renovando access token..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
$refreshBody = @{ refresh_token = $refreshToken } | ConvertTo-Json
$refreshResponse = Invoke-RestMethod -Uri "http://localhost:8001/auth/refresh" `
    -Method Post -ContentType "application/json" -Body $refreshBody
$newAccessToken = $refreshResponse.access_token
Write-Host "✅ Access token renovado" -ForegroundColor Green

# 5. Logout
Write-Host "`n5. Cerrando sesión..." -ForegroundColor Yellow
$logoutBody = @{
    access_token = $newAccessToken
    refresh_token = $refreshToken
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8001/auth/logout" `
    -Method Post -ContentType "application/json" -Body $logoutBody
Write-Host "✅ Sesión cerrada" -ForegroundColor Green

# 6. Intentar usar token revocado
Write-Host "`n6. Intentando usar token revocado..." -ForegroundColor Yellow
$validateBody = @{ token = $newAccessToken } | ConvertTo-Json
$validation = Invoke-RestMethod -Uri "http://localhost:8001/auth/validate" `
    -Method Post -ContentType "application/json" -Body $validateBody
if ($validation.valid -eq $false) {
    Write-Host "✅ Token correctamente revocado: $($validation.error)" -ForegroundColor Green
} else {
    Write-Host "❌ Token no fue revocado" -ForegroundColor Red
}

Write-Host "`n=== Todas las pruebas completadas ===" -ForegroundColor Cyan
```

## 🌐 Swagger UI

Acceder a la documentación interactiva en:

**http://localhost:8001/docs**

Allí puedes probar todos los endpoints directamente desde el navegador.
