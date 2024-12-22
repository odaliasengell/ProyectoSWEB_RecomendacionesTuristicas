"""
Interface abstracta para LLM Providers
Patrón Strategy para intercambiar proveedores de IA
Autor: Odalis Senge
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class LLMProvider(ABC):
    """Interface Strategy para proveedores de LLM"""
    
    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Generar respuesta del modelo
        
        Args:
            messages: Historial de mensajes
            tools: Herramientas disponibles para el modelo
            temperature: Creatividad del modelo (0-1)
        
        Returns:
            Respuesta del modelo con posibles tool calls
        """
        pass
    
    @abstractmethod
    async def process_multimodal_input(
        self,
        text: str,
        image_data: Optional[bytes] = None,
        pdf_data: Optional[bytes] = None
    ) -> str:
        """
        Procesar entrada multimodal
        
        Args:
            text: Texto del usuario
            image_data: Datos de imagen (opcional)
            pdf_data: Datos de PDF (opcional)
        
        Returns:
            Respuesta procesada
        """
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Obtener nombre del proveedor"""
        pass
