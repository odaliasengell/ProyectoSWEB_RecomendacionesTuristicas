# 🔑 Guía de Configuración de API Keys

## Paso 1: Obtener API Keys

### Google Gemini API Key

1. Visita: https://makersuite.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Click en "Get API Key" o "Create API Key"
4. Copia la clave generada
5. **IMPORTANTE**: Guarda la clave en un lugar seguro

**Notas:**
- Gemini tiene un tier gratuito generoso
- 60 requests por minuto gratis
- Ideal para desarrollo y testing

### OpenAI API Key

1. Visita: https://platform.openai.com/api-keys
2. Inicia sesión o crea una cuenta
3. Click en "Create new secret key"
4. Dale un nombre (ej: "chatbot-turistico")
5. Copia la clave generada
6. **IMPORTANTE**: Guárdala inmediatamente (no la podrás ver de nuevo)

**Notas:**
- Requiere método de pago configurado
- $5 de crédito inicial para nuevas cuentas
- GPT-3.5-turbo es económico para testing

---

## Paso 2: Configurar en el Proyecto

### Opción 1: Editar archivo .env (Recomendado)

```powershell
cd backend\ai-orchestrator
notepad .env
```

Pega tus claves:
```env
GEMINI_API_KEY=AIzaSyAbc123def456ghi789jkl012mno345pqr678
OPENAI_API_KEY=sk-abc123def456ghi789jkl012mno345pqr678stu901
MCP_SERVER_URL=http://localhost:8005
PORT=8004
```

### Opción 2: Variables de entorno del sistema (Windows)

```powershell
# PowerShell - Sesión actual
$env:GEMINI_API_KEY="AIzaSy..."
$env:OPENAI_API_KEY="sk-..."

# PowerShell - Permanente (requiere admin)
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIzaSy...', 'User')
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-...', 'User')
```

---

## Paso 3: Verificar Configuración

### Test 1: Verificar archivo .env

```powershell
cd backend\ai-orchestrator
Get-Content .env
```

Deberías ver:
```
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-...
```

### Test 2: Iniciar el servicio

```powershell
cd backend\ai-orchestrator
.\start.ps1
```

Si la configuración es correcta, verás:
```
🤖 Iniciando AI Orchestrator...
📦 Activando entorno virtual...
🚀 Iniciando servidor en puerto 8004...
```

### Test 3: Probar endpoints

```powershell
# Verificar proveedores disponibles
Invoke-RestMethod -Uri "http://localhost:8004/providers"
```

Respuesta esperada:
```json
{
  "providers": [
    {
      "id": "gemini",
      "name": "Google Gemini",
      "available": true    // ← Debe ser true si está configurado
    },
    {
      "id": "openai",
      "name": "OpenAI GPT",
      "available": true    // ← Debe ser true si está configurado
    }
  ]
}
```

### Test 4: Prueba de chat

```powershell
$body = @{
    message = "Hola, ¿funciona la IA?"
    provider = "gemini"
    use_tools = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8004/chat/text" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Si funciona, recibirás una respuesta del LLM.

---

## 🔍 Troubleshooting

### Error: "Gemini no está configurado"

**Causa:** GEMINI_API_KEY vacío o inválido

**Solución:**
1. Verifica que la clave esté en `.env`
2. Asegúrate de que no haya espacios extras
3. Reinicia el servicio
4. Verifica que la clave sea válida en: https://makersuite.google.com/app/apikey

```powershell
# Verificar contenido del archivo
cd backend\ai-orchestrator
Get-Content .env | Select-String "GEMINI"

# Debería mostrar:
# GEMINI_API_KEY=AIzaSy... (sin espacios, sin comillas)
```

### Error: "OpenAI no está configurado"

**Causa:** OPENAI_API_KEY vacío o inválido

**Solución:**
1. Verifica que la clave esté en `.env`
2. La clave debe empezar con `sk-`
3. Verifica que tengas créditos en: https://platform.openai.com/usage
4. Reinicia el servicio

### Error: "Invalid API Key"

**Causa:** La clave es incorrecta o ha sido revocada

**Solución:**
1. **Para Gemini:**
   - Ve a https://makersuite.google.com/app/apikey
   - Verifica que la clave esté activa
   - Si no, genera una nueva

2. **Para OpenAI:**
   - Ve a https://platform.openai.com/api-keys
   - Verifica que la clave esté activa
   - Si fue revocada, genera una nueva

### Error: "Rate limit exceeded"

**Causa:** Has excedido el límite de requests

**Solución Gemini:**
- Tier gratuito: 60 requests/minuto
- Espera 1 minuto y vuelve a intentar
- Considera actualizar a tier pagado

**Solución OpenAI:**
- Verifica tus límites en: https://platform.openai.com/account/limits
- Agrega créditos si es necesario
- Implementa rate limiting en tu app

### Error: Servicio no inicia

**Causa múltiple:**

```powershell
# 1. Verificar que Python puede leer el .env
cd backend\ai-orchestrator
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('GEMINI:', os.getenv('GEMINI_API_KEY', 'NO ENCONTRADO'))"

# 2. Verificar instalación de dependencias
pip list | Select-String "google-generativeai|openai"

# 3. Reinstalar si es necesario
pip install -r requirements.txt --upgrade
```

---

## 🔒 Seguridad de API Keys

### ✅ HACER:
- Guardar en archivo `.env`
- Agregar `.env` al `.gitignore`
- Usar variables de entorno
- Rotar claves periódicamente
- Limitar acceso por IP (si es posible)

### ❌ NO HACER:
- Commitear claves al repositorio
- Compartir claves públicamente
- Hardcodear en el código
- Usar en frontend (siempre desde backend)
- Dejar claves de prueba en producción

---

## 📊 Costos Estimados

### Google Gemini (gratuito en desarrollo)
- **Tier gratuito:** 60 requests/minuto
- **Costo adicional:** $0.00025 / 1K caracteres (solo si excedes)
- **Estimado mensual desarrollo:** $0 - $5

### OpenAI GPT-3.5-turbo
- **Costo:** $0.0015 / 1K tokens input, $0.002 / 1K tokens output
- **Promedio por conversación:** ~1000 tokens = $0.0035
- **Estimado 100 conversaciones/día:** ~$10-15/mes
- **Crédito inicial:** $5 gratis para nuevas cuentas

### Recomendación para desarrollo:
1. Usar **Gemini** como principal (gratuito)
2. Tener **OpenAI** como fallback
3. En producción, evaluar según volumen

---

## 🧪 Testing de Configuración

### Script de verificación automática

```powershell
# test_api_keys.ps1

Write-Host "🔍 Verificando configuración de API Keys..." -ForegroundColor Cyan
Write-Host ""

cd backend\ai-orchestrator

# Test 1: Verificar archivo .env existe
if (Test-Path ".env") {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Archivo .env NO encontrado" -ForegroundColor Red
    Write-Host "   Crea el archivo con: Copy-Item .env.example .env" -ForegroundColor Yellow
    exit 1
}

# Test 2: Verificar Gemini API Key
$geminiKey = Select-String -Path ".env" -Pattern "GEMINI_API_KEY=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }
if ($geminiKey -and $geminiKey -ne "your_gemini_api_key_here" -and $geminiKey.Length -gt 20) {
    Write-Host "✅ GEMINI_API_KEY configurada (${geminiKey.Substring(0,20)}...)" -ForegroundColor Green
} else {
    Write-Host "⚠️  GEMINI_API_KEY no configurada o inválida" -ForegroundColor Yellow
}

# Test 3: Verificar OpenAI API Key
$openaiKey = Select-String -Path ".env" -Pattern "OPENAI_API_KEY=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }
if ($openaiKey -and $openaiKey -ne "your_openai_api_key_here" -and $openaiKey.StartsWith("sk-")) {
    Write-Host "✅ OPENAI_API_KEY configurada (${openaiKey.Substring(0,10)}...)" -ForegroundColor Green
} else {
    Write-Host "⚠️  OPENAI_API_KEY no configurada o inválida" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Tip: Ambas claves son opcionales, pero necesitas al menos una." -ForegroundColor Cyan
```

Ejecutar:
```powershell
cd backend\ai-orchestrator
# Copia el script arriba en test_api_keys.ps1
.\test_api_keys.ps1
```

---

## ✅ Checklist Final

Antes de iniciar el chatbot, verifica:

- [ ] API Key de Gemini obtenida
- [ ] API Key de OpenAI obtenida (opcional pero recomendado)
- [ ] Archivo `.env` creado en `backend/ai-orchestrator/`
- [ ] Claves pegadas sin espacios ni comillas
- [ ] Tesseract OCR instalado (para imágenes)
- [ ] Dependencias instaladas: `pip install -r requirements.txt`
- [ ] Puerto 8004 disponible
- [ ] MCP Server corriendo en puerto 8005

---

## 🎯 Listo para Iniciar

Una vez configurado todo:

```powershell
# Terminal 1
cd backend\ai-orchestrator
.\start.ps1

# Terminal 2
cd backend\mcp-server
.\start.ps1

# Terminal 3
cd frontend\recomendaciones
npm run dev
```

¡Disfruta tu chatbot multimodal con IA! 🎉

---

**Última actualización:** 19 de Enero 2026
