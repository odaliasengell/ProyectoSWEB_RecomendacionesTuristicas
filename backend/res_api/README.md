Carpeta `res_api`

Contenido:

- `schemas.py`: definiciones Pydantic (interfaces/DTOs) para los recursos (Usuario, Destino, Tour, Servicio, Guia, Reserva, Recomendacion, ContratacionServicio).
- `routes.py`: `APIRouter` con endpoints de ejemplo que usan los `schemas`.
- `controllers.py`: stubs de funciones que implementan la lógica (actualmente devuelven datos vacíos).
- `__init__.py`: exporta el `router` para facilitar su inclusión en la app principal.

Cómo integrar (opcional):

1. Importar el router en la aplicación FastAPI principal:

   from backend.res_api import router as res_api_router
   app.include_router(res_api_router)

2. Conectar los controladores a la capa de persistencia (MongoDB, etc.) según la arquitectura existente.

Observación: según la solicitud del equipo, este directorio se añadió solo con las interfaces y rutas de ejemplo; no se modificó ninguna configuración global ni se alteraron archivos existentes.

Modo desarrollo sin DB:

Si no tienes Mongo disponible localmente y quieres arrancar el servicio para
probar rutas que no dependan de la base, puedes establecer la variable de
entorno `SKIP_DB_INIT=true` antes de arrancar. Esto evitará que `main.py`
intente conectar a Mongo o inicializar Beanie; la lógica de persistencia queda
intacta para que el encargado de DB la use en producción.

PowerShell (temporal):

```powershell
$env:SKIP_DB_INIT = "true"
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Recuerda quitar la variable o ponerla en `false` para que el servicio vuelva a
intentar conectar a la base y registre los modelos con Beanie.

## Script de arranque (PowerShell)

He incluido un script `run.ps1` en esta carpeta que automatiza la creación del
entorno virtual, la instalación de dependencias y el arranque del servidor.

Usos:

```powershell
# Arrancar normalmente (intenta conectar a Mongo)
.\run.ps1

# Arrancar sin DB (modo desarrollo)
.\run.ps1 -SkipDb

# Cambiar puerto (ej. 9000)
.\run.ps1 -Port 9000
```

El script activa `.venv`, instala `requirements.txt` y ejecuta `uvicorn`.
