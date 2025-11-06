"""
Paquete res_api
Exporta un `router` que agrega los routers internos de `app.routes`.
Esto facilita montar el microservicio dentro de una app principal.
"""
from fastapi import APIRouter

# Importar routers internos por path absoluto
from backend.res_api.app.routes import (
	usuario_routes,
	destino_routes,
	tour_routes,
	guia_routes,
	reserva_routes,
	servicio_routes,
	contratacion_routes,
	recomendacion_routes,
)

router = APIRouter(prefix="/res_api")

# Incluir routers con prefijos y tags recomendados
router.include_router(usuario_routes.router, prefix="/usuarios", tags=["usuarios"])
router.include_router(destino_routes.router, prefix="/destinos", tags=["destinos"])
router.include_router(tour_routes.router, prefix="/tours", tags=["tours"])
router.include_router(guia_routes.router, prefix="/guias", tags=["guias"])
router.include_router(reserva_routes.router, prefix="/reservas", tags=["reservas"])
router.include_router(servicio_routes.router, prefix="/servicios", tags=["servicios"])
router.include_router(contratacion_routes.router, prefix="/contrataciones", tags=["contrataciones"])
router.include_router(recomendacion_routes.router, prefix="/recomendaciones", tags=["recomendaciones"])

__all__ = ["router"]
