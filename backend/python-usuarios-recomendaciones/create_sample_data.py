import sqlite3

def create_sample_data():
    """Crear datos de muestra en la base de datos SQLite"""
    try:
        # Conectar a la base de datos
        conn = sqlite3.connect('recomendaciones_dev.db')
        cursor = conn.cursor()
        
        # Verificar si la tabla existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='destinos';")
        if not cursor.fetchone():
            print("Tabla destinos no existe, creándola...")
            cursor.execute('''
                CREATE TABLE destinos (
                    id_destino INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre VARCHAR(255),
                    descripcion VARCHAR(1000),
                    ubicacion VARCHAR(255),
                    ruta VARCHAR(500),
                    provincia VARCHAR(100),
                    ciudad VARCHAR(100),
                    categoria VARCHAR(100),
                    calificacion_promedio FLOAT DEFAULT 0.0,
                    activo BOOLEAN DEFAULT TRUE,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
        
        # Limpiar datos existentes
        cursor.execute("DELETE FROM destinos")
        
        # Insertar destinos de muestra
        destinos = [
            ("Quito Centro Histórico", "El centro histórico más grande de América", "Centro de Quito", "/quito-centro", "Pichincha", "Quito", "cultural", 4.8),
            ("Islas Galápagos", "Paraíso natural único en el mundo", "Islas Galápagos", "/galapagos", "Galápagos", "Puerto Ayora", "natural", 4.9),
            ("Baños de Agua Santa", "Destino de aventura y relajación", "Baños", "/banos", "Tungurahua", "Baños", "aventura", 4.7),
            ("Otavalo", "Mercado indígena más famoso del Ecuador", "Otavalo", "/otavalo", "Imbabura", "Otavalo", "cultural", 4.6),
            ("Montañita", "Playa para surf y vida nocturna", "Montañita", "/montanita", "Santa Elena", "Montañita", "playa", 4.4)
        ]
        
        for destino in destinos:
            cursor.execute('''
                INSERT INTO destinos (nombre, descripcion, ubicacion, ruta, provincia, ciudad, categoria, calificacion_promedio, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
            ''', destino)
        
        conn.commit()
        print(f"✅ Se insertaron {len(destinos)} destinos correctamente")
        
        # Verificar los datos
        cursor.execute("SELECT COUNT(*) FROM destinos")
        count = cursor.fetchone()[0]
        print(f"📊 Total de destinos en la base: {count}")
        
        cursor.execute("SELECT id_destino, nombre, ciudad, categoria FROM destinos LIMIT 3")
        sample = cursor.fetchall()
        print("📍 Muestra de destinos:")
        for row in sample:
            print(f"  - {row[1]} ({row[2]}, {row[3]})")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_sample_data()