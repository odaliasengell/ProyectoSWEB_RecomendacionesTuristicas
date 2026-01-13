"""
Search Tool - Herramienta MCP para búsqueda de tours y destinos
Autor: Odalis Senge
"""
from typing import Dict, Any, List
import httpx
import os

from .base_tool import BaseTool


class SearchTool(BaseTool):
    """Herramienta para buscar tours y destinos"""
    
    def __init__(self):
        super().__init__()
        self.rest_api_url = os.getenv("REST_API_URL", "http://localhost:8000")
    
    def get_name(self) -> str:
        return "search"
    
    def get_description(self) -> str:
        return "Busca tours, destinos y servicios turísticos en la base de datos"
    
    def get_parameters(self) -> Dict[str, Any]:
        return {
            "query": {
                "type": "string",
                "description": "Término de búsqueda",
                "required": True
            },
            "limit": {
                "type": "integer",
                "description": "Número máximo de resultados",
                "default": 5
            },
            "type": {
                "type": "string",
                "description": "Tipo de búsqueda: tours, destinos, all",
                "default": "all"
            }
        }
    
    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecutar búsqueda
        """
        query = params.get("query", "")
        limit = params.get("limit", 5)
        search_type = params.get("type", "all")
        
        results = {
            "tours": [],
            "destinos": []
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Buscar tours
                if search_type in ["tours", "all"]:
                    tours_response = await client.get(
                        f"{self.rest_api_url}/tours",
                        params={"limit": limit}
                    )
                    if tours_response.status_code == 200:
                        all_tours = tours_response.json()
                        # Filtrar por query
                        results["tours"] = [
                            tour for tour in all_tours
                            if query.lower() in tour.get("nombre", "").lower() or
                               query.lower() in tour.get("descripcion", "").lower()
                        ][:limit]
                
                # Buscar destinos
                if search_type in ["destinos", "all"]:
                    destinos_response = await client.get(
                        f"{self.rest_api_url}/destinos",
                        params={"limit": limit}
                    )
                    if destinos_response.status_code == 200:
                        all_destinos = destinos_response.json()
                        # Filtrar por query
                        results["destinos"] = [
                            destino for destino in all_destinos
                            if query.lower() in destino.get("nombre", "").lower() or
                               query.lower() in destino.get("descripcion", "").lower()
                        ][:limit]
        
        except Exception as e:
            # En caso de error, devolver resultados simulados
            results = self._get_mock_results(query, limit)
        
        return {
            "query": query,
            "total_results": len(results["tours"]) + len(results["destinos"]),
            "results": results
        }
    
    def _get_mock_results(self, query: str, limit: int) -> Dict[str, List]:
        """
        Resultados simulados para desarrollo
        """
        mock_tours = [
            {
                "id": "tour-001",
                "nombre": "Tour Galápagos Completo",
                "descripcion": "Explora las islas Galápagos en 7 días",
                "precio": 1500.00,
                "duracion": "7 días"
            },
            {
                "id": "tour-002",
                "nombre": "Aventura en la Amazonía",
                "descripcion": "Descubre la selva amazónica ecuatoriana",
                "precio": 800.00,
                "duracion": "4 días"
            },
            {
                "id": "tour-003",
                "nombre": "Quito Colonial",
                "descripcion": "Recorrido por el centro histórico de Quito",
                "precio": 50.00,
                "duracion": "1 día"
            }
        ]
        
        mock_destinos = [
            {
                "id": "dest-001",
                "nombre": "Islas Galápagos",
                "descripcion": "Archipiélago único con fauna endémica",
                "categoria": "natural"
            },
            {
                "id": "dest-002",
                "nombre": "Montañita",
                "descripcion": "Playa y surf en la costa ecuatoriana",
                "categoria": "playa"
            }
        ]
        
        # Filtrar por query
        tours = [t for t in mock_tours if query.lower() in t["nombre"].lower()][:limit]
        destinos = [d for d in mock_destinos if query.lower() in d["nombre"].lower()][:limit]
        
        return {"tours": tours, "destinos": destinos}
    
    def get_examples(self) -> List[Dict[str, Any]]:
        return [
            {
                "description": "Buscar tours en Galápagos",
                "params": {"query": "Galápagos", "limit": 3}
            },
            {
                "description": "Buscar destinos de playa",
                "params": {"query": "playa", "type": "destinos"}
            }
        ]
