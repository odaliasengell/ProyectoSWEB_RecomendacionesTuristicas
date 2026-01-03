"""
MCP Tools de Reporte
"""
import aiohttp
from typing import Dict, Any
from config import REST_API_URL
from .base_tool import MCPTool, ToolResult
from datetime import datetime


class ResumenVentasDiariasTool(MCPTool):
    """Tool para obtener resumen de ventas del día"""

    @property
    def name(self) -> str:
        return "resumen_ventas_diarias"

    @property
    def description(self) -> str:
        return "Obtener resumen de ventas y reservas del día (requiere permisos de admin)"

    @property
    def parameters(self) -> Dict:
        return {
            "type": "object",
            "properties": {
                "fecha": {
                    "type": "string",
                    "description": "Fecha a consultar (formato: YYYY-MM-DD, default: hoy)"
                },
                "grupo_por": {
                    "type": "string",
                    "enum": ["tour", "tipo_usuario", "metodo_pago"],
                    "description": "Agrupar resultados por este campo"
                }
            },
            "required": []
        }

    async def execute(self, user_id: str = None, is_admin: bool = False, **kwargs) -> ToolResult:
        """Obtener resumen de ventas"""
        if not is_admin:
            return ToolResult(
                success=False,
                error="Permisos insuficientes. Solo admin puede ver reportes"
            )

        try:
            fecha = kwargs.get("fecha", datetime.now().strftime("%Y-%m-%d"))
            grupo_por = kwargs.get("grupo_por", "tour")
            
            async with aiohttp.ClientSession() as session:
                params = {
                    "fecha": fecha,
                    "grupo_por": grupo_por
                }
                
                async with session.get(
                    f"{REST_API_URL}/reportes/ventas-diarias",
                    params=params
                ) as resp:
                    if resp.status == 200:
                        reporte = await resp.json()
                        return ToolResult(
                            success=True,
                            data=reporte
                        )
                    else:
                        error = await resp.text()
                        return ToolResult(
                            success=False,
                            error=f"Error obteniendo reporte: {error}"
                        )
        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e)
            )

    def requires_admin(self) -> bool:
        return True


# Instancia global
resumen_ventas_diarias_tool = ResumenVentasDiariasTool()

# Lista de tools de reporte
REPORT_TOOLS = [resumen_ventas_diarias_tool]
