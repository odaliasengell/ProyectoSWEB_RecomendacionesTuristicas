"""
Weather Tool - Herramienta MCP para obtener clima
Autor: Odalis Senge
"""
from typing import Dict, Any
from .base_tool import BaseTool


class WeatherTool(BaseTool):
    """Herramienta para obtener información del clima"""
    
    def __init__(self):
        super().__init__(
            name="get_weather",
            description="Obtener información del clima actual",
            parameters={
                "location": {
                    "type": "string",
                    "description": "Ubicación para consultar el clima"
                }
            }
        )
    
    async def execute(self, location: str, **kwargs) -> Dict[str, Any]:
        """Obtener clima para una ubicación"""
        
        # TODO: Integrar con API de clima real (OpenWeather, etc.)
        
        # Mock data por ahora
        weather_data = {
            "quito": {
                "temperatura": 18,
                "condicion": "Parcialmente nublado",
                "humedad": 65,
                "viento": 15
            },
            "galapagos": {
                "temperatura": 25,
                "condicion": "Soleado",
                "humedad": 75,
                "viento": 20
            },
            "ecuador": {
                "temperatura": 22,
                "condicion": "Variado según región",
                "humedad": 70,
                "viento": 10
            }
        }
        
        location_lower = location.lower()
        
        # Buscar coincidencia
        for key, data in weather_data.items():
            if key in location_lower:
                return {
                    "success": True,
                    "location": location,
                    "weather": data
                }
        
        # Default
        return {
            "success": True,
            "location": location,
            "weather": weather_data["ecuador"]
        }
