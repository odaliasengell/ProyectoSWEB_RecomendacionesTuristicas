"""
Rutas para subir y gestionar archivos (imágenes)
"""
import os
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.auth.jwt import verify_admin_token

router = APIRouter(prefix="/admin/upload", tags=["Upload"])

# Directorio base para uploads
UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def get_file_extension(filename: str) -> str:
    """Obtener la extensión del archivo en minúsculas"""
    return os.path.splitext(filename)[1].lower()

def is_allowed_file(filename: str) -> bool:
    """Verificar si la extensión del archivo está permitida"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

def generate_unique_filename(original_filename: str) -> str:
    """Generar un nombre único para el archivo"""
    ext = get_file_extension(original_filename)
    unique_id = str(uuid.uuid4())
    return f"{unique_id}{ext}"


@router.post("/destino")
async def upload_destino_image(
    file: UploadFile = File(...)
    # Temporalmente sin validación de admin para desarrollo
    # current_admin: dict = Depends(verify_admin_token)
):
    """
    Subir imagen para un destino turístico.
    """
    return await upload_image(file, "destinos")


@router.post("/tour")
async def upload_tour_image(
    file: UploadFile = File(...)
    # Temporalmente sin validación de admin para desarrollo
    # current_admin: dict = Depends(verify_admin_token)
):
    """
    Subir imagen para un tour.
    """
    return await upload_image(file, "tours")


@router.post("/servicio")
async def upload_servicio_image(
    file: UploadFile = File(...)
    # Temporalmente sin validación de admin para desarrollo
    # current_admin: dict = Depends(verify_admin_token)
):
    """
    Subir imagen para un servicio.
    """
    return await upload_image(file, "servicios")


async def upload_image(file: UploadFile, category: str) -> JSONResponse:
    """
    Función auxiliar para subir imágenes.
    
    Args:
        file: Archivo subido
        category: Categoría (destinos, tours, guias, servicios)
    
    Returns:
        JSONResponse con la URL de la imagen subida
    """
    # Validar que se proporcionó un archivo
    if not file:
        raise HTTPException(status_code=400, detail="No se proporcionó ningún archivo")
    
    # Validar extensión del archivo
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo de archivo no permitido. Solo se permiten: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    try:
        # Leer contenido del archivo
        contents = await file.read()
        
        # Validar tamaño del archivo
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"El archivo es demasiado grande. Tamaño máximo: {MAX_FILE_SIZE / (1024*1024)}MB"
            )
        
        # Crear directorio si no existe
        upload_path = os.path.join(UPLOAD_DIR, category)
        os.makedirs(upload_path, exist_ok=True)
        
        # Generar nombre único para el archivo
        unique_filename = generate_unique_filename(file.filename)
        file_path = os.path.join(upload_path, unique_filename)
        
        # Guardar archivo
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Construir URL de acceso
        file_url = f"/uploads/{category}/{unique_filename}"
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Imagen subida exitosamente",
                "url": file_url,
                "filename": unique_filename,
                "original_filename": file.filename,
                "category": category,
                "size": len(contents)
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al subir la imagen: {str(e)}"
        )
    finally:
        await file.close()


@router.delete("/{category}/{filename}")
async def delete_image(
    category: str,
    filename: str,
    current_admin: dict = Depends(verify_admin_token)
):
    """
    Eliminar una imagen subida.
    Requiere autenticación de administrador.
    """
    # Validar categoría
    allowed_categories = ["destinos", "tours", "servicios"]
    if category not in allowed_categories:
        raise HTTPException(
            status_code=400, 
            detail=f"Categoría no válida. Categorías permitidas: {', '.join(allowed_categories)}"
        )
    
    # Construir ruta del archivo
    file_path = os.path.join(UPLOAD_DIR, category, filename)
    
    # Verificar que el archivo existe
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    try:
        # Eliminar archivo
        os.remove(file_path)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Imagen eliminada exitosamente",
                "filename": filename,
                "category": category
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al eliminar la imagen: {str(e)}"
        )
