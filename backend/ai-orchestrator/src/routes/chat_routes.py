"""
Chat Routes
Autor: Odalis Senge
"""
from fastapi import APIRouter, HTTPException
from typing import List
import uuid

from ..models.chat import ChatRequest, ChatResponse, Message
from ..services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Enviar un mensaje al chatbot
    """
    try:
        # Generar conversation_id si no existe
        conversation_id = request.conversation_id or f"CONV-{uuid.uuid4().hex[:12].upper()}"
        
        # Procesar mensaje
        response = await chat_service.process_message(
            message=request.message,
            conversation_id=conversation_id,
            context=request.context,
            use_tools=request.use_tools
        )
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")


@router.get("/history/{conversation_id}", response_model=List[Message])
async def get_conversation_history(conversation_id: str):
    """
    Obtener historial de una conversación
    """
    history = await chat_service.get_conversation_history(conversation_id)
    return history


@router.delete("/history/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """
    Limpiar historial de conversación
    """
    success = await chat_service.clear_conversation(conversation_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"message": "Conversation cleared", "conversation_id": conversation_id}


@router.post("/suggestions")
async def get_suggestions(request: dict):
    """
    Obtener sugerencias basadas en contexto
    """
    context = request.get("context", {})
    suggestions = await chat_service.get_suggestions(context)
    
    return {"suggestions": suggestions}
