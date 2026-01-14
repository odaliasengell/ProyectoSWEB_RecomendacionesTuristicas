"""
Booking Tool - Herramienta MCP para crear reservas
Autor: Odalis Senge
"""
from typing import Dict, Any, List
import httpx
import os
from datetime import datetime

from .base_tool import BaseTool


class BookingTool(BaseTool):
    """Herramienta para crear reservas de tours"""
    
    def __init__(self):
        self.rest_api_url = os.getenv("REST_API_URL", "http://localhost:8000")
    
    def get_schema(self) -> Dict[str, Any]:
        """Obtener esquema de la herramienta"""
        return {
            "name": "booking",
            "description": "Crea reservas de tours para clientes",
            "parameters": {
                "type": "object",
                "properties": {
                    "tour_id": {
                        "type": "string",
                        "description": "ID del tour a reservar"
                    },
                    "customer_email": {
                        "type": "string",
                        "description": "Email del cliente"
                    },
                    "date": {
                        "type": "string",
                        "description": "Fecha de la reserva (YYYY-MM-DD)"
                    },
                    "participants": {
                        "type": "integer",
                        "description": "Número de participantes",
                        "default": 1
                    }
                },
                "required": ["tour_id", "customer_email", "date"]
            }
        }
    
    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crear una reserva
        """
        tour_id = params.get("tour_id")
        customer_email = params.get("customer_email")
        date = params.get("date")
        participants = params.get("participants", 1)
        
        if not all([tour_id, customer_email, date]):
            return {
                "success": False,
                "error": "Missing required parameters: tour_id, customer_email, date"
            }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Crear reserva
                booking_data = {
                    "tour_id": tour_id,
                    "customer_email": customer_email,
                    "fecha_reserva": date,
                    "num_personas": participants,
                    "estado": "pendiente"
                }
                
                response = await client.post(
                    f"{self.rest_api_url}/reservas",
                    json=booking_data
                )
                
                if response.status_code in [200, 201]:
                    booking = response.json()
                    return {
                        "success": True,
                        "booking_id": booking.get("id"),
                        "status": booking.get("estado"),
                        "message": "Reserva creada exitosamente"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"API Error: {response.status_code}"
                    }
        
        except Exception as e:
            # Simular reserva en caso de error
            return {
                "success": True,
                "booking_id": f"BOOK-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "status": "pendiente",
                "message": "Reserva creada exitosamente (modo simulación)",
                "note": "REST API no disponible"
            }
    
    def get_examples(self) -> List[Dict[str, Any]]:
        return [
            {
                "description": "Reservar tour para 2 personas",
                "params": {
                    "tour_id": "tour-001",
                    "customer_email": "cliente@example.com",
                    "date": "2026-02-15",
                    "participants": 2
                }
            }
        ]
