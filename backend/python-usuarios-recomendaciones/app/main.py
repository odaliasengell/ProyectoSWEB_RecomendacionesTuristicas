from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware
from app.routes.usuario_routes import router as usuario_router
from app.routes.destino_routes import router as destino_router
from app.routes.recomendacion_routes import router as recomendacion_router
from app.routes.auth_routes import router as auth_router
from app.routes.admin_routes import router as admin_router
from app.routes.admin_panel_routes import router as admin_panel_router
from app.routes.admin_tourism_routes import router as admin_tourism_router
from app.database import init_db

# Configurar CORS middleware ANTES de crear la app
cors_middleware = Middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app = FastAPI(
    title="Recomendaciones Turísticas",
    middleware=[cors_middleware]
)

# Inicializar base de datos al arrancar
@app.on_event("startup")
def on_startup():
    try:
        init_db()
        print("[OK] Base de datos inicializada correctamente")
    except Exception as e:
        print(f"[ERROR] Error inicializando DB: {e}")
        import traceback
        traceback.print_exc()
        raise

# Registrar rutas
app.include_router(usuario_router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(destino_router, prefix="/destinos", tags=["Destinos"])
app.include_router(recomendacion_router, prefix="/recomendaciones", tags=["Recomendaciones"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(admin_router, prefix="/admin", tags=["Admin Auth"])
app.include_router(admin_panel_router, prefix="/admin/panel", tags=["Admin Panel"])
app.include_router(admin_tourism_router, prefix="/admin/turismo", tags=["Admin Turismo"])

# Rutas básicas
@app.get("/")
def root():
	return {"status": "ok", "app": "Recomendaciones Turísticas"}

@app.get("/health")
def health():
	return {"status": "healthy"}
