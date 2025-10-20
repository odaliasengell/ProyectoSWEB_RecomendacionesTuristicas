import httpx
import asyncio
from typing import List, Dict, Any, Optional

class ExternalAPIService:
    """Servicio para consumir las APIs externas de Go y TypeScript"""
    
    def __init__(self):
        self.go_api_base = "http://localhost:8080"  # API Go
        self.ts_api_base = "http://localhost:3000"  # API TypeScript
        
    async def _make_request(self, method: str, url: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Hacer petición HTTP a APIs externas"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                if method.upper() == "GET":
                    response = await client.get(url)
                elif method.upper() == "POST":
                    response = await client.post(url, json=data)
                elif method.upper() == "PUT":
                    response = await client.put(url, json=data)
                elif method.upper() == "DELETE":
                    response = await client.delete(url)
                else:
                    raise ValueError(f"Método HTTP no soportado: {method}")
                
                response.raise_for_status()
                return response.json() if response.content else {}
        except httpx.RequestError as e:
            raise Exception(f"Error de conexión con API externa: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Error HTTP {e.response.status_code}: {e.response.text}")

    # ==================== SERVICIOS TURÍSTICOS (Go API) ====================
    async def get_servicios(self) -> List[Dict[str, Any]]:
        """Obtener todos los servicios turísticos de la API Go"""
        url = f"{self.go_api_base}/api/servicios"
        return await self._make_request("GET", url)
    
    async def get_servicio_by_id(self, servicio_id: int) -> Dict[str, Any]:
        """Obtener un servicio específico por ID"""
        url = f"{self.go_api_base}/api/servicios/{servicio_id}"
        return await self._make_request("GET", url)
    
    async def create_servicio(self, servicio_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crear un nuevo servicio turístico"""
        url = f"{self.go_api_base}/api/servicios"
        return await self._make_request("POST", url, servicio_data)
    
    async def update_servicio(self, servicio_id: int, servicio_data: Dict[str, Any]) -> Dict[str, Any]:
        """Actualizar un servicio turístico"""
        url = f"{self.go_api_base}/api/servicios/{servicio_id}"
        return await self._make_request("PUT", url, servicio_data)
    
    async def delete_servicio(self, servicio_id: int) -> bool:
        """Eliminar un servicio turístico"""
        url = f"{self.go_api_base}/api/servicios/{servicio_id}"
        try:
            await self._make_request("DELETE", url)
            return True
        except:
            return False

    # ==================== GUÍAS (TypeScript API) ====================
    async def get_guias(self) -> List[Dict[str, Any]]:
        """Obtener todas las guías de la API TypeScript"""
        url = f"{self.ts_api_base}/api/guias"
        return await self._make_request("GET", url)
    
    async def get_guia_by_id(self, guia_id: int) -> Dict[str, Any]:
        """Obtener una guía específica por ID"""
        url = f"{self.ts_api_base}/api/guias/{guia_id}"
        return await self._make_request("GET", url)
    
    async def create_guia(self, guia_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crear una nueva guía"""
        url = f"{self.ts_api_base}/api/guias"
        return await self._make_request("POST", url, guia_data)
    
    async def update_guia(self, guia_id: int, guia_data: Dict[str, Any]) -> Dict[str, Any]:
        """Actualizar una guía"""
        url = f"{self.ts_api_base}/api/guias/{guia_id}"
        return await self._make_request("PUT", url, guia_data)
    
    async def delete_guia(self, guia_id: int) -> bool:
        """Eliminar una guía"""
        url = f"{self.ts_api_base}/api/guias/{guia_id}"
        try:
            await self._make_request("DELETE", url)
            return True
        except:
            return False

    # ==================== TOURS (TypeScript API) ====================
    async def get_tours(self) -> List[Dict[str, Any]]:
        """Obtener todos los tours de la API TypeScript"""
        url = f"{self.ts_api_base}/api/tours"
        return await self._make_request("GET", url)
    
    async def get_tour_by_id(self, tour_id: int) -> Dict[str, Any]:
        """Obtener un tour específico por ID"""
        url = f"{self.ts_api_base}/api/tours/{tour_id}"
        return await self._make_request("GET", url)
    
    async def create_tour(self, tour_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crear un nuevo tour"""
        url = f"{self.ts_api_base}/api/tours"
        return await self._make_request("POST", url, tour_data)
    
    async def update_tour(self, tour_id: int, tour_data: Dict[str, Any]) -> Dict[str, Any]:
        """Actualizar un tour"""
        url = f"{self.ts_api_base}/api/tours/{tour_id}"
        return await self._make_request("PUT", url, tour_data)
    
    async def delete_tour(self, tour_id: int) -> bool:
        """Eliminar un tour"""
        url = f"{self.ts_api_base}/api/tours/{tour_id}"
        try:
            await self._make_request("DELETE", url)
            return True
        except:
            return False

# Instancia global del servicio
external_api_service = ExternalAPIService()