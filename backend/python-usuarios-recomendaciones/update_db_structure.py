import sqlite3

def update_destinos_table():
    """Actualizar la tabla destinos con las nuevas columnas"""
    try:
        conn = sqlite3.connect('recomendaciones_dev.db')
        cursor = conn.cursor()
        
        # Verificar si existen las nuevas columnas
        cursor.execute("PRAGMA table_info(destinos);")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Columnas existentes: {columns}")
        
        # Lista de columnas que necesitamos
        new_columns = [
            ('provincia', 'VARCHAR(100)'),
            ('ciudad', 'VARCHAR(100)'),
            ('categoria', 'VARCHAR(100)'),
            ('calificacion_promedio', 'FLOAT DEFAULT 0.0')
        ]
        
        # Agregar columnas faltantes
        for column_name, column_type in new_columns:
            if column_name not in columns:
                cursor.execute(f"ALTER TABLE destinos ADD COLUMN {column_name} {column_type}")
                print(f"✅ Agregada columna: {column_name}")
            else:
                print(f"⚠️  Columna ya existe: {column_name}")
        
        # Insertar datos de muestra solo si la tabla está vacía
        cursor.execute("SELECT COUNT(*) FROM destinos")
        count = cursor.fetchone()[0]
        
        if count == 0:
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
            
            print(f"✅ Se insertaron {len(destinos)} destinos")
        else:
            print(f"⚠️  Ya existen {count} destinos en la tabla")
        
        conn.commit()
        
        # Verificar estructura final
        cursor.execute("PRAGMA table_info(destinos);")
        final_columns = cursor.fetchall()
        print("\n📋 Estructura final de la tabla:")
        for col in final_columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Mostrar algunos datos
        cursor.execute("SELECT nombre, ciudad, categoria FROM destinos LIMIT 3")
        sample = cursor.fetchall()
        print("\n📍 Destinos de muestra:")
        for row in sample:
            print(f"  - {row[0]} ({row[1]}, {row[2]})")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    update_destinos_table()