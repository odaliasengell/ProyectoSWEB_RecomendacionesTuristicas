"""
Punto de entrada del Payment Service
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import dotenv

# Cargar variables de entorno
dotenv.load_dotenv()

# Crear app FastAPI
app = FastAPI(
    title="Payment Service",
    description="Microservicio de Pagos con Adapter Pattern",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=(os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importar rutas
from app.routes.payment_routes import router as payment_router
from app.routes.partner_routes import router as partner_router

# Registrar rutas
app.include_router(payment_router, prefix="/payment", tags=["Payment"])
app.include_router(partner_router, prefix="/partners", tags=["Partners"])

# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "service": "payment-service"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=(os.getenv("ENVIRONMENT", "development") == "development")
    )
