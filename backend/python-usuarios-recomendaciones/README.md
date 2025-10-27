# API de Usuarios y Recomendaciones Turísticas

Este es un microservicio desarrollado en Python con FastAPI para gestionar usuarios, destinos y recomendaciones turísticas.

## Características

- 🚀 FastAPI para API REST moderna y rápida
- 🗄️ **MongoDB** con **Beanie ODM** para gestión de base de datos NoSQL
- 🔐 Autenticación JWT con bcrypt para seguridad de contraseñas
- 📊 Esquemas Pydantic para validación de datos
- 🏗️ Arquitectura hexagonal con separación de capas (models, repositories, services, routes)
- ⚡ Motor driver para operaciones asíncronas con MongoDB

## Estructura del Proyecto

```
python-usuarios-recomendaciones/
├── app/
│   ├── config/
│   │   └── settings.py          # Configuración de la aplicación
│   ├── models/                  # Modelos Beanie (MongoDB)
│   │   ├── usuario.py
│   │   ├── destino.py
│   │   └── recomendacion.py
│   ├── schemas/                 # Esquemas Pydantic
│   │   ├── usuario_schema.py
│   │   ├── destino_schema.py
│   │   └── recomendacion_schema.py
│   ├── repositories/            # Capa de acceso a datos
│   │   ├── usuario_repo.py
│   │   ├── destino_repo.py
│   │   └── recomendacion_repo.py
│   ├── services/                # Lógica de negocio
│   │   ├── usuario_service.py
│   │   ├── destino_service.py
│   │   ├── recomendacion_service.py
│   │   └── auth_service.py
│   ├── routes/                  # Endpoints de la API
│   │   ├── usuario_routes.py
│   │   ├── destino_routes.py
│   │   ├── recomendacion_routes.py
│   │   └── auth_routes.py
│   ├── middlewares/
│   │   └── auth_middleware.py   # Middleware de autenticación JWT
│   ├── utils/
│   │   ├── jwt_utils.py         # Utilidades para JWT
│   │   └── http_client.py       # Cliente HTTP para llamadas externas
│   ├── database.py              # Configuración de MongoDB
│   └── main.py                  # Punto de entrada de la aplicación
├── tests/                       # Tests unitarios e integración
├── requirements.txt             # Dependencias Python
├── Dockerfile                   # Configuración Docker
└── README.md                    # Este archivo
```

## Instalación y Configuración

### Prerrequisitos

- Python 3.8+
- **MongoDB 7.0+** (ejecutándose en localhost:27017)
- pip (gestor de paquetes Python)

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd python-usuarios-recomendaciones
```

### 2. Crear entorno virtual

```bash
python -m venv venv
source venv/bin/activate  # En Linux/Mac
```

**En Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=modulo_python
JWT_SECRET=tu-clave-secreta-super-segura
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5. Ejecutar la aplicación

```bash
# Opción 1: Servidor MongoDB optimizado (RECOMENDADO)
python mongo_server.py

# Opción 2: Con uvicorn directamente
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

La API estará disponible en: `http://localhost:8001`

> **Nota**: El puerto por defecto es 8001 (8000 puede estar ocupado por otros servicios)

### Windows (PowerShell)

En Windows con PowerShell, asegúrate de activar el entorno virtual y de ejecutar el servidor:

```powershell
# 1) Activar el entorno virtual
.\venv\Scripts\Activate.ps1

# 2) Instalar dependencias dentro del entorno virtual
python -m pip install -r requirements.txt

# 3) Ejecutar el servidor MongoDB (RECOMENDADO)
python mongo_server.py
```

**Notas importantes:**

- Si PowerShell bloquea el script de activación, habilita scripts locales:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

- Verifica que MongoDB esté corriendo:
```powershell
# Verifica que MongoDB esté activo en puerto 27017
Test-NetConnection -ComputerName localhost -Port 27017
```

- Verifica dependencias instaladas:
```powershell
python -m pip show fastapi uvicorn beanie motor pydantic
```

## Endpoints de la API

### Documentación Interactiva

- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

### Usuarios

- `POST /usuarios/` - Crear nuevo usuario
- `GET /usuarios/` - Listar usuarios

### Autenticación

- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/token` - Iniciar sesión y obtener token JWT

### Destinos

- `POST /destinos/` - Crear nuevo destino
- `GET /destinos/` - Listar destinos

### Recomendaciones

- `POST /recomendaciones/` - Crear nueva recomendación
- `GET /recomendaciones/` - Listar recomendaciones

## Modelos de Datos

### Usuario

```json
{
  "id_usuario": 1,
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "contraseña": "hash_de_contraseña",
  "pais": "Ecuador"
}
```

### Destino

```json
{
  "id_destino": 1,
  "nombre": "Galápagos",
  "descripcion": "Islas únicas con fauna endémica",
  "ubicacion": "Ecuador",
  "ruta": "/images/galapagos.jpg"
}
```

### Recomendación

```json
{
  "id_recomendacion": 1,
  "fecha": "2025-10-10",
  "calificacion": 5,
  "comentario": "Excelente experiencia",
  "id_usuario": 1
}
```

## Desarrollo

### Ejecutar con Docker

```bash
docker build -t python-usuarios-api .
docker run -p 8001:8001 -e MONGODB_URL=mongodb://host.docker.internal:27017 python-usuarios-api
```

### Ejecutar tests

```bash
pytest tests/
```

## Dependencias Principales

- **FastAPI**: Framework web moderno para Python
- **Beanie**: ODM (Object Document Mapper) para MongoDB
- **Motor**: Driver asíncrono de MongoDB para Python
- **Pydantic**: Validación de datos usando type hints
- **python-jose**: Implementación de JWT para Python
- **passlib**: Librería para hashing de contraseñas
- **bcrypt**: Algoritmo de hash para contraseñas
- **uvicorn**: Servidor ASGI para FastAPI

## Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.

## Contacto

Para preguntas o sugerencias, contactar al equipo de desarrollo.
