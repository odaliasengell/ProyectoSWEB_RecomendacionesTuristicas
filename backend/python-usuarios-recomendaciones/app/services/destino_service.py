# Servicio para Destinos con MongoDB/Beanie
from app.models.destino import Destino
from app.schemas.destino_schemas import DestinoCreate
from typing import List

async def registrar_destino(data: DestinoCreate) -> Destino:
    """Crear destino en MongoDB"""
    nuevo_destino = Destino(**data.dict())
    await nuevo_destino.insert()
    return nuevo_destino

async def listar_destinos() -> List[Destino]:
    """Obtener todos los destinos de MongoDB"""
    return await Destino.find_all().to_list()
