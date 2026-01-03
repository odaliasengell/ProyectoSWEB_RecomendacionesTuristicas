"""
Rutas de Chat
"""
from fastapi import APIRouter, HTTPException, Header, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4
import json
from ..mcp_tools import get_tools_dict, get_tool_by_name
from ..llm_adapters import GeminiAdapter, OpenAIAdapter
from config import LLM_PROVIDER

router = APIRouter()

# Simular DB en memoria (usar MongoDB en producción)
conversations_db = {}
llm_adapter = GeminiAdapter() if LLM_PROVIDER == "gemini" else OpenAIAdapter()


class ChatRequest(BaseModel):
    """Request de chat"""
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Response de chat"""
    conversation_id: str
    response: str
    tool_calls: Optional[List[dict]] = None


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """Enviar mensaje de chat"""
    try:
        # TODO: Validar JWT y extraer user_id
        user_id = "user-123"  # Obtener del JWT
        
        # Crear o recuperar conversación
        conv_id = request.conversation_id or str(uuid4())
        
        if conv_id not in conversations_db:
            conversations_db[conv_id] = {
                "id": conv_id,
                "user_id": user_id,
                "messages": []
            }
        
        # Agregar mensaje del usuario
        conversations_db[conv_id]["messages"].append({
            "role": "user",
            "content": request.message
        })
        
        # Obtener respuesta del LLM
        response = await llm_adapter.generate_response(
            messages=conversations_db[conv_id]["messages"],
            tools=get_tools_dict()
        )
        
        # Procesar tool calls si existen
        tool_results = []
        if response.tool_calls:
            for tool_call in response.tool_calls:
                tool = get_tool_by_name(tool_call.tool_name)
                if tool:
                    result = await tool.execute(
                        user_id=user_id,
                        **tool_call.parameters
                    )
                    tool_results.append({
                        "tool": tool_call.tool_name,
                        "success": result.success,
                        "data": result.data,
                        "error": result.error
                    })
        
        # Guardar respuesta en conversación
        conversations_db[conv_id]["messages"].append({
            "role": "assistant",
            "content": response.text,
            "tool_calls": tool_results
        })
        
        return ChatResponse(
            conversation_id=conv_id,
            response=response.text,
            tool_calls=tool_results if tool_results else None
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    authorization: Optional[str] = Header(None)
):
    """Obtener historial de conversación"""
    if conversation_id not in conversations_db:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    
    # TODO: Validar que el usuario sea el propietario
    return conversations_db[conversation_id]


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    authorization: Optional[str] = Header(None)
):
    """Eliminar conversación"""
    if conversation_id not in conversations_db:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    
    del conversations_db[conversation_id]
    return {"status": "deleted"}


@router.post("/with-image")
async def chat_with_image(
    message: str = Form(...),
    image: UploadFile = File(...),
    conversation_id: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """Chat con soporte para imagen"""
    try:
        user_id = "user-123"  # Obtener del JWT
        
        # Leer imagen
        image_data = await image.read()
        
        # Procesar imagen con LLM
        image_analysis = await llm_adapter.process_image(
            image_data=image_data,
            prompt=message,
            image_format=image.filename.split(".")[-1].lower()
        )
        
        # Combinar análisis de imagen con mensaje original
        combined_message = f"{message}\n\n[Análisis de imagen: {image_analysis}]"
        
        # Proceder como chat normal
        conv_id = conversation_id or str(uuid4())
        
        if conv_id not in conversations_db:
            conversations_db[conv_id] = {
                "id": conv_id,
                "user_id": user_id,
                "messages": []
            }
        
        conversations_db[conv_id]["messages"].append({
            "role": "user",
            "content": combined_message,
            "attachment_type": "image"
        })
        
        response = await llm_adapter.generate_response(
            messages=conversations_db[conv_id]["messages"],
            tools=get_tools_dict()
        )
        
        conversations_db[conv_id]["messages"].append({
            "role": "assistant",
            "content": response.text
        })
        
        return ChatResponse(
            conversation_id=conv_id,
            response=response.text
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/with-pdf")
async def chat_with_pdf(
    message: str = Form(...),
    pdf: UploadFile = File(...),
    conversation_id: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """Chat con soporte para PDF"""
    try:
        user_id = "user-123"  # Obtener del JWT
        
        # Leer PDF
        pdf_data = await pdf.read()
        
        # Procesar PDF con LLM
        pdf_analysis = await llm_adapter.process_document(
            document_data=pdf_data,
            document_type="pdf",
            prompt=message
        )
        
        # Combinar análisis de PDF con mensaje original
        combined_message = f"{message}\n\n[Análisis de documento: {pdf_analysis}]"
        
        # Proceder como chat normal
        conv_id = conversation_id or str(uuid4())
        
        if conv_id not in conversations_db:
            conversations_db[conv_id] = {
                "id": conv_id,
                "user_id": user_id,
                "messages": []
            }
        
        conversations_db[conv_id]["messages"].append({
            "role": "user",
            "content": combined_message,
            "attachment_type": "pdf"
        })
        
        response = await llm_adapter.generate_response(
            messages=conversations_db[conv_id]["messages"],
            tools=get_tools_dict()
        )
        
        conversations_db[conv_id]["messages"].append({
            "role": "assistant",
            "content": response.text
        })
        
        return ChatResponse(
            conversation_id=conv_id,
            response=response.text
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
