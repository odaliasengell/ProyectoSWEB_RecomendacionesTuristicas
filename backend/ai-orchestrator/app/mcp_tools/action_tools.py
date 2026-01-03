"""
MCP Tools de Acción
"""
import aiohttp
from typing import Dict, Any
from config import REST_API_URL, AUTH_SERVICE_URL
from .base_tool import MCPTool, ToolResult
import json


class CrearReservaTool(MCPTool):
    """Tool para crear una nueva reserva"""

    @property
    def name(self) -> str:
        return "crear_reserva"

    @property
    def description(self) -> str:
        return "Crear una nueva reserva de tour (requiere autenticación)"

    @property
    def parameters(self) -> Dict:
        return {
            "type": "object",
            "properties": {
                "tour_id": {
                    "type": "string",
                    "description": "ID del tour a reservar"
                },
                "fecha_inicio": {
                    "type": "string",
                    "description": "Fecha de inicio (formato: YYYY-MM-DD)"
                },
                "cantidad_personas": {
                    "type": "integer",
                    "description": "Número de personas"
                },
                "notas": {
                    "type": "string",
                    "description": "Notas especiales (opcional)"
                }
            },
            "required": ["tour_id", "fecha_inicio"]
        }

    async def execute(self, user_id: str = None, **kwargs) -> ToolResult:
        """Crear reserva"""
        if not user_id:
            return ToolResult(
                success=False,
                error="Usuario no autenticado"
            )

        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "user_id": user_id,
                    "tour_id": kwargs.get("tour_id"),
                    "fecha_inicio": kwargs.get("fecha_inicio"),
                    "cantidad_personas": kwargs.get("cantidad_personas", 1),
                    "notas": kwargs.get("notas", "")
                }
                
                async with session.post(
                    f"{REST_API_URL}/reservas",
                    json=payload
                ) as resp:
                    if resp.status == 201:
                        reserva = await resp.json()
                        return ToolResult(
                            success=True,
                            data=reserva
                        )
                    else:
                        error = await resp.text()
                        return ToolResult(
                            success=False,
                            error=f"Error creando reserva: {error}"
                        )
        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e)
            )


class ProcesarPagoTool(MCPTool):
    """Tool para procesar pago de una reserva"""

    @property
    def name(self) -> str:
        return "procesar_pago"

    @property
    def description(self) -> str:
        return "Procesar pago para una reserva existente"

    @property
    def parameters(self) -> Dict:
        return {
            "type": "object",
            "properties": {
                "reserva_id": {
                    "type": "string",
                    "description": "ID de la reserva a pagar"
                },
                "metodo_pago": {
                    "type": "string",
                    "enum": ["tarjeta", "transferencia", "paypal"],
                    "description": "Método de pago"
                }
            },
            "required": ["reserva_id", "metodo_pago"]
        }

    async def execute(self, user_id: str = None, **kwargs) -> ToolResult:
        """Procesar pago"""
        if not user_id:
            return ToolResult(
                success=False,
                error="Usuario no autenticado"
            )

        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "reserva_id": kwargs.get("reserva_id"),
                    "metodo_pago": kwargs.get("metodo_pago"),
                    "user_id": user_id
                }
                
                async with session.post(
                    f"{REST_API_URL}/pagos/procesar",
                    json=payload
                ) as resp:
                    if resp.status == 200:
                        pago = await resp.json()
                        return ToolResult(
                            success=True,
                            data=pago
                        )
                    else:
                        error = await resp.text()
                        return ToolResult(
                            success=False,
                            error=f"Error procesando pago: {error}"
                        )
        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e)
            )


# Instancias globales
crear_reserva_tool = CrearReservaTool()
procesar_pago_tool = ProcesarPagoTool()

# Lista de tools de acción
ACTION_TOOLS = [crear_reserva_tool, procesar_pago_tool]
