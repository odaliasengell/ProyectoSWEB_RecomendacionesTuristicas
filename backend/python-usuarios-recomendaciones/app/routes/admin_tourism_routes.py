from fastapi import APIRouter, HTTPException
from app.models.destino import Destino
import httpx

router = APIRouter()

# ==================== GESTIÓN DE SERVICIOS TURÍSTICOS (Go - Puerto 8080) ====================
@router.get("/turismo/servicios")
async def get_all_servicios():
    """Obtener todos los servicios turísticos de la API Go"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:8080/servicios")
            if response.status_code == 200:
                data = response.json()
                # Envolver en el formato esperado por el frontend
                return {"servicios": data if data else []}
            return {"servicios": []}
    except httpx.TimeoutException:
        print("⚠️ Timeout al conectar con el servicio Go")
        return {"servicios": []}
    except httpx.ConnectError:
        print("⚠️ No se pudo conectar con el servicio Go en puerto 8080")
        return {"servicios": []}
    except Exception as e:
        print(f"Error obteniendo servicios: {str(e)}")
        return {"servicios": []}

@router.post("/turismo/servicios")
async def create_servicio(servicio_data: dict):
    """Crear un nuevo servicio turístico en la API Go"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "http://localhost:8080/servicios",
                json=servicio_data
            )
            if response.status_code in [200, 201]:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error del backend Go: {response.text}"
                )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error creando servicio: {str(e)}")

@router.put("/turismo/servicios/{servicio_id}")
async def update_servicio(servicio_id: str, servicio_data: dict):
    """Actualizar un servicio turístico en la API Go"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.put(
                f"http://localhost:8080/servicios/{servicio_id}",
                json=servicio_data
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error del backend Go: {response.text}"
                )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error actualizando servicio: {str(e)}")

@router.delete("/turismo/servicios/{servicio_id}")
async def delete_servicio(servicio_id: str):
    """Eliminar un servicio turístico en la API Go"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.delete(f"http://localhost:8080/servicios/{servicio_id}")
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error del backend Go: {response.text}"
                )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error eliminando servicio: {str(e)}")

# ==================== GESTIÓN DE GUÍAS (TypeScript - Puerto 3000) ====================
@router.get("/turismo/guias")
async def get_all_guias():
    """Obtener todas las guías de la API TypeScript"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("http://localhost:3000/api/guias")
            if response.status_code == 200:
                return response.json()
            return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo guías: {str(e)}")

# ==================== GESTIÓN DE TOURS (TypeScript - Puerto 3000) ====================
@router.get("/turismo/tours")
async def get_all_tours():
    """Obtener todos los tours de la API TypeScript"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("http://localhost:3000/api/tours")
            if response.status_code == 200:
                return response.json()
            return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo tours: {str(e)}")

# ==================== GESTIÓN DE DESTINOS (MongoDB - Local) ====================
@router.get("/turismo/destinos")
async def get_all_destinos():
    """Obtener todos los destinos turísticos de MongoDB"""
    try:
        destinos = await Destino.find_all().to_list()
        return [
            {
                "id": str(d.id),
                "nombre": d.nombre,
                "descripcion": d.descripcion,
                "ubicacion": d.ubicacion,
                "ruta": d.ruta,
                "provincia": d.provincia,
                "ciudad": d.ciudad,
                "categoria": d.categoria,
                "calificacion_promedio": d.calificacion_promedio,
                "activo": d.activo
            }
            for d in destinos
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo destinos: {str(e)}")

@router.get("/turismo/destinos/{destino_id}")
async def get_destino(destino_id: str):
    """Obtener un destino específico"""
    from beanie import PydanticObjectId
    try:
        destino = await Destino.get(PydanticObjectId(destino_id))
        if not destino:
            raise HTTPException(status_code=404, detail="Destino no encontrado")
        return {
            "id": str(destino.id),
            "nombre": destino.nombre,
            "descripcion": destino.descripcion,
            "ubicacion": destino.ubicacion,
            "ruta": destino.ruta,
            "provincia": destino.provincia,
            "ciudad": destino.ciudad,
            "categoria": destino.categoria,
            "calificacion_promedio": destino.calificacion_promedio,
            "activo": destino.activo
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.post("/turismo/destinos")
async def create_destino(destino_data: dict):
    """Crear un nuevo destino turístico"""
    try:
        destino = Destino(
            nombre=destino_data.get("nombre"),
            descripcion=destino_data.get("descripcion"),
            ubicacion=destino_data.get("ubicacion"),
            ruta=destino_data.get("ruta"),
            provincia=destino_data.get("provincia"),
            ciudad=destino_data.get("ciudad"),
            categoria=destino_data.get("categoria"),
            calificacion_promedio=destino_data.get("calificacion_promedio", 0.0)
        )
        await destino.insert()
        return {
            "id": str(destino.id),
            "nombre": destino.nombre,
            "descripcion": destino.descripcion,
            "ubicacion": destino.ubicacion,
            "ruta": destino.ruta,
            "provincia": destino.provincia,
            "ciudad": destino.ciudad,
            "categoria": destino.categoria,
            "calificacion_promedio": destino.calificacion_promedio
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creando destino: {str(e)}")

@router.put("/turismo/destinos/{destino_id}")
async def update_destino(destino_id: str, destino_data: dict):
    """Actualizar un destino existente"""
    from beanie import PydanticObjectId
    try:
        destino = await Destino.get(PydanticObjectId(destino_id))
        if not destino:
            raise HTTPException(status_code=404, detail="Destino no encontrado")
        
        # Actualizar campos
        if "nombre" in destino_data:
            destino.nombre = destino_data["nombre"]
        if "descripcion" in destino_data:
            destino.descripcion = destino_data["descripcion"]
        if "ubicacion" in destino_data:
            destino.ubicacion = destino_data["ubicacion"]
        if "ruta" in destino_data:
            destino.ruta = destino_data["ruta"]
        if "provincia" in destino_data:
            destino.provincia = destino_data["provincia"]
        if "ciudad" in destino_data:
            destino.ciudad = destino_data["ciudad"]
        if "categoria" in destino_data:
            destino.categoria = destino_data["categoria"]
        if "calificacion_promedio" in destino_data:
            destino.calificacion_promedio = destino_data["calificacion_promedio"]
        
        await destino.save()
        
        return {
            "id": str(destino.id),
            "nombre": destino.nombre,
            "descripcion": destino.descripcion,
            "ubicacion": destino.ubicacion,
            "ruta": destino.ruta,
            "provincia": destino.provincia,
            "ciudad": destino.ciudad,
            "categoria": destino.categoria,
            "calificacion_promedio": destino.calificacion_promedio
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error actualizando destino: {str(e)}")

@router.delete("/turismo/destinos/{destino_id}")
async def delete_destino(destino_id: str):
    """Eliminar un destino"""
    from beanie import PydanticObjectId
    try:
        destino = await Destino.get(PydanticObjectId(destino_id))
        if not destino:
            raise HTTPException(status_code=404, detail="Destino no encontrado")
        
        await destino.delete()
        return {"message": "Destino eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error eliminando destino: {str(e)}")
