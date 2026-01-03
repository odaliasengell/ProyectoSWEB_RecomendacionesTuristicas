"""
__init__.py - Exportar MCP Tools
"""
from .base_tool import MCPTool, ToolResult
from .query_tools import QUERY_TOOLS, buscar_tours_tool, obtener_reservas_usuario_tool
from .action_tools import ACTION_TOOLS, crear_reserva_tool, procesar_pago_tool
from .report_tools import REPORT_TOOLS, resumen_ventas_diarias_tool

# Todas las tools disponibles
ALL_TOOLS = QUERY_TOOLS + ACTION_TOOLS + REPORT_TOOLS

def get_tools_dict():
    """Obtener tools en formato dict para enviar a LLM"""
    return [tool.to_dict() for tool in ALL_TOOLS]

def get_tool_by_name(tool_name: str) -> MCPTool:
    """Obtener tool por nombre"""
    for tool in ALL_TOOLS:
        if tool.name == tool_name:
            return tool
    return None

__all__ = [
    "MCPTool",
    "ToolResult",
    "ALL_TOOLS",
    "QUERY_TOOLS",
    "ACTION_TOOLS",
    "REPORT_TOOLS",
    "get_tools_dict",
    "get_tool_by_name",
]
