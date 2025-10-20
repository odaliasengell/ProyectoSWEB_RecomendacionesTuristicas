from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.models.administrador import Administrador
from app.services.admin_auth_service import AdminAuthService
from app.schemas.usuario_schema import UsuarioResponse
from typing import List

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/auth/token")
admin_auth_service = AdminAuthService()

async def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not admin_auth_service.verify_admin_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de administrador inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return True

@router.get("/users", response_model=List[UsuarioResponse])
async def get_all_users(db: Session = Depends(get_db), admin: bool = Depends(get_current_admin)):
    users = db.query(Usuario).all()
    return users

@router.get("/users/{user_id}", response_model=UsuarioResponse)
async def get_user(user_id: int, db: Session = Depends(get_db), admin: bool = Depends(get_current_admin)):
    user = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), admin: bool = Depends(get_current_admin)):
    user = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado exitosamente"}

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db), admin: bool = Depends(get_current_admin)):
    total_users = db.query(Usuario).count()
    total_admins = db.query(Administrador).count()
    
    return {
        "total_usuarios": total_users,
        "total_administradores": total_admins,
        "usuarios_activos": total_users  # Por ahora todos están activos
    }