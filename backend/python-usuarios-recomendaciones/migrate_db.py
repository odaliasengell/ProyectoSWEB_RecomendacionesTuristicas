"""
Script para migrar la base de datos existente agregando las nuevas columnas
Ejecutar: python migrate_db.py
"""
import sqlite3
from datetime import datetime

def migrate_database():
    db_path = "recomendaciones_dev.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔧 Iniciando migración de base de datos...")
        
        # Verificar columnas existentes
        cursor.execute("PRAGMA table_info(usuarios)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"📋 Columnas actuales: {columns}")
        
        # Agregar nuevas columnas si no existen
        new_columns = [
            ("apellido", "VARCHAR(255) NOT NULL DEFAULT ''"),
            ("username", "VARCHAR(100) UNIQUE NOT NULL DEFAULT ''"),
            ("fecha_nacimiento", "DATE")
        ]
        
        for col_name, col_definition in new_columns:
            if col_name not in columns:
                try:
                    cursor.execute(f"ALTER TABLE usuarios ADD COLUMN {col_name} {col_definition}")
                    print(f"✅ Agregada columna: {col_name}")
                except sqlite3.Error as e:
                    print(f"❌ Error agregando {col_name}: {e}")
        
        # Actualizar registros existentes para llenar los campos requeridos
        cursor.execute("SELECT id_usuario, nombre, email FROM usuarios WHERE apellido = '' OR username = ''")
        usuarios_sin_datos = cursor.fetchall()
        
        for usuario in usuarios_sin_datos:
            id_usuario, nombre_completo, email = usuario
            
            # Dividir nombre completo en nombre y apellido
            nombres = nombre_completo.split(' ', 1)
            nombre = nombres[0]
            apellido = nombres[1] if len(nombres) > 1 else "Usuario"
            
            # Generar username único basado en email
            username_base = email.split('@')[0]
            username = username_base
            
            # Verificar si el username ya existe
            cursor.execute("SELECT COUNT(*) FROM usuarios WHERE username = ?", (username,))
            if cursor.fetchone()[0] > 0:
                username = f"{username_base}_{id_usuario}"
            
            # Actualizar el registro
            cursor.execute("""
                UPDATE usuarios 
                SET nombre = ?, apellido = ?, username = ? 
                WHERE id_usuario = ?
            """, (nombre, apellido, username, id_usuario))
            
            print(f"🔄 Actualizado usuario {id_usuario}: {nombre} {apellido} ({username})")
        
        conn.commit()
        print("✅ Migración completada exitosamente")
        
        # Mostrar estructura final
        cursor.execute("PRAGMA table_info(usuarios)")
        final_columns = cursor.fetchall()
        print("\n📋 Estructura final de la tabla usuarios:")
        for col in final_columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Mostrar usuarios actualizados
        cursor.execute("SELECT id_usuario, nombre, apellido, email, username FROM usuarios")
        usuarios = cursor.fetchall()
        print(f"\n👥 Total de usuarios: {len(usuarios)}")
        for usuario in usuarios:
            print(f"  {usuario[0]}. {usuario[1]} {usuario[2]} - {usuario[3]} ({usuario[4]})")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    migrate_database()