"""
Punto de entrada del AI Orchestrator Service
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import dotenv

dotenv.load_dotenv()

app = FastAPI(
    title="AI Orchestrator Service",
    description="Microservicio de IA Conversacional Multimodal",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=(os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importar rutas
from app.routes.chat_routes import router as chat_router
from app.routes.tool_routes import router as tool_router
from app.routes.admin_routes import router as admin_router

# Registrar rutas
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(tool_router, prefix="/tools", tags=["Tools"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])

# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-orchestrator"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=(os.getenv("ENVIRONMENT", "development") == "development")
    )
