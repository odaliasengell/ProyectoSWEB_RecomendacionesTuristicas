"""
API de Autenticación y Recomendaciones Turísticas
Usa SQLite para desarrollo local - Sin PostgreSQL/MySQL
"""
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import hashlib

# ============================================================
# CONFIGURACIÓN DE BASE DE DATOS
# ============================================================
DATABASE_URL = "sqlite:///./recomendaciones_dev.db"
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============================================================
# MODELOS DE BASE DE DATOS
# ============================================================
class Usuario(Base):
    """Modelo de Usuario para autenticación"""
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    contraseña = Column(String, nullable=False)
    pais = Column(String, nullable=True)

# Crear tablas
Base.metadata.create_all(bind=engine)

# ============================================================
# MODELOS PYDANTIC (Validación)
# ============================================================
class RegisterRequest(BaseModel):
    """Esquema para registro de usuario"""
    nombre: str
    email: str
    contraseña: str
    pais: str

class LoginRequest(BaseModel):
    """Esquema para login"""
    email: str
    contraseña: str

# ============================================================
# DEPENDENCIAS
# ============================================================
def get_db():
    """Dependencia para obtener sesión de BD"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI app
app = FastAPI(
    title="Test CORS API",
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allow_headers=["*"],
        )
    ]
)

# Manejador de validación - Debe ir DESPUÉS de crear la app
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Manejar errores de validación de Pydantic"""
    print(f"[VALIDATION ERROR] Path: {request.url.path}")
    print(f"[VALIDATION ERROR] Errors: {exc.errors()}")
    
    # Devolver el error por defecto de FastAPI pero con más contexto
    return JSONResponse(
        status_code=422,
        content={
            "detail": [
                {
                    "loc": error.get("loc"),
                    "msg": error.get("msg"),
                    "type": error.get("type")
                }
                for error in exc.errors()
            ]
        }
    )

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Servidor funcionando correctamente"}

@app.post("/debug/test-login")
async def test_login(email: str = "", contraseña: str = ""):
    """Endpoint de prueba para debug"""
    return {
        "received": {
            "email": email,
            "contraseña": contraseña
        }
    }

@app.post("/auth/register")
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Endpoint de registro de usuario"""
    try:
        # Hash de contraseña
        hashed_pw = hashlib.sha256(data.contraseña.encode()).hexdigest()
        
        # Crear usuario
        nuevo_usuario = Usuario(
            nombre=data.nombre,
            email=data.email,
            contraseña=hashed_pw,
            pais=data.pais
        )
        
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
        
        print(f"[OK] Usuario registrado: {data.email}")
        
        return {
            "status": "success",
            "message": "Usuario registrado exitosamente",
            "data": {
                "id_usuario": nuevo_usuario.id_usuario,
                "nombre": nuevo_usuario.nombre,
                "email": nuevo_usuario.email,
                "pais": nuevo_usuario.pais
            }
        }
    except ValueError as e:
        if "UNIQUE constraint failed" in str(e):
            return {
                "status": "error",
                "message": "El email ya está registrado",
                "code": "EMAIL_EXISTS"
            }
        return {"status": "error", "message": str(e), "code": "VALIDATION_ERROR"}
    except Exception as e:
        print(f"[ERROR] Error al registrar: {e}")
        return {"status": "error", "message": str(e), "code": "SERVER_ERROR"}

@app.options("/{path:path}")
async def handle_options(path: str):
    return {"message": "OK"}

@app.post("/test-raw")
async def test_raw(request: Request):
    """Endpoint de prueba puro para ver qué recibe"""
    try:
        body = await request.json()
        print(f"[DEBUG TEST-RAW] Body: {body}")
        return {"received": body, "status": "ok"}
    except Exception as e:
        print(f"[ERROR TEST-RAW] {e}")
        return {"error": str(e), "status": "error"}

@app.post("/auth/login")
async def login_v2(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint de login alternativo - Acepta request raw
    Usar este si /auth/token no funciona
    """
    try:
        body = await request.json()
        email = body.get("email")
        contraseña = body.get("contraseña")
        
        print(f"[DEBUG V2] Login: email={email}")
        
        if not email or not contraseña:
            return {"status": "error", "message": "Missing email or password"}
        
        # Hash
        hashed_pw = hashlib.sha256(contraseña.encode()).hexdigest()
        
        # Query
        usuario = db.query(Usuario).filter(
            Usuario.email == email,
            Usuario.contraseña == hashed_pw
        ).first()
        
        if not usuario:
            return {"status": "error", "message": "Invalid credentials"}
        
        token = f"token_{usuario.id_usuario}_{hashlib.sha256(f'{usuario.email}{usuario.id_usuario}'.encode()).hexdigest()[:16]}"
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id_usuario": usuario.id_usuario,
                "nombre": usuario.nombre,
                "email": usuario.email,
                "pais": usuario.pais
            }
        }
    except Exception as e:
        print(f"[ERROR V2 LOGIN] {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
async def login(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint de login - Versión flexible que acepta JSON raw
    """
    try:
        # Leer el JSON directamente de la petición
        body = await request.json()
        email = body.get("email")
        contraseña = body.get("contraseña")
        
        print(f"[DEBUG] Login request raw: email={email}, contraseña={contraseña}")
        
        if not email or not contraseña:
            return {
                "detail": [
                    {"loc": ["body", "email"], "msg": "Email required"} if not email else {},
                    {"loc": ["body", "contraseña"], "msg": "Password required"} if not contraseña else {}
                ]
            }
        
        # Hash de contraseña enviada
        hashed_pw = hashlib.sha256(contraseña.encode()).hexdigest()
        
        # Buscar usuario
        usuario = db.query(Usuario).filter(
            Usuario.email == email,
            Usuario.contraseña == hashed_pw
        ).first()
        
        if not usuario:
            print(f"[WARN] Intento de login fallido: {email}")
            return {
                "status": "error",
                "message": "Email o contraseña incorrectos",
                "code": "INVALID_CREDENTIALS"
            }
        
        print(f"[OK] Login exitoso: {email}")
        
        # Generar token simple (en producción usar JWT real)
        token = f"token_{usuario.id_usuario}_{hashlib.sha256(f'{usuario.email}{usuario.id_usuario}'.encode()).hexdigest()[:16]}"
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id_usuario": usuario.id_usuario,
                "nombre": usuario.nombre,
                "email": usuario.email,
                "pais": usuario.pais
            }
        }
    except Exception as e:
        print(f"[ERROR] Error en login: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e),
            "code": "SERVER_ERROR"
        }

if __name__ == "__main__":
    import uvicorn
    print("[*] Iniciando servidor con BD SQLite...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
