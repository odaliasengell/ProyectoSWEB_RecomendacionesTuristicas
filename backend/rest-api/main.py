"""
App FastAPI para el REST API de Turismo.
Conecta con MongoDB local y expone endpoints para gestionar usuarios, destinos, tours, etc.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from beanie import init_beanie

# Importar funciones de conexión a DB
from db import connect_to_mongo, get_database, close_mongo_connection

# Importar routers
from app.routes import (
    usuario_routes, 
    auth_routes,
    destino_routes, 
    tour_routes, 
    guia_routes, 
    reserva_routes, 
    servicio_routes, 
    contratacion_routes, 
    recomendacion_routes,
    upload_routes,
    pago_routes
)


async def startup_event():
    """Eventos de startup: conectar a MongoDB e inicializar Beanie."""
    # Opcional: permitir arrancar en modo desarrollo sin DB real
    if getattr(app.state, "skip_db_init", False):
        print("SKIP_DB_INIT enabled — saltando inicialización de Mongo/Beanie (modo desarrollo).")
        return

    # Conectar a Mongo y registrar modelos en Beanie
    await connect_to_mongo()
    database = get_database()
    if database is None:
        raise RuntimeError("No se pudo inicializar la base de datos")

    # Importar modelos para registrar en Beanie
    from app.models.usuario_model import Usuario
    from app.models.destino_model import Destino
    from app.models.recomendacion_model import Recomendacion
    from app.models.servicio_model import Servicio
    from app.models.guia_model import Guia
    from app.models.tour_model import Tour
    from app.models.reserva_model import Reserva
    from app.models.contratacion_model import ContratacionServicio
    from app.models.token_model import RefreshToken, TokenRevocado

    await init_beanie(database=database, document_models=[
        Usuario, Destino, Recomendacion, Servicio, Guia, Tour, Reserva, ContratacionServicio,
        RefreshToken, TokenRevocado
    ])
    
    print(f"✅ Conectado a MongoDB - Base de datos: {database.name}")
    
    # Crear usuario admin si no existe
    await crear_admin_inicial()


async def shutdown_event():
    """Eventos de shutdown: cerrar conexión a MongoDB."""
    try:
        await close_mongo_connection()
        print("✅ Conexión a MongoDB cerrada correctamente")
    except Exception as e:
        print(f"⚠️ Error al cerrar conexión a MongoDB: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager para manejar startup y shutdown events.
    Reemplaza los deprecated on_event decoradores.
    Referencia: https://fastapi.tiangolo.com/advanced/events/#alternative-events-deprecated
    """
    # Startup
    await startup_event()
    yield
    # Shutdown
    await shutdown_event()


app = FastAPI(
    title="API de Recomendaciones Turísticas",
    description="REST API para gestión de turismo en Ecuador",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],  # URLs del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar directorio de archivos estáticos para imágenes subidas
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Leer flag de entorno para desarrollo: permite arrancar sin inicializar la DB
_skip_db_init_env = os.environ.get("SKIP_DB_INIT", "").lower()
app.state.skip_db_init = _skip_db_init_env in ("1", "true", "yes")

# Montar routers
app.include_router(auth_routes.router)
app.include_router(usuario_routes.router)
app.include_router(destino_routes.router)
app.include_router(tour_routes.router)
app.include_router(guia_routes.router)
app.include_router(reserva_routes.router)
app.include_router(servicio_routes.router)
app.include_router(contratacion_routes.router)
app.include_router(recomendacion_routes.router)
app.include_router(upload_routes.router)
app.include_router(pago_routes.router)


async def crear_admin_inicial():
    """Crear usuario admin predefinido si no existe."""
    from app.models.usuario_model import Usuario
    from utils import hash_password
    
    # Verificar si ya existe un admin
    admin_email = "admin@turismo.com"
    admin_existente = await Usuario.find_one(Usuario.email == admin_email)
    
    if not admin_existente:
        # Crear usuario admin
        admin = Usuario(
            nombre="Admin",
            apellido="Sistema",
            email=admin_email,
            username="admin",
            contrasena=hash_password("admin123"),  # Contraseña predefinida
            pais="Ecuador"
        )
        await admin.insert()
        print(f"✅ Usuario admin creado - Email: {admin_email} / Password: admin123")
    else:
        print(f"ℹ️ Usuario admin ya existe: {admin_email}")


@app.get("/health")
async def health():
    # Informar si la DB está disponible (útil para CI/diagnóstico)
    try:
        db = get_database()
        db_connected = db is not None
    except Exception:
        db_connected = False
    return {"status": "ok", "db_connected": db_connected}

# Nota: este main.py permite ejecutar `res_api` de forma independiente para pruebas locales.
