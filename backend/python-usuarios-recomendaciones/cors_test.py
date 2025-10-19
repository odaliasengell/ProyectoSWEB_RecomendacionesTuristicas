"""
Mini-app para pruebas de CORS - sin dependencias complejas
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware

# Usar Middleware en el constructor
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

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Servidor funcionando"}

@app.post("/auth/register")
async def register(data: dict):
    print(f"Datos recibidos: {data}")
    return {"status": "success", "message": "Registrado", "data": data}

@app.options("/{path:path}")
async def handle_options(path: str):
    return {"message": "OK"}

if __name__ == "__main__":
    import uvicorn
    print("[*] Iniciando servidor CORS test...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
