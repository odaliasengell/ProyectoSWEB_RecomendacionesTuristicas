"""
Rutas (APIRouter) que exponen las interfaces definidas en `schemas.py`.
Estos endpoints son ejemplos y no conectan con la aplicación principal ni con la base de datos.
"""
from fastapi import APIRouter
from . import schemas, controllers

router = APIRouter(prefix="/res_api", tags=["res_api"])


@router.get("/usuarios", response_model=list[schemas.Usuario])
async def get_usuarios():
    """Lista de usuarios (ejemplo, sin datos reales)."""
    return await controllers.listar_usuarios()


@router.get("/destinos", response_model=list[schemas.Destino])
async def get_destinos():
    return await controllers.listar_destinos()


@router.get("/tours", response_model=list[schemas.Tour])
async def get_tours():
    return await controllers.obtener_tours()

# Nota: estos routers están listos para ser incluidos en la app FastAPI principal con
# `from backend.res_api import router as res_api_router; app.include_router(res_api_router)`
# pero, según la instrucción, no se modifica la configuración global en este paso.
