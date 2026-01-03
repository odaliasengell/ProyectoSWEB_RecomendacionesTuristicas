"""
Rutas de MCP Tools
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from ..mcp_tools import ALL_TOOLS, get_tools_dict, get_tool_by_name

router = APIRouter()


@router.get("")
async def list_tools():
    """Listar todas las herramientas disponibles"""
    return {
        "tools": get_tools_dict(),
        "total": len(ALL_TOOLS)
    }


@router.get("/{tool_name}")
async def get_tool(tool_name: str):
    """Obtener detalles de una herramienta"""
    tool = get_tool_by_name(tool_name)
    if not tool:
        raise HTTPException(status_code=404, detail="Herramienta no encontrada")
    
    return tool.to_dict()


@router.post("/{tool_name}/execute")
async def execute_tool(
    tool_name: str,
    parameters: dict,
    authorization: Optional[str] = Header(None)
):
    """
    Ejecutar una herramienta directamente (uso avanzado)
    Normalmente las herramientas se ejecutan a través del chat
    """
    try:
        # TODO: Validar JWT y extraer user_id
        user_id = "user-123"
        is_admin = False  # Obtener del JWT
        
        tool = get_tool_by_name(tool_name)
        if not tool:
            raise HTTPException(status_code=404, detail="Herramienta no encontrada")
        
        # Validar permisos
        if tool.requires_admin() and not is_admin:
            raise HTTPException(status_code=403, detail="Permisos insuficientes")
        
        if tool.requires_auth() and not user_id:
            raise HTTPException(status_code=401, detail="No autenticado")
        
        # Ejecutar herramienta
        result = await tool.execute(
            user_id=user_id,
            is_admin=is_admin,
            **parameters
        )
        
        return {
            "tool": tool_name,
            "success": result.success,
            "data": result.data,
            "error": result.error
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
