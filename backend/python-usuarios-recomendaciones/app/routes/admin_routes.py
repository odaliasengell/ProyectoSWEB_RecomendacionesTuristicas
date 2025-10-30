from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.schemas.admin_schema import AdminLogin, AdminToken
from app.models.administrador import Administrador
from app.config.settings import settings
import bcrypt
import jwt
from datetime import datetime, timedelta

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/auth/token")

@router.post("/auth/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin):
    """Login de administrador con MongoDB"""
    try:
        # Buscar admin por username
        admin = await Administrador.find_one(Administrador.username == credentials.username)
        
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Verificar contraseña
        if not bcrypt.checkpw(credentials.contraseña.encode('utf-8'), admin.password.encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Crear token JWT con tipo admin
        token_data = {
            "sub": admin.username,
            "email": admin.email,
            "type": "admin",  # Importante: marcar como token de admin
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        }
        token = jwt.encode(token_data, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        
        # Actualizar último acceso
        admin.ultimo_acceso = datetime.now()
        await admin.save()
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "admin": {
                "username": admin.username,
                "email": admin.email,
                "nombre": admin.nombre
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en login: {str(e)}")

@router.post("/auth/token")
async def admin_login_form(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login alternativo usando OAuth2PasswordRequestForm"""
    return await admin_login(AdminLogin(username=form_data.username, contraseña=form_data.password))