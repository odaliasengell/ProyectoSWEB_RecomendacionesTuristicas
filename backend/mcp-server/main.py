"""
MCP Server - Model Context Protocol Server
Servidor de herramientas que el LLM puede invocar para ejecutar acciones
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import httpx
import os
import uvicorn

app = FastAPI(title="MCP Server", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URLs de servicios
REST_API_URL = os.getenv("REST_API_URL", "http://localhost:8000")
GRAPHQL_URL = os.getenv("GRAPHQL_URL", "http://localhost:4000/graphql")

# Modelos
class ToolRequest(BaseModel):
    params: Dict[str, Any]

class ToolResponse(BaseModel):
    success: bool
    data: Any
    error: Optional[str] = None


@app.get("/")
async def root():
    return {
        "service": "MCP Server",
        "status": "running",
        "tools": [
            "buscar_destinos",
            "ver_reserva",
            "crear_reserva",
            "buscar_guias",
            "estadisticas_ventas"
        ]
    }

@app.get("/tools")
async def list_tools():
    """Listar todas las herramientas disponibles"""
    return {
        "tools": [
            {
                "name": "buscar_destinos",
                "type": "consulta",
                "description": "Busca destinos turísticos disponibles por ubicación, categoría o nombre",
                "parameters": {
                    "query": "texto de búsqueda",
                    "categoria": "playa, montaña, ciudad, etc. (opcional)"
                }
            },
            {
                "name": "ver_reserva",
                "type": "consulta",
                "description": "Consulta información de una reserva específica por ID",
                "parameters": {
                    "reserva_id": "ID de la reserva"
                }
            },
            {
                "name": "crear_reserva",
                "type": "accion",
                "description": "Crea una nueva reserva de tour o servicio",
                "parameters": {
                    "destino_id": "ID del destino",
                    "fecha": "fecha en formato YYYY-MM-DD",
                    "personas": "número de personas",
                    "usuario_id": "ID del usuario (opcional)"
                }
            },
            {
                "name": "buscar_guias",
                "type": "consulta",
                "description": "Busca guías turísticos disponibles por especialidad o ubicación",
                "parameters": {
                    "especialidad": "tipo de tour (opcional)",
                    "ubicacion": "ciudad o región (opcional)"
                }
            },
            {
                "name": "estadisticas_ventas",
                "type": "reporte",
                "description": "Genera reporte de estadísticas de ventas y reservas",
                "parameters": {
                    "fecha_inicio": "fecha inicio (opcional)",
                    "fecha_fin": "fecha fin (opcional)"
                }
            }
        ]
    }


# ==================== TOOLS DE CONSULTA ====================

@app.post("/tools/buscar_destinos")
async def buscar_destinos(request: ToolRequest):
    """
    Tool de consulta: Buscar destinos turísticos
    """
    try:
        params = request.params
        query = params.get("query", "")
        categoria = params.get("categoria")
        
        # Llamar a REST API
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            url = f"{REST_API_URL}/destinos/"
            filters = {}
            if query:
                filters["search"] = query
            if categoria:
                filters["categoria"] = categoria
            
            response = await client.get(url, params=filters)
            
            if response.status_code == 200:
                destinos = response.json()
                return ToolResponse(
                    success=True,
                    data={
                        "destinos": destinos[:10],  # Limitar a 10 resultados
                        "total": len(destinos),
                        "query": query,
                        "categoria": categoria
                    }
                )
            else:
                return ToolResponse(
                    success=False,
                    data=None,
                    error=f"Error al buscar destinos: {response.status_code}"
                )
                
    except httpx.ConnectError:
        # Simular respuesta si el servicio no está disponible
        return ToolResponse(
            success=True,
            data={
                "destinos": [
                    {
                        "id": 1,
                        "nombre": "Machu Picchu",
                        "categoria": "montaña",
                        "ubicacion": "Cusco, Perú",
                        "precio": 150.00,
                        "descripcion": "Ciudadela inca en lo alto de los Andes",
                        "disponible": True
                    },
                    {
                        "id": 2,
                        "nombre": "Lago Titicaca",
                        "categoria": "naturaleza",
                        "ubicacion": "Puno, Perú",
                        "precio": 80.00,
                        "descripcion": "El lago navegable más alto del mundo",
                        "disponible": True
                    },
                    {
                        "id": 3,
                        "nombre": "Líneas de Nazca",
                        "categoria": "arqueología",
                        "ubicacion": "Nazca, Perú",
                        "precio": 120.00,
                        "descripcion": "Misteriosos geoglifos en el desierto",
                        "disponible": True
                    }
                ],
                "total": 3,
                "simulated": True
            }
        )
    except Exception as e:
        return ToolResponse(success=False, data=None, error=str(e))


@app.post("/tools/ver_reserva")
async def ver_reserva(request: ToolRequest):
    """
    Tool de consulta: Ver detalles de una reserva
    """
    try:
        params = request.params
        reserva_id = params.get("reserva_id")
        
        if not reserva_id:
            return ToolResponse(
                success=False,
                data=None,
                error="Se requiere reserva_id"
            )
        
        # Llamar a REST API
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(f"{REST_API_URL}/reservas/{reserva_id}")
            
            if response.status_code == 200:
                reserva = response.json()
                return ToolResponse(success=True, data=reserva)
            elif response.status_code == 404:
                return ToolResponse(
                    success=False,
                    data=None,
                    error=f"Reserva {reserva_id} no encontrada"
                )
            else:
                return ToolResponse(
                    success=False,
                    data=None,
                    error=f"Error al consultar reserva: {response.status_code}"
                )
                
    except httpx.ConnectError:
        # Simular respuesta
        return ToolResponse(
            success=True,
            data={
                "reserva_id": reserva_id,
                "destino": "Machu Picchu",
                "fecha": "2026-02-15",
                "personas": 2,
                "estado": "confirmada",
                "precio_total": 300.00,
                "fecha_creacion": "2026-01-15",
                "simulated": True
            }
        )
    except Exception as e:
        return ToolResponse(success=False, data=None, error=str(e))


@app.post("/tools/mis_reservas")
async def mis_reservas(request: ToolRequest):
    """
    Tool de consulta: Ver todas las reservas del usuario actual
    """
    try:
        params = request.params
        usuario_id = params.get("usuario_id")
        
        print(f"📝 mis_reservas params: {params}")
        
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            # Obtener todas las reservas
            response = await client.get(f"{REST_API_URL}/reservas/")
            
            if response.status_code == 200:
                todas_reservas = response.json()
                
                # Filtrar por usuario si se proporcionó
                if usuario_id:
                    reservas = [r for r in todas_reservas if r.get("usuario_id") == usuario_id]
                else:
                    reservas = todas_reservas
                
                # Obtener nombres de tours para cada reserva
                tours_response = await client.get(f"{REST_API_URL}/tours/")
                tours_map = {}
                if tours_response.status_code == 200:
                    tours = tours_response.json()
                    tours_map = {t.get("id"): t.get("nombre", "Tour") for t in tours}
                
                # Formatear reservas con nombres legibles y números para el usuario
                reservas_formateadas = []
                for i, r in enumerate(reservas, 1):
                    tour_nombre = tours_map.get(r.get("tour_id"), "Tour desconocido")
                    reservas_formateadas.append({
                        "numero": i,  # Número amigable para el usuario
                        "id": r.get("id"),
                        "tour": tour_nombre,
                        "fecha": r.get("fecha_reserva", "")[:10],
                        "personas": r.get("cantidad_personas"),
                        "estado": r.get("estado"),
                        "precio": r.get("precio_total")
                    })
                
                if not reservas_formateadas:
                    return ToolResponse(
                        success=True,
                        data={
                            "mensaje": "No tienes reservas activas",
                            "reservas": []
                        }
                    )
                
                # Mensaje con instrucciones claras para el usuario
                return ToolResponse(
                    success=True,
                    data={
                        "reservas": reservas_formateadas,
                        "total": len(reservas_formateadas),
                        "mensaje": f"Tienes {len(reservas_formateadas)} reserva(s). Para cancelar, di 'cancelar la reserva 1' o 'cancelar la del tour [nombre]'"
                    }
                )
            else:
                return ToolResponse(
                    success=False,
                    data=None,
                    error=f"Error al obtener reservas: {response.status_code}"
                )
                
    except httpx.ConnectError:
        return ToolResponse(
            success=False,
            data=None,
            error="No se pudo conectar con el servidor"
        )
    except Exception as e:
        return ToolResponse(success=False, data=None, error=str(e))


@app.post("/tools/buscar_guias")
async def buscar_guias(request: ToolRequest):
    """
    Tool de consulta: Buscar guías turísticos
    """
    try:
        params = request.params
        especialidad = params.get("especialidad")
        ubicacion = params.get("ubicacion")
        
        # Llamar a REST API
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            filters = {}
            if especialidad:
                filters["especialidad"] = especialidad
            if ubicacion:
                filters["ubicacion"] = ubicacion
            
            response = await client.get(f"{REST_API_URL}/guias/", params=filters)
            
            if response.status_code == 200:
                guias = response.json()
                return ToolResponse(
                    success=True,
                    data={
                        "guias": guias[:10],
                        "total": len(guias)
                    }
                )
            else:
                return ToolResponse(
                    success=False,
                    data=None,
                    error=f"Error al buscar guías: {response.status_code}"
                )
                
    except httpx.ConnectError:
        # Simular respuesta
        return ToolResponse(
            success=True,
            data={
                "guias": [
                    {
                        "id": 1,
                        "nombre": "Juan Pérez",
                        "especialidad": "tours arqueológicos",
                        "ubicacion": "Cusco",
                        "idiomas": ["Español", "Inglés", "Quechua"],
                        "rating": 4.8,
                        "experiencia_años": 10,
                        "disponible": True
                    },
                    {
                        "id": 2,
                        "nombre": "María García",
                        "especialidad": "ecoturismo",
                        "ubicacion": "Madre de Dios",
                        "idiomas": ["Español", "Inglés"],
                        "rating": 4.9,
                        "experiencia_años": 8,
                        "disponible": True
                    },
                    {
                        "id": 3,
                        "nombre": "Carlos Quispe",
                        "especialidad": "trekking",
                        "ubicacion": "Arequipa",
                        "idiomas": ["Español", "Inglés", "Francés"],
                        "rating": 4.7,
                        "experiencia_años": 12,
                        "disponible": False
                    }
                ],
                "total": 3,
                "simulated": True
            }
        )
    except Exception as e:
        return ToolResponse(success=False, data=None, error=str(e))


# ==================== TOOLS DE ACCIÓN ====================

@app.post("/tools/crear_reserva")
async def crear_reserva(request: ToolRequest):
    """
    Tool de acción: Crear una nueva reserva
    """
    try:
        params = request.params
        destino_id = params.get("destino_id")
        fecha = params.get("fecha")
        personas = params.get("personas", 1)
        usuario_id = params.get("usuario_id", "1")
        
        print(f"📝 crear_reserva params: {params}")
        
        if not destino_id or not fecha:
            return ToolResponse(
                success=False,
                data=None,
                error="Se requieren destino_id y fecha"
            )
        
        # Convertir personas a int si viene como string
        try:
            personas_int = int(personas)
        except (ValueError, TypeError):
            personas_int = 1
            
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            # Primero buscar el tour asociado al destino
            tours_response = await client.get(f"{REST_API_URL}/tours/")
            tour_id = destino_id  # Fallback al destino_id
            precio_tour = 50.0  # Precio por defecto
            nombre_tour = "Tour"
            
            if tours_response.status_code == 200:
                tours = tours_response.json()
                # Buscar tour que tenga este destino_id
                for tour in tours:
                    if tour.get("destino_id") == destino_id:
                        tour_id = tour.get("id")
                        precio_tour = float(tour.get("precio", 50.0))
                        nombre_tour = tour.get("nombre", "Tour")
                        print(f"✅ Tour encontrado: {nombre_tour} (ID: {tour_id})")
                        break
            
            # El modelo Reserva espera: tour_id, cantidad_personas, fecha_reserva
            payload = {
                "tour_id": tour_id,
                "cantidad_personas": personas_int,
                "fecha_reserva": f"{fecha}T00:00:00",
                "usuario_id": str(usuario_id),
                "estado": "pendiente",
                "precio_total": float(personas_int * precio_tour)
            }
            
            print(f"📤 Enviando a REST API: {payload}")
            
            response = await client.post(
                f"{REST_API_URL}/reservas/",
                json=payload
            )
            
            print(f"📥 REST API respuesta: {response.status_code} - {response.text}")
            
            if response.status_code in [200, 201]:
                reserva = response.json()
                return ToolResponse(
                    success=True,
                    data={
                        "reserva": reserva,
                        "tour_nombre": nombre_tour,
                        "mensaje": f"Reserva creada exitosamente para {nombre_tour}"
                    }
                )
            else:
                return ToolResponse(
                    success=False,
                    data=None,
                    error=f"Error al crear reserva: {response.status_code}"
                )
                
    except httpx.ConnectError:
        # Simular respuesta
        reserva_id = f"RES-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        return ToolResponse(
            success=True,
            data={
                "reserva": {
                    "reserva_id": reserva_id,
                    "destino_id": destino_id,
                    "fecha": fecha,
                    "personas": personas,
                    "estado": "pendiente_pago",
                    "total": float(personas) * 150.00,
                    "fecha_creacion": datetime.now().isoformat()
                },
                "mensaje": "Reserva creada exitosamente (simulado)",
                "simulated": True
            }
        )
    except Exception as e:
        return ToolResponse(success=False, data=None, error=str(e))


@app.post("/tools/cancelar_reserva")
async def cancelar_reserva(request: ToolRequest):
    """
    Tool de acción: Cancelar una reserva existente
    """
    try:
        params = request.params
        reserva_id = params.get("reserva_id")
        
        print(f"📝 cancelar_reserva params: {params}")
        
        if not reserva_id:
            return ToolResponse(
                success=False,
                data=None,
                error="Se requiere reserva_id"
            )
        
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            # Actualizar estado de la reserva a 'cancelada'
            payload = {"estado": "cancelada"}
            
            response = await client.put(
                f"{REST_API_URL}/reservas/{reserva_id}",
                json=payload
            )
            
            print(f"📥 REST API respuesta: {response.status_code}")
            
            if response.status_code == 200:
                reserva = response.json()
                return ToolResponse(
                    success=True,
                    data={
                        "reserva": reserva,
                        "mensaje": f"Reserva {reserva_id} cancelada exitosamente"
                    }
                )
            elif response.status_code == 404:
                return ToolResponse(
                    success=False,
                    data=None,
                    error=f"Reserva {reserva_id} no encontrada"
                )
            else:
                return ToolResponse(
                    success=False,
                    data=None,
                    error=f"Error al cancelar reserva: {response.status_code}"
                )
                
    except httpx.ConnectError:
        return ToolResponse(
            success=False,
            data=None,
            error="No se pudo conectar con el servidor de reservas"
        )
    except Exception as e:
        return ToolResponse(success=False, data=None, error=str(e))


# ==================== TOOLS DE REPORTE ====================

@app.post("/tools/estadisticas_ventas")
async def estadisticas_ventas(request: ToolRequest):
    """
    Tool de reporte: Generar estadísticas de ventas basadas en reservas reales
    """
    try:
        params = request.params
        fecha_inicio = params.get("fecha_inicio", (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"))
        fecha_fin = params.get("fecha_fin", datetime.now().strftime("%Y-%m-%d"))
        
        # Obtener todas las reservas del sistema
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(f"{REST_API_URL}/reservas/")
            
            if response.status_code == 200:
                reservas = response.json()
                
                # Calcular estadísticas reales
                total_reservas = len(reservas)
                total_ingresos = sum(float(r.get("precio_total", 0)) for r in reservas)
                total_personas = sum(int(r.get("cantidad_personas", 0)) for r in reservas)
                promedio = total_ingresos / total_reservas if total_reservas > 0 else 0
                
                # Agrupar por estado
                estados = {}
                for r in reservas:
                    estado = r.get("estado", "desconocido")
                    estados[estado] = estados.get(estado, 0) + 1
                
                return ToolResponse(
                    success=True,
                    data={
                        "periodo": {
                            "fecha_inicio": fecha_inicio,
                            "fecha_fin": fecha_fin
                        },
                        "resumen": {
                            "total_reservas": total_reservas,
                            "ingresos_totales": round(total_ingresos, 2),
                            "promedio_por_reserva": round(promedio, 2),
                            "total_personas": total_personas
                        },
                        "reservas_por_estado": estados,
                        "ultimas_reservas": reservas[-5:] if len(reservas) > 5 else reservas
                    }
                )
            else:
                return ToolResponse(
                    success=False,
                    data=None,
                    error=f"Error al obtener reservas: {response.status_code}"
                )
                
    except httpx.ConnectError:
        # Simular respuesta
        return ToolResponse(
            success=True,
            data={
                "periodo": {
                    "fecha_inicio": fecha_inicio,
                    "fecha_fin": fecha_fin
                },
                "resumen": {
                    "total_reservas": 45,
                    "ingresos_totales": 6750.00,
                    "promedio_por_reserva": 150.00,
                    "total_personas": 98
                },
                "destinos_populares": [
                    {"nombre": "Machu Picchu", "reservas": 18, "ingresos": 2700.00},
                    {"nombre": "Lago Titicaca", "reservas": 12, "ingresos": 1440.00},
                    {"nombre": "Líneas de Nazca", "reservas": 10, "ingresos": 1440.00},
                    {"nombre": "Valle Sagrado", "reservas": 5, "ingresos": 1170.00}
                ],
                "ventas_por_dia": [
                    {"fecha": "2026-01-15", "reservas": 3, "ingresos": 450.00},
                    {"fecha": "2026-01-16", "reservas": 5, "ingresos": 750.00},
                    {"fecha": "2026-01-17", "reservas": 2, "ingresos": 300.00}
                ],
                "simulated": True
            }
        )
    except Exception as e:
        return ToolResponse(success=False, data=None, error=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "MCP Server"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)
