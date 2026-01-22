import hmac
import hashlib
import secrets
from typing import Dict, Any
import json


def generate_secret(length: int = 32) -> str:
    """Genera un secret aleatorio para HMAC"""
    return secrets.token_urlsafe(length)


def compute_hmac_signature(
    payload: Dict[str, Any],
    secret: str,
    algorithm: str = "sha256"
) -> str:
    """
    Calcula la firma HMAC de un payload
    
    Args:
        payload: Diccionario con los datos a firmar
        secret: Secret compartido
        algorithm: Algoritmo de hash (sha256, sha512)
    
    Returns:
        Firma HMAC en hexadecimal
    """
    # Convertir payload a JSON string ordenado
    payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))
    payload_bytes = payload_str.encode('utf-8')
    secret_bytes = secret.encode('utf-8')
    
    # Calcular HMAC
    if algorithm == "sha256":
        signature = hmac.new(secret_bytes, payload_bytes, hashlib.sha256)
    elif algorithm == "sha512":
        signature = hmac.new(secret_bytes, payload_bytes, hashlib.sha512)
    else:
        raise ValueError(f"Algoritmo no soportado: {algorithm}")
    
    return signature.hexdigest()


def verify_hmac_signature(
    payload: Dict[str, Any],
    signature: str,
    secret: str,
    algorithm: str = "sha256"
) -> bool:
    """
    Verifica la firma HMAC de un payload
    
    Args:
        payload: Diccionario con los datos
        signature: Firma a verificar
        secret: Secret compartido
        algorithm: Algoritmo de hash
    
    Returns:
        True si la firma es válida
    """
    expected_signature = compute_hmac_signature(payload, secret, algorithm)
    
    # Comparación segura contra timing attacks
    return hmac.compare_digest(expected_signature, signature)


def create_webhook_headers(
    payload: Dict[str, Any],
    secret: str,
    service_name: str = "TurismoEcuador"
) -> Dict[str, str]:
    """
    Crea headers para webhook con firma HMAC
    
    Args:
        payload: Datos del webhook
        secret: Secret compartido con el partner
        service_name: Nombre del servicio que envía
    
    Returns:
        Diccionario con headers incluyendo firma HMAC
    """
    signature = compute_hmac_signature(payload, secret)
    
    return {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Signature-Algorithm": "sha256",
        "X-Service-Name": service_name,
    }


def verify_webhook_signature(
    payload: Dict[str, Any],
    headers: Dict[str, str],
    secret: str
) -> tuple[bool, str]:
    """
    Verifica la firma HMAC de un webhook entrante
    
    Args:
        payload: Datos del webhook
        headers: Headers de la request
        secret: Secret compartido
    
    Returns:
        Tupla (es_valido, mensaje_error)
    """
    # Obtener firma del header
    signature = headers.get("X-Webhook-Signature") or headers.get("x-webhook-signature")
    if not signature:
        return False, "Falta header X-Webhook-Signature"
    
    # Obtener algoritmo (por defecto sha256)
    algorithm = headers.get("X-Webhook-Signature-Algorithm", "sha256").lower()
    if algorithm not in ["sha256", "sha512"]:
        return False, f"Algoritmo no soportado: {algorithm}"
    
    # Verificar firma
    try:
        is_valid = verify_hmac_signature(payload, signature, secret, algorithm)
        if is_valid:
            return True, ""
        else:
            return False, "Firma HMAC inválida"
    except Exception as e:
        return False, f"Error al verificar firma: {str(e)}"
