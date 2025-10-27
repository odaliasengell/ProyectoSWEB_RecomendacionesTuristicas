from fastapi import Request
from fastapi.responses import JSONResponse

async def database_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Error en la base de datos",
            "detail": str(exc)
        }
    )

async def validation_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=400,
        content={
            "message": "Error de validación",
            "detail": str(exc)
        }
    )