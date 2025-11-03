"""
Funciones utilitarias para JWT (stubs).
"""

def create_access_token(data: dict) -> str:
    # Stub: no firmar, sólo convertir a string (no recomendable en producción)
    return str(data)


def verify_token(token: str) -> bool:
    # Stub: siempre True (reemplazar por verificación real)
    return True
