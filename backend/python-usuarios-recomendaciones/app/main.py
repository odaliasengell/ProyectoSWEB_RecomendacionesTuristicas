from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.routes.usuario_routes import router as usuario_router
from app.routes.destino_routes import router as destino_router
from app.routes.recomendacion_routes import router as recomendacion_router
from app.routes.auth_routes import router as auth_router
from app.routes.admin_routes import router as admin_router
from app.routes.admin_panel_routes import router as admin_panel_router
from app.routes.admin_tourism_routes import router as admin_tourism_router
from app.routes.upload_routes import router as upload_router
from app.database import connect_to_mongo, close_mongo_connection

# Configurar CORS middleware ANTES de crear la app
cors_middleware = Middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app = FastAPI(
    title="Recomendaciones Turísticas",
    middleware=[cors_middleware]
)

# Inicializar base de datos al arrancar
@app.on_event("startup")
async def on_startup():
    try:
        await connect_to_mongo()
        print("[OK] MongoDB conectado correctamente")
    except Exception as e:
        print(f"[ERROR] Error conectando a MongoDB: {e}")
        import traceback
        traceback.print_exc()
        raise

@app.on_event("shutdown")
async def on_shutdown():
    await close_mongo_connection()

# Registrar rutas
app.include_router(usuario_router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(destino_router, prefix="/destinos", tags=["Destinos"])
app.include_router(recomendacion_router, prefix="/recomendaciones", tags=["Recomendaciones"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(admin_router, prefix="/admin", tags=["Admin Auth"])
app.include_router(admin_panel_router, prefix="/admin", tags=["Admin Panel"])
app.include_router(admin_tourism_router, prefix="/admin", tags=["Admin Turismo"])
app.include_router(upload_router, prefix="/admin/upload", tags=["Upload"])

# Servir archivos estáticos (imágenes subidas)
uploads_path = Path(__file__).parent.parent / "uploads"
uploads_path.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Rutas básicas
@app.get("/")
def root():
	return {"status": "ok", "app": "Recomendaciones Turísticas"}

@app.get("/health")
def health():
	return {"status": "healthy"}
