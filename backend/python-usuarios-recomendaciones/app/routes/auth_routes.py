from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.services.auth_service import AuthService
from app.schemas.usuario_schema import UsuarioCreate, UsuarioResponse
import httpx

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
auth_service = AuthService()

# URL del WebSocket server
WEBSOCKET_URL = "http://localhost:4001/notify"

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
        
        # Notificar al WebSocket sobre el nuevo usuario registrado
        try:
            print(f"🔔 Intentando notificar WebSocket en {WEBSOCKET_URL}")
            async with httpx.AsyncClient() as client:
                notification_payload = {
                    "event": "usuario_registrado",
                    "data": {
                        "id_usuario": str(new_user.id),
                        "nombre": new_user.nombre,
                        "apellido": new_user.apellido,
                        "email": new_user.email
                    },
                    "room": "dashboard"
                }
                print(f"📤 Payload de notificación: {notification_payload}")
                
                response = await client.post(
                    WEBSOCKET_URL,
                    json=notification_payload,
                    timeout=5.0
                )
                print(f"✅ Respuesta del WebSocket: {response.status_code} - {response.text}")
                print(f"✅ Notificación enviada: Usuario {new_user.nombre} {new_user.apellido} registrado")
        except Exception as notify_error:
            print(f"⚠️ Error al notificar WebSocket: {notify_error}")
            import traceback
            traceback.print_exc()
            # No lanzar error, solo registrar
        
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