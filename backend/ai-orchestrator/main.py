"""
AI Orchestrator - Microservicio de Chatbot con MCP
Autor: Odalis Senge
Semana 3: Implementación de chatbot con herramientas MCP
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from datetime import datetime
import os
from typing import List, Optional
import uvicorn
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

from src.services.chat_service import ChatService
from src.models.chat import ChatRequest, ChatResponse, Message

# Variables globales
db_client = None
chat_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejo del ciclo de vida de la aplicación"""
    global db_client, chat_service
    
    # Startup
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    db_client = AsyncIOMotorClient(mongo_uri)
    db = db_client.ai_orchestrator_db
    
    chat_service = ChatService(db)
    await chat_service.initialize()
    
    print("✅ AI Orchestrator iniciado")
    print(f"✅ LLM Provider: {chat_service.llm.provider_name}")
    print(f"✅ Herramientas disponibles: {len(chat_service.tools)}")
    
    yield
    
    # Shutdown
    if db_client:
        db_client.close()
        print("🔌 Conexión a MongoDB cerrada")


app = FastAPI(
    title="AI Orchestrator",
    description="Chatbot inteligente con MCP para recomendaciones turísticas",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-orchestrator",
        "timestamp": datetime.utcnow().isoformat(),
        "llm_provider": chat_service.llm.provider_name if chat_service else "unknown",
        "tools_count": len(chat_service.tools) if chat_service else 0
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Procesar mensaje del usuario con el chatbot"""
    try:
        response = await chat_service.process_message(
            user_id=request.user_id,
            message=request.message,
            session_id=request.session_id
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/chat/history/{session_id}")
async def get_history(session_id: str):
    """Obtener historial de conversación"""
    history = await chat_service.get_conversation_history(session_id)
    return {"session_id": session_id, "messages": history}


@app.get("/tools")
async def list_tools():
    """Listar herramientas MCP disponibles"""
    tools = chat_service.get_available_tools()
    return {"tools": tools}


@app.post("/chat/clear/{session_id}")
async def clear_session(session_id: str):
    """Limpiar historial de conversación"""
    await chat_service.clear_session(session_id)
    return {"status": "cleared", "session_id": session_id}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8003,
        reload=True
    )
