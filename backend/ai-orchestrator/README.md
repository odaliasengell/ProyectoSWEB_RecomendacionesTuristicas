# Pilar 3: MCP - Chatbot Multimodal con IA

## 📋 Descripción General

Sistema completo de chatbot con inteligencia artificial que procesa diferentes tipos de entrada (texto, imágenes, PDFs) y ejecuta acciones de negocio mediante herramientas MCP (Model Context Protocol).

## 🏗️ Arquitectura

```
┌─────────────────┐
│   Frontend      │
│ FloatingChatWidget │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ AI Orchestrator │ ← Microservicio principal
│   (Puerto 8004) │
└────────┬────────┘
         │
         ├──→ LLM Adapters (Strategy Pattern)
         │    ├─ GeminiAdapter
         │    └─ OpenAIAdapter
         │
         ├──→ Multimodal Processor
         │    ├─ Image OCR
         │    └─ PDF Extraction
         │
         └──→ MCP Client
              │
              ↓
         ┌────────────┐
         │ MCP Server │
         │ (Puerto 8005) │
         └────────────┘
              │
              ↓
         ┌────────────┐
         │  REST API  │
         │ GraphQL, etc │
         └────────────┘
```

## 📦 Componentes Implementados

### 1. AI Orchestrator (`backend/ai-orchestrator/`)

**Archivo:** `main.py`

Microservicio FastAPI que orquesta todas las interacciones con IA.

**Endpoints:**

- `POST /chat/text` - Chat de texto simple
- `POST /chat/image` - Procesar imágenes con OCR
- `POST /chat/pdf` - Extraer información de PDFs
- `POST /chat/multimodal` - Endpoint unificado multimodal
- `GET /providers` - Listar proveedores de IA disponibles
- `GET /tools` - Listar herramientas MCP disponibles

**Características:**
- ✅ Manejo de conversaciones con historial
- ✅ Soporte para múltiples proveedores de IA
- ✅ Integración con herramientas MCP
- ✅ Procesamiento multimodal

### 2. LLM Adapters (Patrón Strategy)

**Archivo:** `llm_adapters.py`

Implementa el patrón Strategy para intercambiar proveedores de IA sin cambiar la lógica de negocio.

**Clases:**
- `LLMAdapter` - Interface abstracta
- `GeminiAdapter` - Implementación para Google Gemini
- `OpenAIAdapter` - Implementación para OpenAI GPT
- `LLMAdapterFactory` - Factory para crear adaptadores

**Ventajas:**
- ✅ Fácil agregar nuevos proveedores
- ✅ Cambio de proveedor en tiempo de ejecución
- ✅ Código desacoplado y mantenible

### 3. Multimodal Processor

**Archivo:** `multimodal_processor.py`

Procesa diferentes tipos de entrada.

**Métodos:**
- `process_image()` - OCR de imágenes usando Tesseract
- `process_pdf()` - Extracción de texto, metadatos y tablas
- `process_audio()` - Placeholder para transcripción (bonus)

**Bibliotecas:**
- Pillow - Procesamiento de imágenes
- pytesseract - OCR
- PyPDF2 - Metadatos y texto básico
- pdfplumber - Extracción avanzada y tablas

### 4. MCP Server

**Archivo:** `backend/mcp-server/main.py`

Servidor de herramientas que el LLM puede invocar.

**Herramientas Implementadas:**

#### Tools de Consulta (2):
1. **buscar_destinos** - Busca destinos turísticos
2. **ver_reserva** - Consulta información de reserva
3. **buscar_guias** - Busca guías turísticos (bonus)

#### Tools de Acción (2):
1. **crear_reserva** - Crea nueva reserva

#### Tools de Reporte (1):
1. **estadisticas_ventas** - Genera reportes de ventas

### 5. FloatingChatWidget (Frontend)

**Archivo:** `frontend/recomendaciones/src/components/FloatingChatWidget.jsx`

Componente React para el chat flotante.

**Características:**
- ✅ Interfaz moderna y responsiva
- ✅ Soporte para texto, imágenes y PDFs
- ✅ Selector de proveedor de IA (Gemini/OpenAI)
- ✅ Historial de conversación
- ✅ Indicadores de carga y errores
- ✅ Visualización de herramientas usadas

## 🚀 Instalación y Configuración

### Requisitos Previos

1. **Python 3.9+**
2. **Node.js 18+**
3. **Tesseract OCR** (para procesamiento de imágenes)

#### Instalar Tesseract en Windows:
```powershell
# Descargar desde: https://github.com/UB-Mannheim/tesseract/wiki
# O usar chocolatey:
choco install tesseract
```

### Paso 1: Configurar AI Orchestrator

```powershell
cd backend\ai-orchestrator

# Copiar archivo de configuración
Copy-Item .env.example .env

# Editar .env y agregar API Keys
notepad .env
```

**Configurar `.env`:**
```env
GEMINI_API_KEY=tu_api_key_de_gemini
OPENAI_API_KEY=tu_api_key_de_openai
MCP_SERVER_URL=http://localhost:8005
PORT=8004
```

**Obtener API Keys:**
- Gemini: https://makersuite.google.com/app/apikey
- OpenAI: https://platform.openai.com/api-keys

```powershell
# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
.\start.ps1
```

### Paso 2: Configurar MCP Server

```powershell
cd backend\mcp-server

# Copiar configuración
Copy-Item .env.example .env

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
.\start.ps1
```

### Paso 3: Integrar en Frontend

El componente `FloatingChatWidget` ya está creado. Para usarlo:

```jsx
// En tu layout principal o App.jsx
import FloatingChatWidget from './components/FloatingChatWidget';

function App() {
  return (
    <div>
      {/* Tu contenido */}
      <FloatingChatWidget />
    </div>
  );
}
```

## 📖 Guía de Uso

### 1. Chat de Texto

```javascript
// El usuario escribe en el chat
"Busca destinos en Cusco"

// El LLM analiza y puede usar herramientas
USE_TOOL:buscar_destinos:{"query":"Cusco","categoria":"arqueología"}

// El chatbot responde con los resultados
```

### 2. Análisis de Imágenes

```javascript
// El usuario sube una imagen
1. Click en el icono de imagen 📷
2. Selecciona una foto de un ticket o documento
3. Escribe: "¿Qué información contiene esta imagen?"

// El sistema:
- Extrae texto con OCR
- Envía al LLM con el contexto
- Responde con la información
```

### 3. Extracción de PDFs

```javascript
// El usuario sube un PDF
1. Click en el icono de PDF 📄
2. Selecciona un PDF de factura o contrato
3. Escribe: "Resume este documento"

// El sistema:
- Extrae texto y tablas
- Analiza con IA
- Proporciona resumen
```

### 4. Crear Reservas por Chat

```
Usuario: "Quiero reservar Machu Picchu para 2 personas el 15 de febrero"

Asistente: [Usa tool crear_reserva]
"¡Perfecto! He creado tu reserva:
- Destino: Machu Picchu
- Fecha: 2026-02-15
- Personas: 2
- Total: $300
- ID: RES-2026-001"
```

## 🧪 Pruebas

### Pruebas con cURL

**Chat de texto:**
```powershell
$body = @{
    message = "Busca destinos de playa"
    provider = "gemini"
    use_tools = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8004/chat/text" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Chat con imagen:**
```powershell
$form = @{
    message = "Analiza esta imagen"
    provider = "gemini"
    image = Get-Item "C:\ruta\a\imagen.jpg"
}

Invoke-RestMethod -Uri "http://localhost:8004/chat/image" `
    -Method POST `
    -Form $form
```

**Chat con PDF:**
```powershell
$form = @{
    message = "Resume este documento"
    provider = "gemini"
    pdf = Get-Item "C:\ruta\a\documento.pdf"
}

Invoke-RestMethod -Uri "http://localhost:8004/chat/pdf" `
    -Method POST `
    -Form $form
```

### Pruebas de Herramientas MCP

```powershell
# Listar herramientas
Invoke-RestMethod -Uri "http://localhost:8005/tools"

# Buscar destinos
$body = @{
    params = @{
        query = "playa"
        categoria = "playa"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8005/tools/buscar_destinos" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Crear reserva
$body = @{
    params = @{
        destino_id = 1
        fecha = "2026-02-15"
        personas = 2
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8005/tools/crear_reserva" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Estadísticas de ventas
$body = @{
    params = @{
        fecha_inicio = "2026-01-01"
        fecha_fin = "2026-01-19"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8005/tools/estadisticas_ventas" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## 🎯 Características del Pilar 3

### ✅ Cumplimiento de Requisitos

#### Componentes Requeridos:
- ✅ **AI Orchestrator**: Microservicio FastAPI en puerto 8004
- ✅ **LLM Adapter abstracto**: Patrón Strategy implementado
- ✅ **MCP Server con Tools**: Servidor en puerto 8005
- ✅ **Chat UI**: Componente React FloatingChatWidget

#### Entradas Multimodales (mínimo 2):
- ✅ **Texto**: Chat conversacional
- ✅ **Imagen**: OCR con Tesseract
- ✅ **PDF**: Extracción con PyPDF2 y pdfplumber
- ⭐ **Audio**: Placeholder para bonus

#### MCP Tools (mínimo 5):
1. ✅ **buscar_destinos** (consulta)
2. ✅ **ver_reserva** (consulta)
3. ✅ **buscar_guias** (consulta - bonus)
4. ✅ **crear_reserva** (acción)
5. ✅ **estadisticas_ventas** (reporte)

## 🔧 Troubleshooting

### Error: "Tesseract not found"

```powershell
# Windows
choco install tesseract

# O descargar manualmente:
# https://github.com/UB-Mannheim/tesseract/wiki

# Agregar al PATH:
$env:PATH += ";C:\Program Files\Tesseract-OCR"
```

### Error: "GEMINI_API_KEY not configured"

```powershell
# Verificar .env
cd backend\ai-orchestrator
notepad .env

# Agregar:
GEMINI_API_KEY=tu_clave_aqui
```

### Error: "Connection refused to MCP Server"

```powershell
# Verificar que MCP Server esté corriendo
cd backend\mcp-server
.\start.ps1

# O verificar puerto
netstat -ano | findstr :8005
```

### Error en Frontend: "CORS policy"

El AI Orchestrator ya tiene CORS configurado para:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (React)

Si usas otro puerto, edita `main.py`:
```python
allow_origins=["http://localhost:TU_PUERTO"]
```

## 📊 Diagramas de Flujo

### Flujo de Chat con Herramientas

```
Usuario → Frontend → AI Orchestrator → LLM Adapter → LLM (Gemini/OpenAI)
                                                           ↓
                                                    Quiere usar tool?
                                                           ↓
                                           AI Orchestrator → MCP Client
                                                           ↓
                                                       MCP Server
                                                           ↓
                                                    Ejecuta herramienta
                                                           ↓
                                           Resultados → LLM → Respuesta final
                                                           ↓
                                                       Usuario
```

### Flujo Multimodal

```
Usuario sube imagen/PDF
    ↓
Frontend → AI Orchestrator
    ↓
Multimodal Processor
    ├─ Image → OCR (Tesseract)
    └─ PDF → Extraction (PyPDF2/pdfplumber)
    ↓
Texto extraído + mensaje usuario
    ↓
LLM Adapter → Respuesta
    ↓
Frontend
```

## 🎓 Patrones de Diseño Utilizados

### 1. Strategy Pattern (LLM Adapters)
- Permite intercambiar algoritmos (proveedores de IA)
- Fácil extensión con nuevos proveedores
- Desacoplamiento de lógica de negocio

### 2. Factory Pattern (LLMAdapterFactory)
- Crea instancias de adaptadores
- Encapsula lógica de creación

### 3. Adapter Pattern (LLM Adapters)
- Adapta interfaces de diferentes APIs
- Interfaz unificada para todos los proveedores

## 📚 Referencias

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google Gemini API](https://ai.google.dev/)
- [OpenAI API](https://platform.openai.com/docs)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)

## 🎯 Próximos Pasos

1. **Implementar audio**: Agregar transcripción con Whisper
2. **Cache de conversaciones**: Usar Redis para persistencia
3. **Streaming de respuestas**: Implementar respuestas en tiempo real
4. **Más herramientas MCP**: Agregar más acciones de negocio
5. **Testing**: Agregar pruebas unitarias y de integración
6. **Integración Telegram/WhatsApp**: Via n8n

## ✨ Características Bonus Implementadas

- 🎨 UI moderna con gradientes y animaciones
- 🔄 Cambio de proveedor en tiempo real
- 📊 Visualización de herramientas usadas
- 🚀 Respuestas simuladas si servicios no están disponibles
- 🎯 Manejo robusto de errores
- 📱 Diseño responsivo
- ⚡ Indicadores de carga y estado

---

**Desarrollado para Proyecto SWEB - Recomendaciones Turísticas**  
**Fecha:** Enero 2026
