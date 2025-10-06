from fastapi import FastAPI
from app.routes.usuario_routes import router as usuario_router
from app.routes.destino_routes import router as destino_router
from app.routes.recomendacion_routes import router as recomendacion_router

app = FastAPI(title="Recomendaciones Turísticas")

# Registrar rutas
app.include_router(usuario_router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(destino_router, prefix="/destinos", tags=["Destinos"])
app.include_router(recomendacion_router, prefix="/recomendaciones", tags=["Recomendaciones"])

# Rutas básicas
@app.get("/")
def root():
	return {"status": "ok", "app": "Recomendaciones Turísticas"}

@app.get("/health")
def health():
	return {"status": "healthy"}
