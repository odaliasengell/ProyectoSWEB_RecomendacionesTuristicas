"""
Base para MCP Tools
Autor: Odalis Senge
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseTool(ABC):
    """Clase base para herramientas MCP"""
    
    @abstractmethod
    def get_schema(self) -> Dict[str, Any]:
        """
        Obtener esquema de la herramienta para el LLM
        
        Returns:
            Schema en formato de function calling
        """
        pass
    
    @abstractmethod
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Ejecutar la herramienta
        
        Args:
            **kwargs: Parámetros de la herramienta
        
        Returns:
            Resultado de la ejecución
        """
        pass
    
    def get_name(self) -> str:
        """Obtener nombre de la herramienta"""
        return self.__class__.__name__.lower()
