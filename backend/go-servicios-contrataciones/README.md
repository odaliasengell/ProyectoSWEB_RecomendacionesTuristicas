# 🏖️ Sistema de Servicios Turísticos y Contrataciones

Un sistema completo de gestión de servicios turísticos y contrataciones desarrollado en Go, enfocado en destinos como Cancún, Playa del Carmen, Tulum y otros destinos turísticos de México.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características

### 🏨 Servicios Turísticos
- **Gestión de Hoteles**: Reservas, disponibilidad, precios
- **Tours y Excursiones**: Chichén Itzá, Tulum, Cozumel, etc.
- **Transporte**: Traslados aeropuerto, renta de autos
- **Restaurantes**: Reservas y experiencias gastronómicas
- **Actividades**: Spa, aventura, culturales
- **Eventos**: Bodas, conferencias, celebraciones

### 📅 Contrataciones
- **Sistema de Reservas**: Fácil y rápido
- **Gestión de Pagos**: Múltiples métodos de pago
- **Notificaciones**: Email, SMS, WebSocket
- **Calendario**: Vista de disponibilidad
- **Reportes**: Estadísticas y análisis
- **Multi-moneda**: USD, MXN, EUR

### 🔧 Funcionalidades Técnicas
- **API REST**: Endpoints bien documentados
- **WebSocket**: Notificaciones en tiempo real
- **Autenticación JWT**: Seguridad robusta
- **Middleware**: Logging, CORS, manejo de errores
- **Base de Datos**: SQLite con migraciones
- **Testing**: Cobertura completa de tests
- **Configuración**: Variables de entorno

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Microservices │
│   (React/Vue)   │◄──►│   (Go)          │◄──►│   (Go)          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (SQLite)      │
                       └─────────────────┘
```

### Patrón de Arquitectura
- **Clean Architecture**: Separación clara de responsabilidades
- **Repository Pattern**: Abstracción de acceso a datos
- **Service Layer**: Lógica de negocio centralizada
- **Handler Layer**: Manejo de HTTP requests
- **Middleware**: Funcionalidades transversales

## 🛠️ Tecnologías

### Backend
- **Go 1.21+**: Lenguaje principal
- **Gorilla Mux**: Router HTTP
- **SQLite**: Base de datos
- **JWT**: Autenticación
- **WebSocket**: Comunicación en tiempo real

### Herramientas de Desarrollo
- **Go Modules**: Gestión de dependencias
- **Testing**: Tests unitarios e integración
- **Linting**: gofmt, golint
- **Documentación**: GoDoc

## 🚀 Instalación

### Prerrequisitos
- Go 1.21 o superior
- Git
- Make (opcional)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/go-servicios-contrataciones.git
cd go-servicios-contrataciones/go
```

2. **Instalar dependencias**
```bash
go mod download
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Ejecutar migraciones**
```bash
go run cmd/api/main.go
```

5. **Verificar instalación**
```bash
curl http://localhost:8080/health
```

## ⚙️ Configuración

### Variables de Entorno

```env
# Servidor
PORT=8080
HOST=localhost
ENVIRONMENT=development

# Base de Datos
DB_PATH=app.db

# JWT
JWT_SECRET_KEY=tu-clave-secreta
JWT_EXPIRATION_HOURS=24

# Servicios Externos
PAYMENT_SERVICE_URL=http://localhost:8081
NOTIFICATION_SERVICE_URL=http://localhost:8082
USER_SERVICE_URL=http://localhost:8083
```

### Configuración de Base de Datos

El sistema utiliza SQLite por defecto, pero puede configurarse para otros SGBD:

```go
// En internal/config/database.go
func getDatabaseURL() string {
    dbPath := os.Getenv("DB_PATH")
    if dbPath == "" {
        dbPath = "app.db"
    }
    return fmt.Sprintf("file:%s?cache=shared&mode=rwc", dbPath)
}
```

## 🎯 Uso

### Iniciar el Servidor

```bash
# Desarrollo
go run cmd/api/main.go

# Producción
go build -o bin/api cmd/api/main.go
./bin/api
```

### Ejemplos de Uso

#### Crear un Servicio Turístico

```bash
curl -X POST http://localhost:8080/api/v1/servicios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Hotel Paradise Cancún",
    "descripcion": "Hotel todo incluido en la playa",
    "precio": 150.00,
    "categoria": "hotel",
    "destino": "cancun",
    "duracion_dias": 7,
    "capacidad_maxima": 100,
    "proveedor": "Paradise Hotels",
    "telefono_contacto": "+52 998 123 4567",
    "email_contacto": "reservas@paradise.com"
  }'
```

#### Crear una Contratación

```bash
curl -X POST http://localhost:8080/api/v1/contrataciones \
  -H "Content-Type: application/json" \
  -d '{
    "servicio_id": 1,
    "cliente_nombre": "Juan Pérez",
    "cliente_email": "juan@email.com",
    "cliente_telefono": "+52 998 987 6543",
    "fecha_inicio": "2024-12-15",
    "fecha_fin": "2024-12-22",
    "num_viajeros": 2,
    "moneda": "USD",
    "precio_unitario": 150.00,
    "total": 300.00
  }'
```

## 📡 API Endpoints

### Servicios Turísticos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/servicios` | Listar servicios |
| POST | `/api/v1/servicios` | Crear servicio |
| GET | `/api/v1/servicios/{id}` | Obtener servicio |
| PUT | `/api/v1/servicios/{id}` | Actualizar servicio |
| DELETE | `/api/v1/servicios/{id}` | Eliminar servicio |
| GET | `/api/v1/servicios/categoria/{categoria}` | Servicios por categoría |
| GET | `/api/v1/servicios/destino/{destino}` | Servicios por destino |
| GET | `/api/v1/servicios/buscar` | Buscar servicios |

### Contrataciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/contrataciones` | Listar contrataciones |
| POST | `/api/v1/contrataciones` | Crear contratación |
| GET | `/api/v1/contrataciones/{id}` | Obtener contratación |
| PUT | `/api/v1/contrataciones/{id}` | Actualizar contratación |
| DELETE | `/api/v1/contrataciones/{id}` | Eliminar contratación |
| GET | `/api/v1/contrataciones/estadisticas` | Estadísticas |
| GET | `/api/v1/contrataciones/calendario` | Vista calendario |

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Iniciar sesión |
| POST | `/api/v1/auth/refresh` | Renovar token |
| POST | `/api/v1/auth/logout` | Cerrar sesión |

### WebSocket

| Endpoint | Descripción |
|----------|-------------|
| `/ws` | Conexión WebSocket para notificaciones |

## 📁 Estructura del Proyecto

```
backend-golang-rest/
├── cmd/
│   └── api/
│       └── main.go                  # Entry point
│
├── internal/
│   ├── config/
│   │   ├── database.go              # GORM config
│   │   ├── env.go                   # Variables de entorno
│   │   └── services.go              # URLs otros servicios
│   │
│   ├── models/
│   │   ├── servicio.go              # Modelo Servicio
│   │   └── contratacion_servicio.go # Modelo ContratacionServicio
│   │
│   ├── dto/
│   │   ├── servicio_dto.go
│   │   └── contratacion_dto.go
│   │
│   ├── handlers/                    # Controladores
│   │   ├── servicio_handler.go
│   │   └── contratacion_handler.go
│   │
│   ├── services/                    # Lógica de negocio
│   │   ├── servicio_service.go
│   │   └── contratacion_service.go
│   │
│   ├── repository/                  # Acceso a datos
│   │   ├── servicio_repository.go
│   │   └── contratacion_repository.go
│   │
│   ├── middleware/
│   │   ├── auth_middleware.go       # Validar JWT
│   │   ├── logger_middleware.go
│   │   └── error_middleware.go
│   │
│   ├── utils/
│   │   ├── http_client.go           # Cliente para otros servicios
│   │   ├── response.go
│   │   └── websocket_notifier.go
│   │
│   └── routes/
│       └── routes.go                # Definición de rutas
│
├── tests/
│   ├── servicio_test.go
│   └── contratacion_test.go
│
├── go.mod
├── go.sum
├── .env
├── .env.example
├── .gitignore
└── README.md
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
go test ./...

# Tests específicos
go test ./tests/servicio_test.go
go test ./tests/contratacion_test.go

# Tests con cobertura
go test -cover ./...

# Tests con verbose
go test -v ./...
```

### Cobertura de Tests

```bash
# Generar reporte de cobertura
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Tests de Integración

```bash
# Tests con base de datos
go test -tags=integration ./tests/
```

## 🚀 Despliegue

### Docker

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main cmd/api/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
COPY --from=builder /app/.env .
CMD ["./main"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ENVIRONMENT=production
      - DB_PATH=/data/app.db
    volumes:
      - ./data:/data
```

### Despliegue en Producción

```bash
# Build para producción
go build -ldflags="-s -w" -o bin/api cmd/api/main.go

# Ejecutar con systemd
sudo systemctl start turisticos-api
sudo systemctl enable turisticos-api
```

## 🤝 Contribución

### Proceso de Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código

- Seguir las convenciones de Go
- Escribir tests para nuevas funcionalidades
- Documentar funciones públicas
- Usar gofmt para formateo
- Ejecutar golint para verificación

### Reportar Issues

- Usar el template de issues
- Incluir pasos para reproducir
- Especificar versión y entorno
- Adjuntar logs si es necesario

## 📊 Monitoreo y Logs

### Logs

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Filtrar logs por nivel
grep "ERROR" logs/app.log
```

### Métricas

- Endpoint: `/metrics`
- Formato: Prometheus
- Métricas: Requests, latencia, errores

### Health Check

```bash
curl http://localhost:8080/health
```

## 🔒 Seguridad

### Autenticación
- JWT con expiración configurable
- Refresh tokens
- Middleware de autenticación

### Autorización
- Roles de usuario (admin, user)
- Permisos por endpoint
- Validación de recursos

### Validación
- Sanitización de inputs
- Validación de esquemas
- Protección contra SQL injection

## 📈 Performance

### Optimizaciones
- Connection pooling
- Query optimization
- Caching strategies
- Compression middleware

### Benchmarks
```bash
go test -bench=. ./...
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión a BD**
   - Verificar DB_PATH en .env
   - Comprobar permisos de archivo

2. **Puerto en uso**
   - Cambiar PORT en .env
   - Verificar procesos activos

3. **JWT inválido**
   - Verificar JWT_SECRET_KEY
   - Comprobar expiración

### Logs de Debug

```bash
# Habilitar logs detallados
export LOG_LEVEL=debug
go run cmd/api/main.go
```




---

**Desarrollado con ❤️ para la industria turística Manta**