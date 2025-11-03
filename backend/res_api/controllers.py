"""
Controladores que exponen lógica mínima de persistencia usando los modelos Beanie
definidos en `app.models`.

Estas funciones usan las helpers de `app.controllers.base_controller` para mantener
la lógica genérica en un lugar.
"""
from typing import List, Optional

from .app.models.usuario_model import Usuario
from .app.models.destino_model import Destino
from .app.models.tour_model import Tour
from .app.models.servicio_model import Servicio
from .app.models.guia_model import Guia
from .app.models.reserva_model import Reserva
from .app.models.recomendacion_model import Recomendacion
from .app.models.contratacion_model import ContratacionServicio

from .app.controllers.base_controller import get_all, get_by_id, create, update, delete  # type: ignore


async def listar_usuarios() -> List[Usuario]:
    return await get_all(Usuario)


async def obtener_usuario_por_id(id: str) -> Optional[Usuario]:
    return await get_by_id(Usuario, id)


async def crear_usuario(payload) -> Usuario:
    return await create(Usuario, payload)


async def crear_destino(payload) -> Destino:
    return await create(Destino, payload)


async def crear_tour(payload) -> Tour:
    return await create(Tour, payload)


async def crear_servicio(payload) -> Servicio:
    return await create(Servicio, payload)


async def crear_guia(payload) -> Guia:
    return await create(Guia, payload)


async def listar_destinos() -> List[Destino]:
    return await get_all(Destino)


async def obtener_destino_por_id(id: str) -> Optional[Destino]:
    return await get_by_id(Destino, id)


async def listar_tours() -> List[Tour]:
    return await get_all(Tour)


async def listar_servicios() -> List[Servicio]:
    return await get_all(Servicio)


async def listar_guias() -> List[Guia]:
    return await get_all(Guia)


async def listar_recomendaciones() -> List[Recomendacion]:
    return await get_all(Recomendacion)


async def crear_recomendacion(payload) -> Recomendacion:
    return await create(Recomendacion, payload)


async def listar_reservas() -> List[Reserva]:
    return await get_all(Reserva)


async def crear_reserva(payload) -> Reserva:
    return await create(Reserva, payload)


async def listar_contrataciones() -> List[ContratacionServicio]:
    return await get_all(ContratacionServicio)


async def crear_contratacion(payload) -> ContratacionServicio:
    return await create(ContratacionServicio, payload)
