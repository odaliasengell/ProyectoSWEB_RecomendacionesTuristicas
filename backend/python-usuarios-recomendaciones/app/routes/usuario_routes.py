from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario_schema import UsuarioBase
from app.services import usuario_service

router = APIRouter()

@router.post("/", response_model=dict)
def crear_usuario(usuario: UsuarioBase, db: Session = Depends(get_db)):
    nuevo = usuario_service.registrar_usuario(db, usuario)
    return {"mensaje": "Usuario registrado", "data": nuevo}
