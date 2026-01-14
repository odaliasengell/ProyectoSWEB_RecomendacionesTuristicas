"""
Destination Tool - Herramienta MCP para buscar destinos
Autor: Odalis Senge
"""
from typing import Dict, Any, List
from .base_tool import BaseTool
import httpx


class DestinationTool(BaseTool):
    """Herramienta para buscar destinos turísticos"""
    
    def get_schema(self) -> Dict[str, Any]:
        """Obtener esquema de la herramienta"""
        return {
            "name": "search_destinations",
            "description": "Buscar destinos turísticos en Ecuador",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Término de búsqueda para destinos"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Número máximo de resultados",
                        "default": 5
                    }
                },
                "required": []
            }
        }
    
    async def execute(self, query: str = "", limit: int = 5, **kwargs) -> Dict[str, Any]:
        """Ejecutar búsqueda de destinos"""
        
        # Conectar con REST API
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "http://localhost:8000/destinos",
                    params={"limit": limit},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    destinos = response.json()
                    return {
                        "success": True,
                        "count": len(destinos),
                        "destinations": destinos[:limit]
                    }
        except Exception as e:
            # Fallback con datos mock
            pass
        
        # Datos mock si la API no está disponible
        mock_destinos = [
            {
                "nombre": "Islas Galápagos",
                "descripcion": "Archipiélago único con fauna endémica",
                "tipo": "Natural",
                "precio_desde": 1200
            },
            {
                "nombre": "Quito Colonial",
                "descripcion": "Ciudad histórica patrimonio de la humanidad",
                "tipo": "Cultural",
                "precio_desde": 50
            },
            {
                "nombre": "Amazonía Ecuatoriana",
                "descripcion": "Selva tropical biodiversa",
                "tipo": "Aventura",
                "precio_desde": 300
            }
        ]
        
        # Filtrar por query
        if query:
            query_lower = query.lower()
            filtered = [
                d for d in mock_destinos
                if query_lower in d["nombre"].lower() or query_lower in d["descripcion"].lower()
            ]
        else:
            filtered = mock_destinos
        
        return {
            "success": True,
            "count": len(filtered),
            "destinations": filtered[:limit]
        }
