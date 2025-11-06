"""
Controlador base con implementaciones genéricas usando Beanie Documents.

Funciones:
 - get_all(model): retorna lista de documentos
 - get_by_id(model, id): obtiene documento por ObjectId (string)
 - create(model, payload): crea un documento
 - update(model, id, datos): actualiza documento
 - delete(model, id): elimina documento

Estas helpers permiten que los routers deleguen en la capa de persistencia de forma simple.
"""
from typing import List, Any, Optional, Type
from beanie import PydanticObjectId


async def get_all(model: Type[Any]) -> List[Any]:
    """Retorna todos los documentos de una colección usada por `model` (Beanie Document)."""
    return await model.find_all().to_list()


async def get_by_id(model: Type[Any], id: str) -> Optional[Any]:
    """Obtener un documento por su ObjectId (como string)."""
    try:
        oid = PydanticObjectId(id)
    except Exception:
        # Intentar pasar directamente (Beanie soporta strings en algunos casos)
        oid = id
    try:
        return await model.get(oid)
    except Exception:
        return None


async def create(model: Type[Any], payload: Any) -> Any:
    """Crear un nuevo documento. `payload` puede ser un dict o un Pydantic model."""
    if hasattr(payload, "dict"):
        data = payload.dict()
    else:
        data = dict(payload)
    instance = model(**data)
    await instance.insert()
    return instance


async def update(model: Type[Any], id: str, datos: dict) -> Optional[Any]:
    """Actualizar un documento por id con los datos proporcionados."""
    doc = await get_by_id(model, id)
    if not doc:
        return None
    
    # Actualizar cada campo individualmente
    for key, value in datos.items():
        if hasattr(doc, key):
            setattr(doc, key, value)
    
    # Guardar los cambios
    await doc.save()
    return doc


async def delete(model: Type[Any], id: str) -> bool:
    """Eliminar un documento por id."""
    doc = await get_by_id(model, id)
    if not doc:
        return False
    await doc.delete()
    return True
