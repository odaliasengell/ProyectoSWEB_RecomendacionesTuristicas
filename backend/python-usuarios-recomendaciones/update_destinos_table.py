from app.database import engine
import sqlite3

def update_destinos_table():
    """Actualizar tabla de destinos con nuevas columnas"""
    print("[INFO] Actualizando tabla de destinos...")
    
    # Conectar directamente a SQLite
    conn = sqlite3.connect('recomendaciones_turisticas.db')
    cursor = conn.cursor()
    
    try:
        # Verificar columnas existentes
        cursor.execute("PRAGMA table_info(destinos)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"[INFO] Columnas existentes: {columns}")
        
        # Agregar columnas nuevas si no existen
        new_columns = [
            ('provincia', 'VARCHAR(100)'),
            ('ciudad', 'VARCHAR(100)'),
            ('categoria', 'VARCHAR(100)'),
            ('calificacion_promedio', 'FLOAT DEFAULT 0.0'),
            ('activo', 'BOOLEAN DEFAULT TRUE'),
            ('fecha_creacion', 'DATETIME DEFAULT CURRENT_TIMESTAMP')
        ]
        
        for col_name, col_type in new_columns:
            if col_name not in columns:
                try:
                    sql = f"ALTER TABLE destinos ADD COLUMN {col_name} {col_type}"
                    cursor.execute(sql)
                    print(f"[OK] Columna {col_name} agregada")
                except sqlite3.OperationalError as e:
                    print(f"[WARNING] No se pudo agregar {col_name}: {e}")
        
        conn.commit()
        print("[OK] Tabla actualizada correctamente")
        
        # Agregar algunos destinos de muestra
        cursor.execute("SELECT COUNT(*) FROM destinos")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("[INFO] Agregando destinos de muestra...")
            destinos_muestra = [
                ("Quito Centro Histórico", "El centro histórico más grande de América", "Centro de Quito", "/quito-centro", "Pichincha", "Quito", "cultural", 4.8),
                ("Islas Galápagos", "Paraíso natural único en el mundo", "Islas Galápagos", "/galapagos", "Galápagos", "Puerto Ayora", "natural", 4.9),
                ("Baños de Agua Santa", "Destino de aventura y relajación", "Baños", "/banos", "Tungurahua", "Baños", "aventura", 4.7)
            ]
            
            for nombre, desc, ubic, ruta, prov, ciudad, cat, calif in destinos_muestra:
                cursor.execute("""
                    INSERT INTO destinos (nombre, descripcion, ubicacion, ruta, provincia, ciudad, categoria, calificacion_promedio, activo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
                """, (nombre, desc, ubic, ruta, prov, ciudad, cat, calif))
            
            conn.commit()
            print("[OK] Destinos de muestra agregados")
        else:
            print(f"[INFO] Ya existen {count} destinos en la base de datos")
            
    except Exception as e:
        print(f"[ERROR] Error actualizando tabla: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    update_destinos_table()