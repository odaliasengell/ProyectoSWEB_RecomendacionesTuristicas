"""
Base para MCP Tools
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from dataclasses import dataclass


@dataclass
class ToolResult:
    """Resultado de ejecución de tool"""
    success: bool
    data: Any = None
    error: Optional[str] = None


class MCPTool(ABC):
    """Base class para MCP Tools"""

    @property
    @abstractmethod
    def name(self) -> str:
        """Nombre de la herramienta"""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Descripción de la herramienta"""
        pass

    @property
    @abstractmethod
    def parameters(self) -> Dict:
        """Parámetros que acepta la herramienta"""
        pass

    @abstractmethod
    async def execute(self, **kwargs) -> ToolResult:
        """Ejecutar la herramienta"""
        pass

    def to_dict(self) -> Dict:
        """Convertir a diccionario para enviar a LLM"""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters
        }

    def requires_auth(self) -> bool:
        """Si la herramienta requiere autenticación"""
        return True

    def requires_admin(self) -> bool:
        """Si la herramienta requiere permisos de admin"""
        return False
