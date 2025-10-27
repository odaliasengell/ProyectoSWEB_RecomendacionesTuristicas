from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.services.auth_service import AuthService
from app.schemas.usuario_schema import UsuarioCreate, UsuarioResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
auth_service = AuthService()

@router.post("/register", response_model=UsuarioResponse)
async def register(usuario: UsuarioCreate):
    """Registrar nuevo usuario"""
    try:
        # Verificar si el email ya existe
        from app.models.usuario import Usuario
        existing_email = await Usuario.find_one(Usuario.email == usuario.email)
        if existing_email:
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        # Verificar si el username ya existe
        existing_username = await Usuario.find_one(Usuario.username == usuario.username)
        if existing_username:
            raise HTTPException(status_code=400, detail="El username ya está en uso")
        
        # Registrar usuario
        new_user = await auth_service.register_user(usuario)
        
        # Convertir a UsuarioResponse
        return UsuarioResponse(
            id=str(new_user.id),
            nombre=new_user.nombre,
            apellido=new_user.apellido,
            email=new_user.email,
            username=new_user.username,
            fecha_nacimiento=new_user.fecha_nacimiento,
            pais=new_user.pais,
            fecha_registro=new_user.fecha_registro
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en registro: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al registrar usuario: {str(e)}")

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}