"""
Script de prueba para el servidor WebSocket

Este script envía múltiples notificaciones de prueba al servidor WebSocket
para verificar que funciona correctamente.

Uso:
    python test_websocket.py
"""

import requests
import time
import json

WEBSOCKET_URL = "http://localhost:8080/notify"

# Eventos de prueba
eventos_prueba = [
    {
        "type": "usuario_registrado",
        "message": "Nuevo usuario: Juan Pérez",
        "data": {
            "userId": "user001",
            "nombre": "Juan Pérez",
            "email": "juan@example.com",
            "rol": "turista"
        }
    },
    {
        "type": "usuario_inicio_sesion",
        "message": "María González ha iniciado sesión",
        "data": {
            "userId": "user002",
            "nombre": "María González",
            "rol": "turista"
        }
    },
    {
        "type": "reserva_creada",
        "message": "Nueva reserva para Tour Machu Picchu",
        "data": {
            "reservaId": "res001",
            "tourId": "tour001",
            "tourNombre": "Machu Picchu 3 días",
            "usuarioId": "user001",
            "usuarioNombre": "Juan Pérez",
            "fecha": "2025-12-25",
            "personas": 2
        }
    },
    {
        "type": "servicio_contratado",
        "message": "Servicio contratado: Guía turístico privado",
        "data": {
            "contratacionId": "cont001",
            "servicioId": "serv001",
            "servicioNombre": "Guía turístico privado",
            "usuarioId": "user002",
            "usuarioNombre": "María González"
        }
    },
    {
        "type": "recomendacion_creada",
        "message": "Nueva recomendación: Excelente tour (⭐ 5/5)",
        "data": {
            "recomendacionId": "rec001",
            "titulo": "Excelente tour",
            "usuarioId": "user001",
            "usuarioNombre": "Juan Pérez",
            "calificacion": 5
        }
    },
    {
        "type": "tour_creado",
        "message": "Nuevo tour disponible: Aventura en Cusco",
        "data": {
            "tourId": "tour002",
            "nombre": "Aventura en Cusco",
            "destino": "Cusco, Perú",
            "precio": 1200.50
        }
    },
    {
        "type": "servicio_creado",
        "message": "Nuevo servicio disponible: Transporte privado",
        "data": {
            "servicioId": "serv002",
            "nombre": "Transporte privado",
            "tipo": "Transporte",
            "precio": 150.00
        }
    },
    {
        "type": "destino_creado",
        "message": "Nuevo destino agregado: Lima, Lima",
        "data": {
            "destinoId": "dest001",
            "nombre": "Lima",
            "pais": "Perú",
            "estado": "Lima"
        }
    },
    {
        "type": "guia_creado",
        "message": "Nuevo guía disponible: Carlos Ruiz - Historia",
        "data": {
            "guiaId": "guia001",
            "nombre": "Carlos Ruiz",
            "especialidad": "Historia y Arqueología",
            "idiomas": ["Español", "Inglés", "Quechua"]
        }
    }
]


def enviar_notificacion(evento):
    """Envía una notificación al servidor WebSocket"""
    try:
        response = requests.post(
            WEBSOCKET_URL,
            json=evento,
            timeout=5
        )
        
        if response.status_code == 200:
            print(f"✅ Enviado: [{evento['type']}] {evento['message']}")
            return True
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar al servidor WebSocket")
        print("   ¿El servidor está corriendo en http://localhost:8080?")
        return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    print("=" * 60)
    print("🧪 Script de Prueba - WebSocket Server")
    print("=" * 60)
    print()
    print("Este script enviará notificaciones de prueba al servidor.")
    print("Asegúrate de que el servidor WebSocket esté corriendo.")
    print()
    
    input("Presiona Enter para comenzar...")
    print()
    
    exitos = 0
    fallos = 0
    
    for i, evento in enumerate(eventos_prueba, 1):
        print(f"\n[{i}/{len(eventos_prueba)}] Enviando notificación...")
        
        if enviar_notificacion(evento):
            exitos += 1
        else:
            fallos += 1
        
        # Esperar un poco entre notificaciones
        if i < len(eventos_prueba):
            time.sleep(2)
    
    print()
    print("=" * 60)
    print("📊 Resultados:")
    print(f"   ✅ Exitosas: {exitos}")
    print(f"   ❌ Fallidas: {fallos}")
    print(f"   📈 Total: {len(eventos_prueba)}")
    print("=" * 60)
    print()
    
    if fallos == 0:
        print("🎉 ¡Todas las notificaciones se enviaron correctamente!")
    else:
        print("⚠️ Algunas notificaciones fallaron. Verifica el servidor.")
    print()


if __name__ == "__main__":
    main()
