# 🔧 Configuración de Desarrollo con SQLite

Este documento describe la configuración actualizada de todos los servicios backend para usar SQLite en desarrollo.

## 📦 Servicios Configurados

### 1. Python - Usuarios y Recomendaciones (Puerto 8000)

**Ubicación**: `backend/python-usuarios-recomendaciones/`

**Base de datos**: `recomendaciones_dev.db` (SQLite)

**Configuración** (`.env`):

```env
DATABASE_URL=sqlite:///./recomendaciones_dev.db
JWT_SECRET=dev-secret-key-change-in-production-12345
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=Recomendaciones Turísticas API
```

**Iniciar**:

```powershell
cd backend\python-usuarios-recomendaciones
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Inicializar DB** (opcional):

```powershell
python init_db.py
```

---

### 2. TypeScript - Tours y Reservas (Puerto 3000)

**Ubicación**: `backend/typescritp-tour-reversa-guia/`

**Base de datos**: `tours_reservas_dev.db` (SQLite)

**Configuración** (`.env`):

```env
DB_DATABASE=./tours_reservas_dev.db
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-jwt-secret-key-change-in-production
PYTHON_API_URL=http://localhost:8000
GOLANG_API_URL=http://localhost:8080
GRAPHQL_API_URL=http://localhost:4000
WEBSOCKET_URL=http://localhost:8081
```

**Iniciar**:

```powershell
cd backend\typescritp-tour-reversa-guia
npm run dev
```

> **Nota**: TypeORM crea automáticamente las tablas al iniciar (synchronize: true)

---

### 3. Go - Servicios y Contrataciones (Puerto 8080)

**Ubicación**: `backend/go-servicios-contrataciones/`

**Estado**: Pendiente de migración a SQLite (actualmente usa base de datos configurada)

---

### 4. GraphQL Server (Puerto 4000)

**Ubicación**: `backend/graphql-server/`

**Estado**: Servidor de agregación que consume los otros servicios

**Iniciar**:

```powershell
cd backend\graphql-server
npm run build
npm start
```

---

### 5. WebSocket Server (Puerto 8081)

**Ubicación**: `backend/websocket-server/`

**Estado**: Servidor de notificaciones en tiempo real

**Iniciar**:

```powershell
cd backend\websocket-server
npm run dev
```

---

## 🎯 Ventajas de usar SQLite en Desarrollo

✅ **Sin instalación**: No requiere servidor de base de datos  
✅ **Portátil**: Archivo único que se puede compartir  
✅ **Rápido**: Ideal para desarrollo y pruebas  
✅ **Fácil reset**: Solo eliminar el archivo .db  
✅ **Sin configuración**: No requiere usuario/contraseña

## 🔄 Migración a Producción

Para producción, cambiar a PostgreSQL/MySQL es sencillo:

### Python (FastAPI)

```env
DATABASE_URL=mysql+pymysql://user:password@host/db
# o
DATABASE_URL=postgresql://user:password@host/db
```

### TypeScript (TypeORM)

```typescript
// src/config/database.ts
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'production_db',
  // ...
});
```

## 🐛 Troubleshooting

### Python: Error CORS

**Síntoma**: `Access-Control-Allow-Origin` header is missing

**Solución**: Verificar que el servidor esté corriendo y que CORS esté configurado en `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### TypeScript: Error enum en SQLite

**Síntoma**: `Data type "enum" is not supported by "sqlite"`

**Solución**: Cambiar columnas tipo `enum` a `varchar`:

```typescript
@Column({
  type: 'varchar',
  length: 50,
  default: 'valor_por_defecto',
})
```

### Python: ModuleNotFoundError

**Síntoma**: Imports fallan con `ModuleNotFoundError`

**Solución**:

1. Activar el entorno virtual
2. Instalar dependencias: `pip install -r requirements.txt`
3. Verificar que los imports usen `from app.` en lugar de imports absolutos

## 📊 Estado de Servicios

| Servicio       | Puerto | Base de Datos   | Estado         |
| -------------- | ------ | --------------- | -------------- |
| Python API     | 8000   | SQLite ✅       | ✅ Funcionando |
| TypeScript API | 3000   | SQLite ✅       | ✅ Funcionando |
| Go API         | 8080   | Por configurar  | ⏳ Pendiente   |
| GraphQL        | 4000   | N/A (agregador) | ✅ Funcionando |
| WebSocket      | 8081   | N/A             | ✅ Funcionando |

## 🚀 Iniciar Todo el Stack

```powershell
# Terminal 1: Python API
cd backend\python-usuarios-recomendaciones
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: TypeScript API
cd backend\typescritp-tour-reversa-guia
npm run dev

# Terminal 3: WebSocket Server
cd backend\websocket-server
npm run dev

# Terminal 4: GraphQL Server
cd backend\graphql-server
npm start

# Terminal 5: Frontend
cd frontend\recomendaciones
npm run dev
```

## 📝 Notas Adicionales

- Los archivos `.db` de SQLite se crean automáticamente al iniciar cada servicio
- Agregar `*.db` al `.gitignore` para no versionar las bases de datos locales
- Para resetear una base de datos, simplemente elimina el archivo `.db` y reinicia el servicio
- Las migraciones no son necesarias en desarrollo con SQLite (synchronize: true)
