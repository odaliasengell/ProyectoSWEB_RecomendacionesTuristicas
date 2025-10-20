"""
Script para agregar tabla de administradores y crear admin por defecto
"""
import sqlite3
import hashlib
from datetime import datetime

def create_admin_table_and_user():
    db_path = "recomendaciones_dev.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("[INFO] Creando tabla de administradores...")
        
        # Crear tabla de administradores
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS administradores (
                id_admin INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) UNIQUE NOT NULL,
                contraseña VARCHAR(255) NOT NULL,
                activo BOOLEAN DEFAULT 1,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                ultimo_acceso DATETIME
            )
        """)
        
        print("[OK] Tabla administradores creada")
        
        # Verificar si ya existe un admin
        cursor.execute("SELECT COUNT(*) FROM administradores")
        admin_count = cursor.fetchone()[0]
        
        if admin_count == 0:
            # Crear administrador por defecto
            admin_password = "admin123"
            hashed_password = hashlib.sha256(admin_password.encode()).hexdigest()
            
            cursor.execute("""
                INSERT INTO administradores (nombre, email, username, contraseña)
                VALUES (?, ?, ?, ?)
            """, ("Administrador Principal", "admin@exploraecuador.com", "admin", hashed_password))
            
            print("[OK] Administrador por defecto creado:")
            print("  Username: admin")
            print("  Password: admin123")
            print("  Email: admin@exploraecuador.com")
        else:
            print(f"[INFO] Ya existen {admin_count} administradores")
        
        conn.commit()
        
        # Mostrar administradores
        cursor.execute("SELECT id_admin, nombre, email, username, activo FROM administradores")
        admins = cursor.fetchall()
        
        print(f"\n[INFO] Administradores registrados: {len(admins)}")
        for admin in admins:
            status = "Activo" if admin[4] else "Inactivo"
            print(f"  {admin[0]}. {admin[1]} - {admin[2]} ({admin[3]}) - {status}")
        
        conn.close()
        print("\n[OK] Configuración de administradores completada")
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    create_admin_table_and_user()