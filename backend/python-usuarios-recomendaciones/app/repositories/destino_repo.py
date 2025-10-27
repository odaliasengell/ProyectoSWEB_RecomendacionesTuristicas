# Repositorio para Destinos
from typing import List, Optional
from app.models.destino import Destino
from app.schemas.destino_schemas import DestinoBase
from beanie import PydanticObjectId

async def crear_destino(destino: DestinoBase) -> Destino:
	"""Crear un nuevo destino en MongoDB"""
	nuevo = Destino(**destino.dict())
	await nuevo.insert()
	return nuevo

async def obtener_destinos() -> List[Destino]:
	"""Obtener todos los destinos"""
	return await Destino.find_all().to_list()

async def obtener_destino_por_id(destino_id: str) -> Optional[Destino]:
	"""Obtener un destino por su ID"""
	return await Destino.get(PydanticObjectId(destino_id))

async def obtener_destinos_por_categoria(categoria: str) -> List[Destino]:
	"""Obtener destinos por categoría"""
	return await Destino.find(Destino.categoria == categoria).to_list()

async def obtener_destinos_activos() -> List[Destino]:
	"""Obtener destinos activos"""
	return await Destino.find(Destino.activo == True).to_list()

async def actualizar_destino(destino_id: str, datos: dict) -> Optional[Destino]:
	"""Actualizar un destino"""
	destino = await Destino.get(PydanticObjectId(destino_id))
	if destino:
		await destino.set(datos)
	return destino

async def eliminar_destino(destino_id: str) -> bool:
	"""Eliminar un destino"""
	destino = await Destino.get(PydanticObjectId(destino_id))
	if destino:
		await destino.delete()
		return True
	return False

