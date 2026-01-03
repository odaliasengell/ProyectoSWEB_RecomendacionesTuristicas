"""
Rutas Admin
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional

router = APIRouter()


@router.get("/logs")
async def get_logs(
    limit: int = 100,
    authorization: Optional[str] = Header(None)
):
    """Ver logs de ejecución (solo admin)"""
    try:
        # TODO: Validar JWT y permisos de admin
        # TODO: Obtener logs de MongoDB o archivo de logs
        return {
            "logs": [],
            "total": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def list_models():
    """Obtener proveedores de IA disponibles"""
    return {
        "providers": [
            {
                "name": "gemini",
                "description": "Google Gemini",
                "available": True
            },
            {
                "name": "openai",
                "description": "OpenAI ChatGPT / GPT-4",
                "available": True
            }
        ]
    }


@router.get("/health")
async def health():
    """Estado del servicio"""
    return {
        "status": "healthy",
        "service": "ai-orchestrator",
        "components": {
            "llm_adapter": "connected",
            "mcp_tools": "loaded",
            "database": "connected"
        }
    }
