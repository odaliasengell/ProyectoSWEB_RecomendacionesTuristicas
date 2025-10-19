# Configuración SQLite - Desarrollo

## 📋 Resumen

Todo el backend de Python ahora usa **SQLite** para desarrollo. Se ha eliminado completamente la dependencia de PostgreSQL/MySQL.

## 🗄️ Base de Datos

- **Archivo Principal**: `recomendaciones_dev.db`
- **Ubicación**: `backend/python-usuarios-recomendaciones/`
- **Tablas**:
  - `usuarios` (para autenticación y perfil)
  - `destinos` (destinos turísticos)
  - `recomendaciones` (recomendaciones de destinos)

## 🚀 Inicio Rápido

### 1. Activar el entorno virtual

```powershell
cd 'C:\Users\HP\OneDrive - ULEAM\Escritorio\turismo\ProyectoSWEB_RecomendacionesTuristicas\backend\python-usuarios-recomendaciones'
.\venv\Scripts\Activate.ps1
```

### 2. Iniciar el servidor

```powershell
python cors_test_full.py
```

El servidor se iniciará en: `http://localhost:8000`

## 📝 Endpoints Disponibles

### Autenticación

- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/token` - Iniciar sesión

### Respuesta de Autenticación

```json
{
  "access_token": "token_...",
  "token_type": "bearer",
  "user": {
    "id_usuario": 1,
    "nombre": "Juan",
    "email": "juan@example.com",
    "pais": "Ecuador"
  }
}
```

## 🔐 Seguridad

- Las contraseñas se guardan con hash SHA256
- No se guardan en texto plano
- El token se envía en cada solicitud autenticada

## 📦 Dependencias Eliminadas

- ❌ `psycopg2` (PostgreSQL driver)
- ❌ `pymysql` (MySQL driver)
- ✅ SQLAlchemy SQLite (ya incluido)

## 🔧 Variables de Entorno

Ver `.env`:

```
DATABASE_URL=sqlite:///./recomendaciones_dev.db
JWT_SECRET=dev-secret-key-change-in-production-12345
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## ⚠️ Nota de Desarrollo

- SQLite es perfecto para desarrollo local
- Para producción, migrar a PostgreSQL o MySQL
- Los cambios de esquema se sincronizan automáticamente con `synchronize: true`

## 🗑️ Limpiar Base de Datos

Para reiniciar la base de datos, simplemente elimina `recomendaciones_dev.db`:

```powershell
Remove-Item recomendaciones_dev.db
```

La próxima vez que ejecutes la app, se creará una nueva con las tablas vacías.
