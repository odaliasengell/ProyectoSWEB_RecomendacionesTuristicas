"""
Servidor FastAPI simplificado para pruebas
"""
import sys
import os
import sqlite3
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Agregar el directorio actual al path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

app = FastAPI(title="API Turismo", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class DestinoResponse(BaseModel):
    id_destino: int
    nombre: str
    descripcion: str
    ubicacion: str
    ruta: str
    provincia: Optional[str] = None
    ciudad: Optional[str] = None
    categoria: Optional[str] = None
    calificacion_promedio: Optional[float] = 0.0
    activo: Optional[bool] = True

class GuiaResponse(BaseModel):
    id: int
    nombre: str
    especialidad: str
    telefono: str
    email: str

class TourResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str
    precio: float
    duracion: str

class ServicioResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str
    precio: float
    categoria: str

# Funciones de base de datos
def get_db_connection():
    """Obtener conexión a la base de datos"""
    db_path = current_dir / "recomendaciones_dev.db"
    return sqlite3.connect(str(db_path))

def dict_factory(cursor, row):
    """Convertir filas de SQLite a diccionarios"""
    d = {}
    for idx, col_desc in enumerate(cursor.description):
        d[col_desc[0]] = row[idx]
    return d

# Modelos para autenticación
class UserRegister(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    nombre_completo: Optional[str] = None
    name: Optional[str] = None  # Campo alternativo
    
    class Config:
        extra = "allow"  # Permitir campos adicionales

class UserLogin(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    contraseña: Optional[str] = None  # Campo alternativo para password
    
    class Config:
        extra = "allow"

# Rutas de la API
@app.get("/")
async def root():
    return {"message": "API de Turismo funcionando correctamente", "status": "OK"}

# Rutas de autenticación
@app.post("/auth/register")
async def register_user(user: UserRegister):
    """Registro de nuevos usuarios en la base de datos"""
    try:
        print(f"🔐 User register attempt - Data received: {user.dict()}")
        
        # Obtener datos del usuario
        nombre = user.nombre or user.name or ""
        email = user.email or ""
        contraseña = user.contraseña or user.password or ""
        pais = user.pais or ""
        username = user.username or email.split('@')[0] if email else ""
        
        print(f"📝 Registering user - Name: '{nombre}', Email: '{email}', Country: '{pais}'")
        
        if not nombre or not email or not contraseña:
            raise HTTPException(status_code=422, detail="Nombre, email y contraseña son requeridos")
        
        # Conectar a la base de datos
        conn = get_db_connection()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        # Verificar si el email ya existe
        cursor.execute("SELECT id_usuario FROM usuarios WHERE email = ?", (email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            conn.close()
            raise HTTPException(status_code=409, detail="El email ya está registrado")
        
        # Insertar nuevo usuario (sin hash por simplicidad, en producción usar bcrypt)
        cursor.execute("""
            INSERT INTO usuarios (nombre, email, contraseña, pais, username)
            VALUES (?, ?, ?, ?, ?)
        """, (nombre, email, contraseña, pais, username))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"✅ User registered successfully with ID: {user_id}")
        
        return {
            "message": "Usuario registrado exitosamente",
            "user_id": user_id,
            "username": username,
            "email": email,
            "nombre": nombre,
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error en register_user: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.post("/auth/login")
async def login_user(user: UserLogin):
    """Inicio de sesión de usuarios desde la base de datos"""
    try:
        print(f"🔐 User login attempt - Data received: {user.dict()}")
        
        # Obtener credenciales
        email = user.email or user.username or ""
        contraseña = user.contraseña or user.password or ""
        
        print(f"🔑 Login attempt - Email: '{email}'")
        
        if not email or not contraseña:
            raise HTTPException(status_code=422, detail="Email y contraseña son requeridos")
        
        # Conectar a la base de datos
        conn = get_db_connection()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        # Buscar usuario por email o username
        cursor.execute("""
            SELECT id_usuario, nombre, email, username, contraseña 
            FROM usuarios 
            WHERE email = ? OR username = ?
        """, (email, email))
        
        usuario = cursor.fetchone()
        conn.close()
        
        if not usuario or usuario['contraseña'] != contraseña:
            print(f"❌ Invalid credentials for email: {email}")
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        
        print(f"✅ User login successful: {usuario['email']}")
        
        return {
            "message": "Login exitoso",
            "access_token": f"user_token_{usuario['id_usuario']}_abc123",
            "user": {
                "id_usuario": usuario['id_usuario'],
                "id": usuario['id_usuario'],
                "nombre": usuario['nombre'],
                "email": usuario['email'],
                "username": usuario['username'] or usuario['email']
            },
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error en login_user: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.post("/admin/auth/login")
async def admin_login(user: UserLogin):
    """Inicio de sesión de administradores"""
    try:
        # Log para debug
        print(f"🔐 Admin login attempt - Data received: {user.dict()}")
        
        # Obtener username/email del usuario (puede venir en diferentes campos)
        username = user.username or user.email or ""
        password = user.password or user.contraseña or ""
        
        print(f"🔑 Validating - Username: '{username}', Password: '{password}'")
        
        # Validación básica de credenciales de admin
        if username == "admin" and password == "admin123":
            print("✅ Admin credentials validated successfully")
            return {
                "message": "Login de administrador exitoso",
                "token": "admin_token_67890",
                "user": {
                    "id": 1,
                    "username": "admin",
                    "email": "admin@turismo.com",
                    "role": "admin"
                },
                "admin": {
                    "id": 1,
                    "username": "admin",
                    "email": "admin@turismo.com",
                    "role": "admin",
                    "nombre": "Administrador Sistema"
                },
                "access_token": "admin_token_67890",
                "status": "success"
            }
        else:
            print(f"❌ Invalid admin credentials - Username: '{username}', Password: '{password}'")
            raise HTTPException(status_code=401, detail="Credenciales de administrador inválidas")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en admin_login: {e}")
        raise HTTPException(status_code=500, detail=f"Error en login de administrador: {str(e)}")

@app.get("/admin/turismo/destinos", response_model=List[DestinoResponse])
async def get_destinos():
    """Obtener todos los destinos turísticos"""
    try:
        conn = get_db_connection()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id_destino, nombre, descripcion, ubicacion, ruta, 
                   provincia, ciudad, categoria, calificacion_promedio, activo
            FROM destinos 
            WHERE activo = TRUE
            ORDER BY nombre
        """)
        
        destinos = cursor.fetchall()
        conn.close()
        
        return destinos
        
    except Exception as e:
        print(f"Error en get_destinos: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.get("/admin/turismo/guias", response_model=List[GuiaResponse])
async def get_guias():
    """Obtener todos los guías turísticos (datos de muestra)"""
    try:
        return [
            {"id": 1, "nombre": "Carlos Mendoza", "especialidad": "Historia", "telefono": "0987654321", "email": "carlos@example.com"},
            {"id": 2, "nombre": "Ana Rodríguez", "especialidad": "Naturaleza", "telefono": "0987654322", "email": "ana@example.com"},
            {"id": 3, "nombre": "Luis Torres", "especialidad": "Aventura", "telefono": "0987654323", "email": "luis@example.com"}
        ]
    except Exception as e:
        print(f"Error en get_guias: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.get("/admin/turismo/tours", response_model=List[TourResponse])
async def get_tours():
    """Obtener todos los tours disponibles (datos de muestra)"""
    try:
        return [
            {"id": 1, "nombre": "Tour Quito Colonial", "descripcion": "Recorrido por el centro histórico", "precio": 25.0, "duracion": "4 horas"},
            {"id": 2, "nombre": "Galápagos Express", "descripcion": "Tour de un día en Galápagos", "precio": 150.0, "duracion": "1 día"},
            {"id": 3, "nombre": "Aventura en Baños", "descripcion": "Deportes extremos y relajación", "precio": 45.0, "duracion": "6 horas"}
        ]
    except Exception as e:
        print(f"Error en get_tours: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.get("/admin/turismo/servicios", response_model=List[ServicioResponse])
async def get_servicios():
    """Obtener todos los servicios disponibles (datos de muestra)"""
    try:
        return [
            {"id": 1, "nombre": "Transporte Turístico", "descripcion": "Servicio de transporte especializado", "precio": 30.0, "categoria": "transporte"},
            {"id": 2, "nombre": "Alojamiento Rural", "descripcion": "Hospedaje en comunidades locales", "precio": 35.0, "categoria": "hospedaje"},
            {"id": 3, "nombre": "Comida Típica", "descripcion": "Experiencia gastronómica ecuatoriana", "precio": 15.0, "categoria": "gastronomia"}
        ]
    except Exception as e:
        print(f"Error en get_servicios: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Endpoint de salud
@app.get("/health")
async def health_check():
    """Verificar el estado del servidor"""
    try:
        # Verificar conexión a base de datos
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM destinos")
        count = cursor.fetchone()[0]
        conn.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "destinos_count": count,
            "message": "Servidor funcionando correctamente"
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e)
        }

# Endpoints del panel de administración
@app.get("/admin/panel/stats")
async def get_admin_stats():
    """Obtener estadísticas reales para el panel de admin"""
    try:
        # Obtener datos de la base de datos
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Contar usuarios reales
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        total_usuarios = cursor.fetchone()[0]
        
        # Contar destinos
        cursor.execute("SELECT COUNT(*) FROM destinos WHERE activo = TRUE")
        total_destinos = cursor.fetchone()[0]
        
        # Contar recomendaciones
        cursor.execute("SELECT COUNT(*) FROM recomendaciones")
        total_recomendaciones = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "total_usuarios": total_usuarios,
            "total_destinos": total_destinos,
            "total_guias": 15,      # Datos de muestra (no hay tabla de guías)
            "total_tours": 28,      # Datos de muestra (no hay tabla de tours)
            "total_servicios": 42,  # Datos de muestra (no hay tabla de servicios)
            "total_administradores": 1,
            "total_recomendaciones": total_recomendaciones,
            "reservas_hoy": 12,     # Datos de muestra
            "ingresos_mes": 15420.50  # Datos de muestra
        }
    except Exception as e:
        print(f"❌ Error en get_admin_stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.get("/admin/panel/users")
async def get_admin_users():
    """Obtener lista de usuarios reales de la base de datos para el panel de admin"""
    try:
        # Conectar a la base de datos
        conn = get_db_connection()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        # Obtener todos los usuarios
        cursor.execute("""
            SELECT id_usuario, nombre, email, pais, username,
                   datetime('now') as fecha_registro,
                   1 as activo
            FROM usuarios 
            ORDER BY id_usuario DESC
        """)
        
        usuarios = cursor.fetchall()
        conn.close()
        
        # Formatear datos para el admin
        usuarios_formatted = []
        for user in usuarios:
            usuarios_formatted.append({
                "id": user['id_usuario'],
                "nombre": user['nombre'] or 'Sin nombre',
                "email": user['email'],
                "pais": user['pais'] or 'No especificado',
                "username": user['username'] or user['email'].split('@')[0],
                "fecha_registro": user['fecha_registro'][:10],  # Solo la fecha
                "activo": bool(user['activo'])
            })
        
        print(f"📊 Returning {len(usuarios_formatted)} users to admin panel")
        return usuarios_formatted
        
    except Exception as e:
        print(f"❌ Error en get_admin_users: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor FastAPI...")
    print("📊 Base de datos: SQLite")
    print("🌐 CORS habilitado para todos los orígenes")
    print("📍 Endpoints disponibles:")
    print("  - POST /auth/register")
    print("  - POST /auth/login")
    print("  - POST /admin/auth/login")
    print("  - GET /admin/panel/stats")
    print("  - GET /admin/panel/users")
    print("  - GET /admin/turismo/destinos")
    print("  - GET /admin/turismo/guias")
    print("  - GET /admin/turismo/tours")
    print("  - GET /admin/turismo/servicios")
    print("  - GET /health")
    
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)