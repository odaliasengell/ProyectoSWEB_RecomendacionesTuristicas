"""
App FastAPI de ejemplo para el paquete `res_api`.
Este archivo es un stub y NO se integra automáticamente en el proyecto principal.
"""
import os
import sys
from fastapi import FastAPI
from beanie import init_beanie

# Asegurar que la raíz del repo esté en sys.path para que las importaciones
# absolutas como `backend.res_api` funcionen independientemente del cwd.
_this_dir = os.path.dirname(__file__)
_repo_root = os.path.dirname(os.path.dirname(_this_dir))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

from backend.res_api.db import connect_to_mongo, get_database, close_mongo_connection  # type: ignore

app = FastAPI(title="res_api (stub)")

# Leer flag de entorno para desarrollo: permite arrancar sin inicializar la DB
_skip_db_init_env = os.environ.get("SKIP_DB_INIT", "").lower()
app.state.skip_db_init = _skip_db_init_env in ("1", "true", "yes")

# Importar routers del paquete app.routes
from backend.res_api.app.routes import usuario_routes, destino_routes, tour_routes, guia_routes, reserva_routes, servicio_routes, contratacion_routes, recomendacion_routes


# Montar routers (opcional para pruebas locales)
app.include_router(usuario_routes.router)
app.include_router(destino_routes.router)
app.include_router(tour_routes.router)
app.include_router(guia_routes.router)
app.include_router(reserva_routes.router)
app.include_router(servicio_routes.router)
app.include_router(contratacion_routes.router)
app.include_router(recomendacion_routes.router)


@app.on_event("startup")
async def on_startup():
    # Opcional: permitir arrancar en modo desarrollo sin DB real
    if getattr(app.state, "skip_db_init", False):
        # No conectamos a Mongo ni inicializamos Beanie. El encargado de DB
        # puede seguir manteniendo la lógica; aquí solo evitamos fallos locales.
        print("SKIP_DB_INIT enabled — saltando inicialización de Mongo/Beanie (modo desarrollo).")
        return

    # Conectar a Mongo y registrar modelos en Beanie
    await connect_to_mongo()
    database = get_database()
    if database is None:
        raise RuntimeError("No se pudo inicializar la base de datos")

    # Importar modelos localmente para registrar en Beanie (usar rutas absolutas)
    from backend.res_api.app.models.usuario_model import Usuario
    from backend.res_api.app.models.destino_model import Destino
    from backend.res_api.app.models.recomendacion_model import Recomendacion
    from backend.res_api.app.models.servicio_model import Servicio
    from backend.res_api.app.models.guia_model import Guia
    from backend.res_api.app.models.tour_model import Tour
    from backend.res_api.app.models.reserva_model import Reserva
    from backend.res_api.app.models.contratacion_model import ContratacionServicio

    await init_beanie(database=database, document_models=[
        Usuario, Destino, Recomendacion, Servicio, Guia, Tour, Reserva, ContratacionServicio
    ])


@app.on_event("shutdown")
async def on_shutdown():
    # cerrar cliente si es necesario
    try:
        from backend.res_api.db import close_mongo_connection
        await close_mongo_connection()
    except Exception:
        pass


@app.get("/health")
async def health():
    # Informar si la DB está disponible (útil para CI/diagnóstico)
    try:
        db = get_database()
        db_connected = db is not None
    except Exception:
        db_connected = False
    return {"status": "ok", "db_connected": db_connected}

# Nota: este main.py permite ejecutar `res_api` de forma independiente para pruebas locales.
