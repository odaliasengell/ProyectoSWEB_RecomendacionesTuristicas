from app.database import engine, Base
from app.models.usuario import Usuario
from app.models.administrador import Administrador
from app.models.destino import Destino

def setup_destinos_table():
    """Crear tabla de destinos"""
    print("[INFO] Creando tabla de destinos...")
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    print("[OK] Tabla de destinos creada correctamente")
    
    # Agregar algunos destinos de ejemplo
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Verificar si ya existen destinos
        existing = db.query(Destino).first()
        if not existing:
            destinos_ejemplo = [
                {
                    "nombre": "Galápagos",
                    "descripcion": "Archipiélago volcánico famoso por su biodiversidad única",
                    "provincia": "Galápagos",
                    "ciudad": "Puerto Ayora",
                    "categoria": "isla",
                    "latitud": -0.7431,
                    "longitud": -90.3167,
                    "calificacion_promedio": 4.8
                },
                {
                    "nombre": "Machu Picchu",
                    "descripcion": "Ciudadela inca en las montañas de los Andes",
                    "provincia": "Cusco",
                    "ciudad": "Aguas Calientes",
                    "categoria": "montaña",
                    "latitud": -13.1631,
                    "longitud": -72.5450,
                    "calificacion_promedio": 4.9
                },
                {
                    "nombre": "Centro Histórico de Quito",
                    "descripcion": "Patrimonio Cultural de la Humanidad con arquitectura colonial",
                    "provincia": "Pichincha",
                    "ciudad": "Quito",
                    "categoria": "ciudad",
                    "latitud": -0.2201,
                    "longitud": -78.5123,
                    "calificacion_promedio": 4.5
                },
                {
                    "nombre": "Playa de Atacames",
                    "descripcion": "Hermosa playa en la costa ecuatoriana",
                    "provincia": "Esmeraldas",
                    "ciudad": "Atacames",
                    "categoria": "playa",
                    "latitud": 0.8703,
                    "longitud": -79.8456,
                    "calificacion_promedio": 4.2
                }
            ]
            
            for destino_data in destinos_ejemplo:
                destino = Destino(**destino_data)
                db.add(destino)
            
            db.commit()
            print(f"[OK] Agregados {len(destinos_ejemplo)} destinos de ejemplo")
        else:
            print("[INFO] Los destinos ya existen en la base de datos")
            
    except Exception as e:
        print(f"[ERROR] Error agregando destinos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    setup_destinos_table()