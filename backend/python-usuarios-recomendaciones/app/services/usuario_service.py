from sqlalchemy.orm import Session
from app.repositories import usuario_repo
from app.schemas.usuario_schema import UsuarioBase

def registrar_usuario(db: Session, data: UsuarioBase):
    return usuario_repo.crear_usuario(db, data)

def listar_usuarios(db: Session):
    return usuario_repo.obtener_usuarios(db)
