"""
Tour Tool - Herramienta MCP para buscar tours
Autor: Odalis Senge
"""
from typing import Dict, Any
from .base_tool import BaseTool
import httpx


class TourTool(BaseTool):
    """Herramienta para buscar tours"""
    
    def __init__(self):
        super().__init__(
            name="search_tours",
            description="Buscar tours y actividades disponibles",
            parameters={
                "query": {
                    "type": "string",
                    "description": "Término de búsqueda para tours"
                },
                "limit": {
                    "type": "integer",
                    "description": "Número máximo de resultados",
                    "default": 5
                }
            }
        )
    
    async def execute(self, query: str = "", limit: int = 5, **kwargs) -> Dict[str, Any]:
        """Ejecutar búsqueda de tours"""
        
        # Intentar conectar con REST API
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "http://localhost:8000/tours",
                    params={"limit": limit},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    tours = response.json()
                    return {
                        "success": True,
                        "count": len(tours),
                        "tours": tours[:limit]
                    }
        except:
            pass
        
        # Datos mock
        mock_tours = [
            {
                "nombre": "Tour Galápagos 7 días",
                "duracion": "7 días / 6 noches",
                "precio": 2500,
                "incluye": ["Vuelos", "Hospedaje", "Guía", "Comidas"]
            },
            {
                "nombre": "City Tour Quito",
                "duracion": "1 día",
                "precio": 45,
                "incluye": ["Transporte", "Guía", "Entradas"]
            },
            {
                "nombre": "Aventura Amazónica",
                "duracion": "3 días / 2 noches",
                "precio": 350,
                "incluye": ["Transporte", "Lodge", "Actividades", "Comidas"]
            }
        ]
        
        if query:
            query_lower = query.lower()
            filtered = [
                t for t in mock_tours
                if query_lower in t["nombre"].lower()
            ]
        else:
            filtered = mock_tours
        
        return {
            "success": True,
            "count": len(filtered),
            "tours": filtered[:limit]
        }
