"""
Middleware de Rate Limiting para Auth Service
Autor: Odalis Senge
"""

from fastapi import Request, HTTPException
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict
import os


class RateLimiter:
    """Rate Limiter simple en memoria"""
    
    def __init__(self):
        # Diccionario: {IP: [(timestamp, endpoint)]}
        self.requests: Dict[str, list] = defaultdict(list)
        
        # Límites por endpoint (requests por minuto)
        self.limits = {
            "/auth/login": int(os.getenv("RATE_LIMIT_LOGIN", "5")),
            "/auth/register": int(os.getenv("RATE_LIMIT_REGISTER", "3")),
        }
    
    def is_rate_limited(self, request: Request, endpoint: str) -> bool:
        """Verificar si una IP está rate limited"""
        client_ip = request.client.host
        now = datetime.utcnow()
        minute_ago = now - timedelta(minutes=1)
        
        # Limpiar requests antiguos
        if client_ip in self.requests:
            self.requests[client_ip] = [
                (ts, ep) for ts, ep in self.requests[client_ip]
                if ts > minute_ago
            ]
        
        # Contar requests en el último minuto para este endpoint
        recent_requests = [
            (ts, ep) for ts, ep in self.requests[client_ip]
            if ep == endpoint
        ]
        
        # Obtener límite para este endpoint
        limit = self.limits.get(endpoint, 10)
        
        if len(recent_requests) >= limit:
            return True
        
        # Registrar este request
        self.requests[client_ip].append((now, endpoint))
        return False


# Instancia global
rate_limiter = RateLimiter()


async def check_rate_limit(request: Request, endpoint: str):
    """Middleware para verificar rate limiting"""
    if rate_limiter.is_rate_limited(request, endpoint):
        raise HTTPException(
            status_code=429,
            detail=f"Demasiados intentos. Intenta nuevamente en 1 minuto."
        )
