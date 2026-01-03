"""
MCP Tools de Consulta
"""
import aiohttp
from typing import Dict, Any
from config import REST_API_URL
from .base_tool import MCPTool, ToolResult


class BuscarToursTooll(MCPTool):
    """Tool para buscar tours disponibles"""

    @property
    def name(self) -> str:
        return "buscar_tours"

    @property
    def description(self) -> str:
        return "Buscar tours disponibles por destino, fecha o rango de precio"

    @property
    def parameters(self) -> Dict:
        return {
            "type": "object",
            "properties": {
                "destino": {
                    "type": "string",
                    "description": "Nombre del destino a buscar (ej: Galápagos, Amazonía)"
                },
                "fecha_inicio": {
                    "type": "string",
                    "description": "Fecha mínima de salida (formato: YYYY-MM-DD)"
                },
                "fecha_fin": {
                    "type": "string",
                    "description": "Fecha máxima de salida (formato: YYYY-MM-DD)"
                },
                "precio_maximo": {
                    "type": "number",
                    "description": "Precio máximo del tour en USD"
                },
                "limite": {
                    "type": "integer",
                    "description": "Máximo número de resultados (default: 10)"
                }
            },
            "required": []
        }

    async def execute(self, **kwargs) -> ToolResult:
        """Ejecutar búsqueda de tours"""
        try:
            async with aiohttp.ClientSession() as session:
                # Construir query params
                params = {}
                if "destino" in kwargs:
                    params["destino"] = kwargs["destino"]
                if "precio_maximo" in kwargs:
                    params["precio_maximo"] = kwargs["precio_maximo"]
                if "limite" in kwargs:
                    params["limite"] = kwargs["limite"]
                
                # Llamar REST API
                async with session.get(
                    f"{REST_API_URL}/tours",
                    params=params
                ) as resp:
                    if resp.status == 200:
                        tours = await resp.json()
                        return ToolResult(
                            success=True,
                            data=tours.get("tours", [])
                        )
                    else:
                        return ToolResult(
                            success=False,
                            error=f"Error del API: {resp.status}"
                        )
        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e)
            )


class ObtenerReservasUsuarioTool(MCPTool):
    """Tool para obtener reservas del usuario autenticado"""

    @property
    def name(self) -> str:
        return "obtener_reservas_usuario"

    @property
    def description(self) -> str:
        return "Obtener mis reservas de tours (requiere autenticación)"

    @property
    def parameters(self) -> Dict:
        return {
            "type": "object",
            "properties": {
                "estado": {
                    "type": "string",
                    "enum": ["pending", "confirmed", "cancelled"],
                    "description": "Filtrar por estado de reserva"
                },
                "limite": {
                    "type": "integer",
                    "description": "Máximo número de resultados (default: 10)"
                }
            },
            "required": []
        }

    async def execute(self, user_id: str = None, **kwargs) -> ToolResult:
        """Obtener reservas del usuario"""
        if not user_id:
            return ToolResult(
                success=False,
                error="Usuario no autenticado"
            )

        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "user_id": user_id
                }
                if "estado" in kwargs:
                    params["estado"] = kwargs["estado"]
                if "limite" in kwargs:
                    params["limite"] = kwargs["limite"]
                
                async with session.get(
                    f"{REST_API_URL}/reservas",
                    params=params
                ) as resp:
                    if resp.status == 200:
                        reservas = await resp.json()
                        return ToolResult(
                            success=True,
                            data=reservas.get("reservas", [])
                        )
                    else:
                        return ToolResult(
                            success=False,
                            error=f"Error del API: {resp.status}"
                        )
        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e)
            )


# Instancias globales
buscar_tours_tool = BuscarToursTooll()
obtener_reservas_usuario_tool = ObtenerReservasUsuarioTool()

# Lista de tools de consulta
QUERY_TOOLS = [buscar_tours_tool, obtener_reservas_usuario_tool]
