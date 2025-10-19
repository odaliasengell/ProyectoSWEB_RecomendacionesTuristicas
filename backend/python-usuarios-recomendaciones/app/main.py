from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.usuario_routes import router as usuario_router
from app.routes.destino_routes import router as destino_router
from app.routes.recomendacion_routes import router as recomendacion_router
from app.routes.auth_routes import router as auth_router

app = FastAPI(title="Recomendaciones Turísticas")

# Habilitar CORS para desarrollo (ajusta orígenes según tu entorno)
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Registrar rutas
app.include_router(usuario_router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(destino_router, prefix="/destinos", tags=["Destinos"])
app.include_router(recomendacion_router, prefix="/recomendaciones", tags=["Recomendaciones"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])

# Rutas básicas
@app.get("/")
def root():
	return {"status": "ok", "app": "Recomendaciones Turísticas"}

@app.get("/health")
def health():
	return {"status": "healthy"}
