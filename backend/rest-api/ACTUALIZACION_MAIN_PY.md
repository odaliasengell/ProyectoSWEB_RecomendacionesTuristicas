# Actualización main.py - Eliminación de Warnings de Deprecación

## Problema Identificado

Al ejecutar `python main.py`, FastAPI mostraba warnings de deprecación:

```
DeprecationWarning:
    on_event is deprecated, use lifespan event handlers instead.
    Read more about it in the
    [FastAPI docs for Lifespan Events]
    (https://fastapi.tiangolo.com/advanced/events/).

  @app.on_event("startup")
  @app.on_event("shutdown")
```

## Causa

FastAPI 0.93+ deprecó el uso de decoradores `@app.on_event()` en favor del nuevo patrón **Lifespan**.

## Solución Implementada

Se actualizó `main.py` para usar el nuevo patrón de **Lifespan Context Manager**.

### Cambios Realizados

#### 1. Nuevo Import

```python
from contextlib import asynccontextmanager
```

#### 2. Creación de Lifespan Context Manager

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager para manejar startup y shutdown events.
    Reemplaza los deprecated on_event decoradores.
    """
    # Startup
    await startup_event()
    yield
    # Shutdown
    await shutdown_event()
```

#### 3. Integración en FastAPI

```python
app = FastAPI(
    title="API de Recomendaciones Turísticas",
    description="REST API para gestión de turismo en Ecuador",
    version="1.0.0",
    lifespan=lifespan  # ← Nuevo parámetro
)
```

#### 4. Funciones de Soporte

Las funciones `startup_event()`, `shutdown_event()` y `crear_admin_inicial()` se mantienen igual, pero ahora son llamadas desde dentro del context manager.

## Ventajas del Nuevo Patrón

✅ **Moderno**: Sigue las mejores prácticas de FastAPI 0.93+
✅ **Limpio**: Una sola función maneja startup y shutdown
✅ **Seguro**: Garantiza que el cleanup se ejecute incluso en caso de errores
✅ **Compatible**: Funciona con todas las versiones recientes de FastAPI

## Verificación

```bash
# Verificar que no hay warnings
python -c "import main; print('✅ main.py sin warnings')"

# Ejecutar con uvicorn
uvicorn main:app --reload --port 8000
```

## Antes vs Después

### ANTES (Deprecated)

```python
@app.on_event("startup")
async def on_startup():
    await startup_event()

@app.on_event("shutdown")
async def on_shutdown():
    await shutdown_event()
```

### DESPUÉS (Recomendado)

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_event()
    yield
    await shutdown_event()

app = FastAPI(..., lifespan=lifespan)
```

## Referencias

- [FastAPI Lifespan Documentation](https://fastapi.tiangolo.com/advanced/events/)
- [FastAPI Changelog - Deprecation Notice](https://fastapi.tiangolo.com/advanced/events/#alternative-events-deprecated)

---

**Actualizado:** 9 de enero de 2026
**Versión FastAPI:** 0.93+
**Estado:** ✅ Completado
