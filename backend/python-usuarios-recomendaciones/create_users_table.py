import sqlite3

def create_users_table():
    """Crear tabla de usuarios en la base de datos"""
    try:
        conn = sqlite3.connect('recomendaciones_dev.db')
        cursor = conn.cursor()
        
        # Crear tabla usuarios si no existe
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                contraseña VARCHAR(255) NOT NULL,
                pais VARCHAR(100),
                role VARCHAR(50) DEFAULT 'user',
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                activo BOOLEAN DEFAULT TRUE
            )
        ''')
        
        conn.commit()
        print("✅ Tabla usuarios creada correctamente")
        
        # Verificar estructura
        cursor.execute("PRAGMA table_info(usuarios);")
        columns = cursor.fetchall()
        print("\n📋 Estructura de la tabla usuarios:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_users_table()