"""
Rutas REST para Usuarios.
Usan los controladores implementados en `res_api.controllers` y los helpers genéricos.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.usuario_model import Usuario
from ... import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/", response_model=List[Usuario])
async def list_usuarios():
    return await api_controllers.listar_usuarios()


@router.get("/{id}", response_model=Usuario)
async def get_usuario(id: str):
    usuario = await api_controllers.obtener_usuario_por_id(id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.post("/", response_model=Usuario)
async def create_usuario(payload: dict):
    return await api_controllers.crear_usuario(payload)


@router.put("/{id}", response_model=Usuario)
async def update_usuario(id: str, payload: dict):
    updated = await base_update(Usuario, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return updated


@router.delete("/{id}")
async def delete_usuario(id: str):
    ok = await base_delete(Usuario, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"ok": True}
