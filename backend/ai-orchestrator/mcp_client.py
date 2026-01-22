"""
Cliente MCP - Conexión con MCP Server
Permite al LLM ejecutar herramientas de negocio
"""
import httpx
from typing import List, Dict, Any
import os
import json
import re


# Cache global para reservas del usuario (para resolver "cancelar la 1")
_reservas_cache: Dict[str, List[Dict]] = {}


class MCPClient:
    """Cliente para interactuar con MCP Server"""
    
    def __init__(self):
        self.mcp_base_url = os.getenv("MCP_SERVER_URL", "http://localhost:8005")
        self.timeout = 30.0
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """
        Obtener lista de herramientas disponibles del MCP Server
        """
        try:
            # Por ahora retornamos herramientas hardcoded
            # En producción, esto vendría del MCP Server
            return [
                {
                    "name": "buscar_destinos",
                    "description": "Busca destinos turísticos disponibles por ubicación, categoría o nombre",
                    "parameters": {
                        "query": "texto de búsqueda",
                        "categoria": "playa, montaña, ciudad, etc. (opcional)"
                    }
                },
                {
                    "name": "ver_reserva",
                    "description": "Consulta información de una reserva específica por ID",
                    "parameters": {
                        "reserva_id": "ID de la reserva"
                    }
                },
                {
                    "name": "crear_reserva",
                    "description": "Crea una nueva reserva de tour o servicio",
                    "parameters": {
                        "destino_id": "ID del destino",
                        "fecha": "fecha en formato YYYY-MM-DD",
                        "personas": "número de personas"
                    }
                },
                {
                    "name": "cancelar_reserva",
                    "description": "Cancela una reserva existente por su ID",
                    "parameters": {
                        "reserva_id": "ID de la reserva a cancelar"
                    }
                },
                {
                    "name": "mis_reservas",
                    "description": "Muestra todas las reservas del usuario actual. Usar cuando el usuario diga 'mis reservas', 'quiero cancelar' sin dar ID, o 'ver mis reservas'",
                    "parameters": {}
                },
                {
                    "name": "buscar_guias",
                    "description": "Busca guías turísticos disponibles por especialidad o ubicación",
                    "parameters": {
                        "especialidad": "tipo de tour (opcional)",
                        "ubicacion": "ciudad o región (opcional)"
                    }
                },
                {
                    "name": "estadisticas_ventas",
                    "description": "Genera reporte de estadísticas de ventas y reservas",
                    "parameters": {
                        "fecha_inicio": "fecha inicio (opcional)",
                        "fecha_fin": "fecha fin (opcional)"
                    }
                }
            ]
        except Exception as e:
            print(f"Error obteniendo herramientas: {e}")
            return []
    
    async def execute_tools(self, llm_response: str, usuario_id: str = None) -> List[Dict[str, Any]]:
        """
        Ejecutar herramientas basadas en la respuesta del LLM
        Formato esperado: USE_TOOL:nombre_herramienta:{"param": "value"}
        """
        global _reservas_cache
        results = []
        
        # Buscar patrones de uso de herramientas
        tool_pattern = r'USE_TOOL:(\w+):(\{.*?\})'
        matches = re.findall(tool_pattern, llm_response)
        
        for tool_name, params_json in matches:
            try:
                params = json.loads(params_json)
                
                # Agregar usuario_id a herramientas que lo necesitan
                if tool_name == "crear_reserva" and usuario_id:
                    params["usuario_id"] = usuario_id
                
                # Para mis_reservas, agregar usuario_id
                if tool_name == "mis_reservas" and usuario_id:
                    params["usuario_id"] = usuario_id
                
                # Para cancelar_reserva, resolver ID si no se proporcionó
                if tool_name == "cancelar_reserva":
                    reserva_id = params.get("reserva_id", "")
                    
                    # Si el ID está vacío o es un número (1, 2, 3), resolver desde cache
                    if not reserva_id or reserva_id.isdigit():
                        cache_key = usuario_id or "default"
                        cached_reservas = _reservas_cache.get(cache_key, [])
                        
                        if cached_reservas:
                            # Si es número, usar como índice
                            if reserva_id.isdigit():
                                idx = int(reserva_id) - 1  # "1" → índice 0
                                if 0 <= idx < len(cached_reservas):
                                    params["reserva_id"] = cached_reservas[idx].get("id")
                                    print(f"🔄 Resuelto 'reserva {reserva_id}' → ID: {params['reserva_id']}")
                            else:
                                # Si está vacío y hay solo 1 reserva, usar esa
                                if len(cached_reservas) == 1:
                                    params["reserva_id"] = cached_reservas[0].get("id")
                                    print(f"🔄 Solo 1 reserva, usando ID: {params['reserva_id']}")
                
                result = await self._execute_single_tool(tool_name, params)
                
                # Si es mis_reservas, guardar en cache
                if tool_name == "mis_reservas" and result:
                    try:
                        data = result.get("data", {})
                        reservas = data.get("reservas", [])
                        cache_key = usuario_id or "default"
                        _reservas_cache[cache_key] = reservas
                        print(f"💾 Cacheadas {len(reservas)} reservas para usuario {cache_key}")
                    except:
                        pass
                
                results.append({
                    "name": tool_name,
                    "params": params,
                    "result": result
                })
            except Exception as e:
                results.append({
                    "name": tool_name,
                    "params": params_json,
                    "error": str(e)
                })
        
        return results
    
    async def _execute_single_tool(self, tool_name: str, params: Dict[str, Any]) -> Any:
        """
        Ejecutar una herramienta específica
        """
        try:
            # Intentar conectar al MCP Server real
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # El MCP Server espera formato: {"params": {...}}
                response = await client.post(
                    f"{self.mcp_base_url}/tools/{tool_name}",
                    json={"params": params},
                    follow_redirects=True
                )
                
                print(f"📡 MCP Server respondió: {response.status_code}")
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"⚠️  Error {response.status_code}, usando datos simulados")
                    return await self._simulate_tool_execution(tool_name, params)
                    
        except Exception as e:
            print(f"❌ Error conectando a MCP Server: {str(e)}, usando datos simulados")
            return await self._simulate_tool_execution(tool_name, params)
    
    async def _simulate_tool_execution(self, tool_name: str, params: Dict[str, Any]) -> Any:
        """
        Simular ejecución de herramientas cuando MCP Server no está disponible
        """
        simulated_responses = {
            "buscar_destinos": {
                "destinos": [
                    {
                        "id": 1,
                        "nombre": "Machu Picchu",
                        "categoria": "montaña",
                        "precio": 150.00,
                        "disponible": True
                    },
                    {
                        "id": 2,
                        "nombre": "Playa Máncora",
                        "categoria": "playa",
                        "precio": 80.00,
                        "disponible": True
                    }
                ],
                "total": 2
            },
            "ver_reserva": {
                "reserva_id": params.get("reserva_id", "123"),
                "destino": "Machu Picchu",
                "fecha": "2026-02-15",
                "personas": 2,
                "estado": "confirmada",
                "total": 300.00
            },
            "crear_reserva": {
                "reserva_id": "RES-2026-001",
                "estado": "pendiente_pago",
                "destino_id": params.get("destino_id"),
                "fecha": params.get("fecha"),
                "personas": params.get("personas"),
                "mensaje": "Reserva creada exitosamente"
            },
            "buscar_guias": {
                "guias": [
                    {
                        "id": 1,
                        "nombre": "Juan Pérez",
                        "especialidad": "tours arqueológicos",
                        "rating": 4.8,
                        "disponible": True
                    },
                    {
                        "id": 2,
                        "nombre": "María García",
                        "especialidad": "ecoturismo",
                        "rating": 4.9,
                        "disponible": True
                    }
                ],
                "total": 2
            },
            "estadisticas_ventas": {
                "periodo": f"{params.get('fecha_inicio', '2026-01-01')} - {params.get('fecha_fin', '2026-01-19')}",
                "total_ventas": 25,
                "ingresos_totales": 4500.00,
                "promedio_venta": 180.00,
                "destinos_populares": [
                    {"nombre": "Machu Picchu", "ventas": 12},
                    {"nombre": "Cusco", "ventas": 8},
                    {"nombre": "Arequipa", "ventas": 5}
                ]
            }
        }
        
        return simulated_responses.get(tool_name, {"error": "Herramienta no encontrada"})
