"""
Script para inicializar la base de datos SQLite
Ejecutar: python init_db.py
"""
from app.database import init_db, engine
from app.models.usuario import Usuario
from app.models.destino import Destino
from app.models.recomendacion import Recomendacion

def main():
    print("🔧 Inicializando base de datos...")
    
    # Crear todas las tablas
    init_db()
    
    print("✅ Base de datos inicializada correctamente")
    print(f"📍 Base de datos: {engine.url}")
    print("\nTablas creadas:")
    print("  - usuarios")
    print("  - destinos")
    print("  - recomendaciones")

if __name__ == "__main__":
    main()
