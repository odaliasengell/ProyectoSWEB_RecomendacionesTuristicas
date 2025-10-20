import sqlite3

def check_existing_tables():
    """Verificar las tablas existentes en la base de datos"""
    try:
        conn = sqlite3.connect('recomendaciones_dev.db')
        cursor = conn.cursor()
        
        # Listar todas las tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("📋 Tablas existentes en la base de datos:")
        for table in tables:
            print(f"  - {table[0]}")
            
        # Ver estructura de cada tabla
        for table in tables:
            table_name = table[0]
            print(f"\n🔍 Estructura de la tabla '{table_name}':")
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
                
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_existing_tables()