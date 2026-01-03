"""
Interfaz abstracta para LLM Providers (Strategy Pattern)
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from dataclasses import dataclass


@dataclass
class ToolCall:
    """Llamada a herramienta del LLM"""
    tool_name: str
    parameters: Dict[str, Any]
    description: str = ""


@dataclass
class LLMResponse:
    """Respuesta del LLM"""
    text: str
    tool_calls: List[ToolCall] = None
    stop_reason: str = "end_turn"  # "end_turn", "tool_use", etc.
    tokens_used: int = 0


class LLMProvider(ABC):
    """Interfaz abstracta para proveedores de LLM"""

    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict],
        tools: List[Dict] = None,
        context: Dict = None
    ) -> LLMResponse:
        """
        Generar respuesta del LLM
        
        Args:
            messages: Historial de mensajes [{role, content}, ...]
            tools: Definición de MCP Tools disponibles
            context: Contexto adicional (permisos, variables, etc.)
        """
        pass

    @abstractmethod
    async def chat_completion(
        self,
        message: str,
        conversation_history: List[Dict] = None
    ) -> str:
        """Chat simple sin tools"""
        pass

    @abstractmethod
    async def process_image(
        self,
        image_data: bytes,
        prompt: str,
        image_format: str = "jpeg"
    ) -> str:
        """Procesar imagen con el modelo (OCR, análisis)"""
        pass

    @abstractmethod
    async def process_document(
        self,
        document_data: bytes,
        document_type: str,
        prompt: str
    ) -> str:
        """Procesar documento (PDF) y extraer información"""
        pass
