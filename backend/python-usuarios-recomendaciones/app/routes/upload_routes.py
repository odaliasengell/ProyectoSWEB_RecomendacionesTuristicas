from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
import os
import uuid
from datetime import datetime
from pathlib import Path
from app.services.admin_auth_service import AdminAuthService

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/auth/token")
admin_auth_service = AdminAuthService()

# Configuración
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
# Sin límite de tamaño

def validate_image(file: UploadFile):
    """Valida que el archivo sea una imagen válida"""
    # Validar extensión
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no permitido. Solo se permiten: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validar tipo MIME
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser una imagen"
        )
    
    return file_ext

async def verify_admin(token: str = Depends(oauth2_scheme)):
    """Verifica que el token sea de un administrador"""
    try:
        admin = await admin_auth_service.get_current_admin(token)
        if not admin:
            raise HTTPException(status_code=403, detail="Acceso denegado. Solo administradores.")
        return admin
    except Exception as e:
        raise HTTPException(status_code=403, detail="Token inválido o expirado")

@router.post("/destino")
async def upload_destino_image(
    file: UploadFile = File(...),
    admin = Depends(verify_admin)
):
    """
    Sube una imagen para un destino turístico.
    Solo accesible para administradores.
    """
    try:
        # Validar imagen
        file_ext = validate_image(file)
        
        # Leer contenido del archivo
        contents = await file.read()
        
        # Generar nombre único
        timestamp = int(datetime.now().timestamp())
        unique_id = str(uuid.uuid4())[:8]
        safe_filename = f"{timestamp}_{unique_id}_{file.filename}"
        
        # Crear directorio si no existe
        destino_dir = UPLOAD_DIR / "destinos"
        destino_dir.mkdir(parents=True, exist_ok=True)
        
        # Guardar archivo
        file_path = destino_dir / safe_filename
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Retornar URL pública
        file_url = f"http://localhost:8000/uploads/destinos/{safe_filename}"
        
        return {
            "success": True,
            "url": file_url,
            "filename": safe_filename,
            "size": len(contents),
            "uploaded_by": admin.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error subiendo imagen: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")

@router.delete("/destino/{filename}")
async def delete_destino_image(
    filename: str,
    admin = Depends(verify_admin)
):
    """
    Elimina una imagen de destino.
    Solo accesible para administradores.
    """
    try:
        file_path = UPLOAD_DIR / "destinos" / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Imagen no encontrada")
        
        # Eliminar archivo
        os.remove(file_path)
        
        return {
            "success": True,
            "message": "Imagen eliminada correctamente",
            "deleted_by": admin.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar imagen: {str(e)}")
