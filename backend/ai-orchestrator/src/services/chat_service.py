"""
Chat Service - Lógica principal del chatbot
Autor: Odalis Senge
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid

from ..adapters.llm_provider import LLMProvider
from ..adapters.gemini_adapter import GeminiAdapter
from ..tools.destination_tool import DestinationTool
from ..tools.tour_tool import TourTool
from ..tools.weather_tool import WeatherTool


class ChatService:
    """Servicio principal de chat con MCP"""
    
    def __init__(self, db):
        self.db = db
        self.conversations_collection = db.conversations
        self.llm: Optional[LLMProvider] = None
        self.tools = {}
    
    async def initialize(self):
        """Inicializar LLM y herramientas"""
        # Inicializar LLM
        self.llm = GeminiAdapter()
        
        # Registrar herramientas MCP
        self.tools = {
            "search_destinations": DestinationTool(),
            "search_tours": TourTool(),
            "get_weather": WeatherTool()
        }
    
    async def process_message(
        self,
        user_id: str,
        message: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Procesar mensaje del usuario"""
        
        # Crear o recuperar sesión
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Obtener historial
        history = await self.get_conversation_history(session_id)
        
        # Agregar mensaje del usuario
        user_message = {
            "role": "user",
            "content": message,
            "timestamp": datetime.utcnow()
        }
        
        # Generar respuesta con LLM
        context = self._build_context(history)
        llm_response = await self.llm.generate(
            prompt=message,
            context=context,
            tools=list(self.tools.keys())
        )
        
        # Ejecutar herramientas si es necesario
        tool_results = []
        if llm_response.get("tool_calls"):
            tool_results = await self._execute_tools(
                llm_response["tool_calls"]
            )
        
        # Preparar respuesta final
        assistant_message = {
            "role": "assistant",
            "content": llm_response["content"],
            "timestamp": datetime.utcnow(),
            "tool_calls": llm_response.get("tool_calls")
        }
        
        # Guardar conversación
        await self._save_conversation(
            session_id,
            user_id,
            user_message,
            assistant_message
        )
        
        # Generar sugerencias
        suggestions = self._generate_suggestions(llm_response["content"])
        
        return {
            "session_id": session_id,
            "message": llm_response["content"],
            "tool_calls": tool_results,
            "suggestions": suggestions,
            "timestamp": datetime.utcnow()
        }
    
    async def get_conversation_history(
        self,
        session_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Obtener historial de conversación"""
        conversation = await self.conversations_collection.find_one(
            {"session_id": session_id}
        )
        
        if not conversation:
            return []
        
        messages = conversation.get("messages", [])
        return messages[-limit:]
    
    async def clear_session(self, session_id: str):
        """Limpiar sesión de conversación"""
        await self.conversations_collection.delete_one(
            {"session_id": session_id}
        )
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Obtener lista de herramientas disponibles"""
        return [
            {
                "name": name,
                "description": tool.description,
                "parameters": tool.parameters
            }
            for name, tool in self.tools.items()
        ]
    
    async def _execute_tools(
        self,
        tool_calls: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Ejecutar llamadas a herramientas"""
        results = []
        
        for call in tool_calls:
            tool_name = call.get("name")
            parameters = call.get("parameters", {})
            
            if tool_name in self.tools:
                tool = self.tools[tool_name]
                result = await tool.execute(**parameters)
                results.append({
                    "tool": tool_name,
                    "result": result
                })
        
        return results
    
    def _build_context(self, history: List[Dict]) -> str:
        """Construir contexto para el LLM"""
        context_parts = []
        for msg in history:
            role = msg["role"]
            content = msg["content"]
            context_parts.append(f"{role}: {content}")
        
        return "\n".join(context_parts)
    
    def _generate_suggestions(self, response: str) -> List[str]:
        """Generar sugerencias de seguimiento"""
        # Sugerencias predefinidas según el contexto
        suggestions = [
            "¿Qué otros destinos recomiendas?",
            "Muéstrame tours disponibles",
            "¿Cómo está el clima?",
            "¿Cuáles son los precios?"
        ]
        return suggestions[:3]
    
    async def _save_conversation(
        self,
        session_id: str,
        user_id: str,
        user_message: Dict,
        assistant_message: Dict
    ):
        """Guardar mensajes en la conversación"""
        await self.conversations_collection.update_one(
            {"session_id": session_id},
            {
                "$setOnInsert": {
                    "user_id": user_id,
                    "created_at": datetime.utcnow()
                },
                "$push": {
                    "messages": {
                        "$each": [user_message, assistant_message]
                    }
                },
                "$set": {
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
