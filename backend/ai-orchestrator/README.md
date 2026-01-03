# 🤖 AI Orchestrator - Servicio de IA Conversacional Multimodal

Microservicio de inteligencia artificial con soporte para múltiples proveedores LLM (Gemini, OpenAI) y MCP Tools para ejecutar acciones de negocio.

## 🚀 Características

- ✅ LLM Adapter abstracto (Strategy Pattern) para intercambiar proveedores
- ✅ 5+ MCP Tools funcionales (consulta, acción, reporte)
- ✅ Soporte multimodal: Texto, Imagen, PDF
- ✅ Conversaciones con historial
- ✅ Ejecución de acciones en el negocio
- ✅ Logs de auditoría completos

## 📋 Endpoints

### Chat

- `POST /chat` - Enviar mensaje de chat
- `GET /chat/{conversation_id}` - Obtener historial
- `DELETE /chat/{conversation_id}` - Eliminar conversación

### Multimodal

- `POST /upload` - Cargar archivo (imagen, PDF)
- `POST /chat/with-image` - Chat con imagen
- `POST /chat/with-pdf` - Chat con PDF

### MCP Tools

- `GET /tools` - Listar herramientas disponibles
- `POST /tools/{tool_name}/execute` - Ejecutar herramienta (admin)

### Admin

- `GET /logs` - Ver logs de ejecución
- `GET /models` - Proveedores de IA disponibles

## 🏗️ Estructura del Código

```
ai-orchestrator/
├── main.py                    # Punto de entrada
├── config.py                  # Configuración
├── llm_adapters/
│   ├── __init__.py
│   ├── llm_provider.py        # Interface abstracta
│   ├── gemini_adapter.py      # Gemini Adapter
│   └── openai_adapter.py      # OpenAI Adapter
├── mcp_tools/
│   ├── __init__.py
│   ├── base_tool.py           # Base para MCP Tools
│   ├── query_tools.py         # Tools de consulta
│   ├── action_tools.py        # Tools de acción
│   └── report_tools.py        # Tools de reporte
├── services/
│   ├── ai_service.py          # Orquestación principal
│   ├── conversation_service.py
│   ├── multimodal_service.py  # Procesamiento de imágenes/PDFs
│   └── tool_executor.py       # Ejecutor de tools
├── routes/
│   ├── chat_routes.py
│   ├── tool_routes.py
│   └── admin_routes.py
└── schemas/
    └── chat_schema.py
```

## 🔧 Instalación

```bash
cd backend/ai-orchestrator

# Entorno virtual
python -m venv venv
source venv/bin/activate

# Dependencias
pip install -r requirements.txt

# Configuración
cp .env.example .env
# Editar .env con API keys

# Ejecutar
python main.py
```

## 🤖 Arquitectura: LLM Adapter + MCP Tools

```
┌─────────────────────────────────┐
│     Chat UI / Frontend           │
│  Envía mensaje + attachments     │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│   AI Orchestrator Service       │
│ POST /chat {message, files}     │
└──────────┬──────────────────────┘
           │
      ┌────▼─────────────────────────┐
      │ Multimodal Processor         │
      │ • Extraer texto de imagen    │
      │ • Leer PDF                   │
      │ • Normalizar entrada         │
      └────┬──────────────────────┬──┘
           │                      │
           ▼                      ▼
    ┌─────────────┐         ┌──────────────────┐
    │ LLMAdapter  │         │ Context Builder  │
    │ (Strategy)  │         │ • Historial chat │
    │             │         │ • Permisos user  │
    │ Selecciona: │         │ • Variables env  │
    │ • Gemini    │         └──────────────────┘
    │ • OpenAI    │
    └────┬────────┘
         │
         ▼
    ┌──────────────────────┐
    │ LLM (Gemini/OpenAI)  │
    │                      │
    │ Tool Calling         │
    │ • Nombre: buscar...  │
    │ • Parámetros: {..}   │
    └────┬─────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ MCP Tool Executor        │
    │                          │
    │ 2 Consulta:              │
    │ • buscar_tours           │
    │ • obtener_reservas       │
    │                          │
    │ 2 Acción:                │
    │ • crear_reserva          │
    │ • procesar_pago          │
    │                          │
    │ 1 Reporte:               │
    │ • resumen_ventas         │
    └────┬─────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ Business Services        │
    │ • REST API               │
    │ • MongoDB                │
    │ • Payment Service        │
    └──────────────────────────┘
```

## 💬 Flujo de Chat

```
1. Usuario: "Busca tours en Galápagos"
   ├── Multimodal Processor: Detecta texto puro
   ├── Context Builder: Obtiene historial + permisos
   └── Envía a LLM

2. LLM (Gemini) procesa:
   ├── Entiende intención: "buscar tours"
   ├── Identifica parámetro: "Galápagos"
   ├── Selecciona herramienta: "buscar_tours"
   └── Retorna: {tool: "buscar_tours", params: {destino: "Galápagos"}}

3. Tool Executor ejecuta:
   ├── Valida entrada
   ├── Autoriza usuario
   ├── Consulta REST API: GET /tours?destino=Galápagos
   └── Retorna resultados

4. LLM genera respuesta:
   ├── Procesa resultados
   ├── Formatea para usuario
   └── Retorna: "Encontré 5 tours en Galápagos: ..."

5. Frontend recibe respuesta:
   └── Muestra al usuario con opciones de interacción
```

## 📦 MCP Tools Implementados

### Consulta Tools (2)

#### 1. buscar_tours

```python
tool_buscar_tours = {
    "name": "buscar_tours",
    "description": "Buscar tours disponibles por destino, fecha o precio",
    "parameters": {
        "destino": "string (opcional)",
        "fecha_inicio": "date (opcional)",
        "precio_max": "number (opcional)",
        "duracion_minima": "number (opcional)"
    }
}

# Ejemplo
tool_executor.execute("buscar_tours", {
    "destino": "Galápagos",
    "precio_max": 500
})
# Retorna: [{id, nombre, descripción, precio, ...}]
```

#### 2. obtener_reservas_usuario

```python
tool_obtener_reservas = {
    "name": "obtener_reservas_usuario",
    "description": "Obtener reservas del usuario autenticado",
    "parameters": {
        "estado": "enum(pending, confirmed, cancelled)",
        "limite": "number"
    }
}

# Ejemplo
tool_executor.execute("obtener_reservas_usuario", {
    "estado": "confirmed",
    "limite": 10
})
# Retorna: [{id, tour, fecha, status, monto, ...}]
```

### Acción Tools (2)

#### 3. crear_reserva

```python
tool_crear_reserva = {
    "name": "crear_reserva",
    "description": "Crear una nueva reserva de tour",
    "parameters": {
        "tour_id": "uuid (requerido)",
        "fecha_inicio": "date (requerido)",
        "cantidad_personas": "number",
        "notas_especiales": "string"
    }
}

# Ejemplo de flujo
user_msg = "Quiero reservar el tour 'Amazonía' para 5 personas el 15 de enero"
llm_response = await ai_service.chat(user_msg)
# LLM identifica: crear_reserva con params
# Tool ejecuta: POST /tours/{tour_id}/reservas
# Retorna: {reservation_id, status, total_price}
```

#### 4. procesar_pago

```python
tool_procesar_pago = {
    "name": "procesar_pago",
    "description": "Procesar pago para reserva existente",
    "parameters": {
        "reserva_id": "uuid (requerido)",
        "metodo_pago": "enum(tarjeta, transferencia, paypal)",
        "confirmado": "boolean"
    }
}

# Ejemplo
tool_executor.execute("procesar_pago", {
    "reserva_id": "uuid-123",
    "metodo_pago": "tarjeta"
})
# Retorna: {transaction_id, status, confirmacion}
```

### Reporte Tool (1)

#### 5. resumen_ventas_diarias

```python
tool_resumen = {
    "name": "resumen_ventas_diarias",
    "description": "Obtener resumen de ventas y reservas del día",
    "parameters": {
        "fecha": "date (opcional, default: hoy)",
        "grupo_por": "enum(tour, tipo_usuario, metodo_pago)"
    }
}

# Ejemplo
tool_executor.execute("resumen_ventas_diarias", {
    "grupo_por": "tour"
})
# Retorna: {
#   "total_ventas": 5000,
#   "cantidad_reservas": 25,
#   "tours": [
#     {"tour": "Amazonía", "reservas": 10, "ingresos": 2000},
#     ...
#   ]
# }
```

## 🖼️ Soporte Multimodal

### Texto (Obligatorio)

```bash
POST /chat
{
  "message": "Busca tours en Galápagos",
  "conversation_id": "uuid"
}
```

### Imagen (OCR + Análisis)

```bash
POST /chat/with-image
{
  "message": "¿Qué destino se ve en esta foto?",
  "image_file": <binary>
}

# AI extrae:
# - Texto (OCR)
# - Objetos detectados
# - Ubicación geográfica (si aplica)
```

### PDF (Extracción de datos)

```bash
POST /chat/with-pdf
{
  "message": "Resumen de este catálogo de tours",
  "pdf_file": <binary>
}

# AI extrae:
# - Texto del PDF
# - Tablas de datos
# - Imágenes incrustadas
```

## 🔐 Autorización de Tools

```python
# En tool_executor.py

def authorize_tool_execution(user_id: str, tool_name: str) -> bool:
    """Verificar si usuario puede ejecutar tool"""

    # Tools de consulta: todos los usuarios autenticados
    if tool_name in ["buscar_tours", "obtener_reservas_usuario"]:
        return True

    # Tools de acción: solo usuarios registrados
    if tool_name in ["crear_reserva", "procesar_pago"]:
        user = get_user(user_id)
        return user and user.is_active

    # Tools de reporte: solo admin
    if tool_name == "resumen_ventas_diarias":
        return is_admin(user_id)

    return False
```

## 📊 Base de Datos - Conversaciones

### MongoDB

```javascript
db.conversations.schema = {
  _id: ObjectId,
  user_id: UUID,
  title: String,
  created_at: Date,
  updated_at: Date,
  model_used: 'gemini|openai',
  messages: [
    {
      role: 'user|assistant|system',
      content: String,
      tools_used: [],
      timestamp: Date,
    },
  ],
  metadata: {
    source: 'chat_ui|telegram|email',
    ip_address: String,
  },
};

db.tool_executions.schema = {
  _id: ObjectId,
  conversation_id: ObjectId,
  tool_name: String,
  parameters: Object,
  result: Object,
  duration_ms: Number,
  status: 'success|error',
  error_message: String,
  timestamp: Date,
  user_id: UUID,
};
```

## 🧪 Testing

```bash
# Chat simple
curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt}" \
  -d '{
    "message": "Busca tours en Galápagos",
    "conversation_id": "new"
  }'

# Con imagen
curl -X POST http://localhost:8002/chat/with-image \
  -H "Authorization: Bearer {jwt}" \
  -F "message=¿Qué lugar es este?" \
  -F "image=@photo.jpg"
```

## 🔄 Integración con n8n

Cuando se ejecuta un tool de acción (crear_reserva, procesar_pago):

1. Tool Executor ejecuta la acción
2. Publica evento a n8n webhook
3. n8n dispara workflows
4. Notifica a usuario por múltiples canales

```
AI Tool (procesar_pago)
  ↓
POST http://n8n/webhook/payment-actions
  ↓
n8n Payment Handler Workflow
  ├─ Valida pago
  ├─ Actualiza BD
  ├─ Envía confirmación por email
  ├─ Notifica vía WebSocket
  └─ Dispara webhook a partner
```

## 📈 Escalabilidad

- **Stateless**: Conversaciones en MongoDB
- **Async**: LLM calls con timeout
- **Caching**: Resultados de tools con TTL
- **Rate Limiting**: Por usuario y por tool

## 🔗 Referencias

- [Gemini API](https://ai.google.dev/)
- [OpenAI API](https://platform.openai.com/)
- [LangChain](https://python.langchain.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Strategy Pattern](https://refactoring.guru/design-patterns/strategy)
