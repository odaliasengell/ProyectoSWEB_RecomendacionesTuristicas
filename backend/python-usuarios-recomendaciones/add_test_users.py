import sqlite3

def add_test_users():
    """Agregar algunos usuarios de prueba si no existen"""
    try:
        conn = sqlite3.connect('recomendaciones_dev.db')
        cursor = conn.cursor()
        
        # Verificar usuarios existentes
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("📝 Agregando usuarios de prueba...")
            
            usuarios_prueba = [
                ("Carlos Mendoza", "carlos@example.com", "123456", "Ecuador", "carlos_m"),
                ("Ana García", "ana@example.com", "123456", "Perú", "ana_g"),
                ("Luis Torres", "luis@example.com", "123456", "Colombia", "luis_t"),
                ("María López", "maria@example.com", "123456", "Ecuador", "maria_l")
            ]
            
            for usuario in usuarios_prueba:
                cursor.execute("""
                    INSERT INTO usuarios (nombre, email, contraseña, pais, username)
                    VALUES (?, ?, ?, ?, ?)
                """, usuario)
            
            conn.commit()
            print(f"✅ Se agregaron {len(usuarios_prueba)} usuarios de prueba")
        else:
            print(f"ℹ️  Ya existen {count} usuarios en la base de datos")
        
        # Mostrar usuarios actuales
        cursor.execute("SELECT id_usuario, nombre, email, pais FROM usuarios")
        usuarios = cursor.fetchall()
        
        print("\n👥 Usuarios en la base de datos:")
        for user in usuarios:
            print(f"  {user[0]}: {user[1]} ({user[2]}) - {user[3]}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_test_users()