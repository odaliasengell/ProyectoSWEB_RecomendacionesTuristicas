"""
Tool Routes - Gestión de herramientas MCP
Autor: Odalis Senge
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from ..tools.search_tool import SearchTool
from ..tools.booking_tool import BookingTool
from ..tools.weather_tool import WeatherTool

router = APIRouter()

# Instanciar herramientas
search_tool = SearchTool()
booking_tool = BookingTool()
weather_tool = WeatherTool()

# Registro de herramientas
AVAILABLE_TOOLS = {
    "search": search_tool,
    "booking": booking_tool,
    "weather": weather_tool
}


@router.get("/list")
async def list_tools():
    """
    Listar herramientas MCP disponibles
    """
    tools_info = []
    
    for name, tool in AVAILABLE_TOOLS.items():
        tools_info.append({
            "name": name,
            "description": tool.get_description(),
            "parameters": tool.get_parameters()
        })
    
    return {"tools": tools_info}


@router.post("/execute/{tool_name}")
async def execute_tool(tool_name: str, params: Dict[str, Any]):
    """
    Ejecutar una herramienta específica
    """
    if tool_name not in AVAILABLE_TOOLS:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found")
    
    tool = AVAILABLE_TOOLS[tool_name]
    
    try:
        result = await tool.execute(params)
        return {
            "tool": tool_name,
            "success": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing tool '{tool_name}': {str(e)}"
        )


@router.get("/{tool_name}/schema")
async def get_tool_schema(tool_name: str):
    """
    Obtener el schema de una herramienta
    """
    if tool_name not in AVAILABLE_TOOLS:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found")
    
    tool = AVAILABLE_TOOLS[tool_name]
    
    return {
        "name": tool_name,
        "description": tool.get_description(),
        "parameters": tool.get_parameters(),
        "examples": tool.get_examples()
    }
