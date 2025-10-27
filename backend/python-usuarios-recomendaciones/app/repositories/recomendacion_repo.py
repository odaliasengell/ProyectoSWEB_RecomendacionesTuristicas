# Repositorio para Recomendaciones
from typing import List, Optional
from app.models.recomendacion import Recomendacion
from app.schemas.recomendacion_schema import RecomendacionBase
from beanie import PydanticObjectId

async def crear_recomendacion(recomendacion: RecomendacionBase) -> Recomendacion:
	"""Crear una nueva recomendación en MongoDB"""
	nueva = Recomendacion(**recomendacion.dict())
	await nueva.insert()
	return nueva

async def obtener_recomendaciones() -> List[Recomendacion]:
	"""Obtener todas las recomendaciones"""
	return await Recomendacion.find_all().to_list()

async def obtener_recomendacion_por_id(recomendacion_id: str) -> Optional[Recomendacion]:
	"""Obtener una recomendación por su ID"""
	return await Recomendacion.get(PydanticObjectId(recomendacion_id))

async def obtener_recomendaciones_por_usuario(usuario_id: str) -> List[Recomendacion]:
	"""Obtener recomendaciones de un usuario específico"""
	return await Recomendacion.find(Recomendacion.id_usuario == usuario_id).to_list()

async def actualizar_recomendacion(recomendacion_id: str, datos: dict) -> Optional[Recomendacion]:
	"""Actualizar una recomendación"""
	recomendacion = await Recomendacion.get(PydanticObjectId(recomendacion_id))
	if recomendacion:
		await recomendacion.set(datos)
	return recomendacion

async def eliminar_recomendacion(recomendacion_id: str) -> bool:
	"""Eliminar una recomendación"""
	recomendacion = await Recomendacion.get(PydanticObjectId(recomendacion_id))
	if recomendacion:
		await recomendacion.delete()
		return True
	return False

