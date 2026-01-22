"""
AI Orchestrator - Microservicio de IA Multimodal
Orquesta interacciones con modelos de lenguaje y procesamiento multimodal
"""
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from llm_adapters import LLMAdapterFactory, LLMProvider
from multimodal_processor import MultimodalProcessor
from mcp_client import MCPClient
import json
import uvicorn

# Cargar variables de entorno
load_dotenv()

app = FastAPI(title="AI Orchestrator", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar componentes
llm_factory = LLMAdapterFactory()
multimodal_processor = MultimodalProcessor()
mcp_client = MCPClient()

# Modelos
class ChatRequest(BaseModel):
    message: str
    provider: str = "gemini"  # gemini o groq
    conversation_id: Optional[str] = None
    use_tools: bool = True
    usuario_id: Optional[str] = None  # ID del usuario logueado

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    tools_used: List[str] = []
    provider: str

# Estado de conversaciones (en producción usar Redis)
conversations: Dict[str, List[Dict]] = {}

@app.get("/")
async def root():
    return {
        "service": "AI Orchestrator",
        "status": "running",
        "version": "1.0.0",
        "endpoints": [
            "/chat/text",
            "/chat/image",
            "/chat/pdf",
            "/chat/multimodal",
            "/providers",
            "/tools"
        ]
    }

@app.post("/chat/text", response_model=ChatResponse)
async def chat_text(request: ChatRequest):
    """
    Endpoint para chat de texto
    """
    try:
        print(f"📨 Mensaje recibido: {request.message}")
        print(f"🤖 Provider: {request.provider}")
        
        # Obtener adaptador LLM
        provider_map = {
            "gemini": LLMProvider.GEMINI,
            "groq": LLMProvider.GROQ
        }
        llm_adapter = llm_factory.get_adapter(
            provider_map.get(request.provider, LLMProvider.GEMINI)
        )
        
        print(f"✅ Adaptador obtenido: {type(llm_adapter).__name__}")
        print(f"🔑 Configurado: {llm_adapter.is_configured()}")
        
        # Obtener historial de conversación
        conv_id = request.conversation_id or f"conv_{len(conversations)}"
        history = conversations.get(conv_id, [])
        
        # Agregar mensaje del usuario
        history.append({"role": "user", "content": request.message})
        
        # Obtener herramientas MCP si están habilitadas
        tools = []
        if request.use_tools:
            tools = mcp_client.get_available_tools()
        
        print(f"🛠️  Herramientas disponibles: {len(tools)}")
        print(f"👤 Usuario ID: {request.usuario_id}")
        
        # Generar respuesta
        response_text = await llm_adapter.generate(
            messages=history,
            tools=tools if tools else None
        )
        
        print(f"💬 Respuesta generada: {response_text[:100]}...")
        
        # Verificar si el LLM quiere usar herramientas
        tools_used = []
        if request.use_tools and llm_adapter.wants_to_use_tool(response_text):
            print(f"🔧 LLM quiere usar herramientas!")
            tool_results = await mcp_client.execute_tools(response_text, usuario_id=request.usuario_id)
            print(f"📊 Resultados de herramientas: {tool_results}")
            tools_used = [tool["name"] for tool in tool_results]
            
            # Generar respuesta final con resultados de herramientas
            history.append({"role": "assistant", "content": response_text})
            history.append({"role": "tool", "content": json.dumps(tool_results)})
            print(f"🔄 Generando respuesta final con resultados...")
            response_text = await llm_adapter.generate(messages=history)
            print(f"✅ Respuesta final: {response_text[:100]}...")
        
        # Agregar respuesta al historial
        history.append({"role": "assistant", "content": response_text})
        conversations[conv_id] = history[-10:]  # Mantener últimos 10 mensajes
        
        return ChatResponse(
            response=response_text,
            conversation_id=conv_id,
            tools_used=tools_used,
            provider=request.provider
        )
        
    except Exception as e:
        import traceback
        error_msg = f"❌ ERROR: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/image")
async def chat_image(
    image: UploadFile = File(...),
    message: str = Form(...),
    provider: str = Form("gemini"),
    conversation_id: Optional[str] = Form(None)
):
    """
    Endpoint para procesar imágenes con OCR y análisis
    """
    try:
        # Validar tipo de archivo
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
        
        # Leer imagen
        image_data = await image.read()
        
        # Procesar imagen (OCR, análisis)
        extracted_text = await multimodal_processor.process_image(image_data)
        
        # Obtener adaptador LLM
        llm_adapter = llm_factory.get_adapter(
            LLMProvider.GEMINI if provider == "gemini" else LLMProvider.GROQ
        )
        
        # Preparar prompt con contexto de la imagen
        conv_id = conversation_id or f"conv_{len(conversations)}"
        history = conversations.get(conv_id, [])
        
        combined_message = f"{message}\n\nTexto extraído de la imagen:\n{extracted_text}"
        history.append({"role": "user", "content": combined_message})
        
        # Generar respuesta
        response_text = await llm_adapter.generate(messages=history)
        history.append({"role": "assistant", "content": response_text})
        conversations[conv_id] = history[-10:]
        
        return {
            "response": response_text,
            "conversation_id": conv_id,
            "extracted_text": extracted_text,
            "provider": provider
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/pdf")
async def chat_pdf(
    pdf: UploadFile = File(...),
    message: str = Form(...),
    provider: str = Form("gemini"),
    conversation_id: Optional[str] = Form(None)
):
    """
    Endpoint para procesar PDFs y extraer información
    """
    try:
        # Validar tipo de archivo
        if not pdf.content_type == "application/pdf":
            raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")
        
        # Leer PDF
        pdf_data = await pdf.read()
        
        # Procesar PDF
        extracted_data = await multimodal_processor.process_pdf(pdf_data)
        
        # Obtener adaptador LLM
        llm_adapter = llm_factory.get_adapter(
            LLMProvider.GEMINI if provider == "gemini" else LLMProvider.GROQ
        )
        
        # Preparar prompt con contexto del PDF
        conv_id = conversation_id or f"conv_{len(conversations)}"
        history = conversations.get(conv_id, [])
        
        combined_message = f"{message}\n\nContenido extraído del PDF:\n{extracted_data['text']}\n\nMetadatos: {json.dumps(extracted_data['metadata'])}"
        history.append({"role": "user", "content": combined_message})
        
        # Generar respuesta
        response_text = await llm_adapter.generate(messages=history)
        history.append({"role": "assistant", "content": response_text})
        conversations[conv_id] = history[-10:]
        
        return {
            "response": response_text,
            "conversation_id": conv_id,
            "extracted_data": extracted_data,
            "provider": provider
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/multimodal")
async def chat_multimodal(
    message: str = Form(...),
    provider: str = Form("gemini"),
    conversation_id: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    pdf: Optional[UploadFile] = File(None)
):
    """
    Endpoint unificado para procesamiento multimodal
    """
    try:
        extracted_content = []
        
        # Procesar imagen si existe
        if image:
            image_data = await image.read()
            text = await multimodal_processor.process_image(image_data)
            extracted_content.append(f"Imagen: {text}")
        
        # Procesar PDF si existe
        if pdf:
            pdf_data = await pdf.read()
            data = await multimodal_processor.process_pdf(pdf_data)
            extracted_content.append(f"PDF: {data['text']}")
        
        # Obtener adaptador LLM
        llm_adapter = llm_factory.get_adapter(
            LLMProvider.GEMINI if provider == "gemini" else LLMProvider.GROQ
        )
        
        # Preparar mensaje completo
        conv_id = conversation_id or f"conv_{len(conversations)}"
        history = conversations.get(conv_id, [])
        
        full_message = message
        if extracted_content:
            full_message += "\n\nContenido extraído:\n" + "\n".join(extracted_content)
        
        history.append({"role": "user", "content": full_message})
        
        # Generar respuesta
        response_text = await llm_adapter.generate(messages=history)
        history.append({"role": "assistant", "content": response_text})
        conversations[conv_id] = history[-10:]
        
        return {
            "response": response_text,
            "conversation_id": conv_id,
            "extracted_content": extracted_content,
            "provider": provider
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/providers")
async def get_providers():
    """
    Listar proveedores de LLM disponibles
    """
    return {
        "providers": [
            {
                "id": "gemini",
                "name": "Google Gemini",
                "available": llm_factory.is_provider_configured(LLMProvider.GEMINI)
            },
            {
                "id": "openai",
                "name": "OpenAI GPT",
                "available": llm_factory.is_provider_configured(LLMProvider.OPENAI)
            }
        ]
    }

@app.get("/tools")
async def get_tools():
    """
    Listar herramientas MCP disponibles
    """
    try:
        tools = mcp_client.get_available_tools()
        return {
            "tools": tools,
            "count": len(tools)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Eliminar historial de conversación
    """
    if conversation_id in conversations:
        del conversations[conversation_id]
        return {"message": "Conversación eliminada"}
    raise HTTPException(status_code=404, detail="Conversación no encontrada")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)
