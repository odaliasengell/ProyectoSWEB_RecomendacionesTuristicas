"""
Aplicación simple de prueba con CORS configurado correctamente
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Test CORS API")

# CORS MIDDLEWARE PRIMERO
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "healthy", "message": "API is running"}

@app.post("/auth/register")
def register(data: dict):
    """Endpoint simple de registro sin dependencias"""
    return {
        "status": "success",
        "message": "Usuario registrado",
        "data": data
    }

@app.options("/auth/register")
def register_options():
    """Manejar OPTIONS request explícitamente"""
    return {"message": "OK"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
