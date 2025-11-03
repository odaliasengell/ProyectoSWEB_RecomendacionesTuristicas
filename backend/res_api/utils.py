"""
Utilidades varias para la REST API.
"""

def to_dict(obj):
    """Intento simple de convertir Pydantic model o dict-like a dict."""
    try:
        return obj.dict()
    except Exception:
        return dict(obj) if isinstance(obj, dict) else obj
