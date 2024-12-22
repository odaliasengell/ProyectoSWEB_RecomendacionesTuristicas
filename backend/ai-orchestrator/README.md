# AI Orchestrator - Chatbot Multimodal con MCP

## Descripción
Microservicio de orquestación de IA que procesa entradas multimodales y ejecuta herramientas MCP.

## Características
- ✅ LLM Adapter con patrón Strategy
- ✅ Procesamiento multimodal (texto, imágenes, PDF)
- ✅ 5+ MCP Tools funcionales
- ✅ Integración con Gemini/OpenAI
- ✅ Chat UI en frontend

## MCP Tools Implementados

### 1. buscar_destinos (Consulta)
Buscar destinos turísticos por criterios

### 2. ver_reserva (Consulta)
Consultar detalles de una reserva

### 3. crear_reserva (Acción)
Crear nueva reserva de tour

### 4. procesar_pago (Acción)
Procesar pago para una reserva

### 5. obtener_estadisticas (Reporte)
Obtener estadísticas de ventas y reservas

## Arquitectura

```
ai-orchestrator/
├── src/
│   ├── adapters/
│   │   ├── llm_provider.py        # Interface Strategy
│   │   ├── gemini_adapter.py      # Google Gemini
│   │   └── openai_adapter.py      # OpenAI
│   ├── tools/
│   │   ├── base_tool.py
│   │   ├── buscar_destinos.py
│   │   ├── ver_reserva.py
│   │   ├── crear_reserva.py
│   │   ├── procesar_pago.py
│   │   └── obtener_estadisticas.py
│   ├── services/
│   │   ├── orchestrator_service.py
│   │   └── multimodal_processor.py
│   └── main.py
├── requirements.txt
└── README.md
```

## Responsable
**Odalis Senge** - Implementación del AI Orchestrator

## Fecha de Implementación
Semanas 2-3: 1 Enero - 11 Enero 2026
