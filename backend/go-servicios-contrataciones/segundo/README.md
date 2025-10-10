# Servicios y Contrataciones (Go)

API REST en Go con arquitectura por capas: `cmd`, `internal/routes`, `internal/handlers`, `internal/services`, `internal/repository`, `internal/models`, `internal/dto`. Incluye GraphQL y WebSockets.

## Definición del tema
Contratación de servicios turísticos: tours, hoteles, transporte. Los servicios incluyen categoría, destino y duración. Las contrataciones incluyen fechas (inicio/fin), viajeros, moneda y total calculado.

## Arquitectura
- cmd: punto de entrada (`main.go`).
- internal/routes: ruteo con Gorilla Mux.
- internal/handlers: controladores HTTP.
- internal/services: lógica de negocio.
- internal/repository: acceso a datos (placeholder).
- internal/models: entidades de dominio.
- internal/dto: modelos para transporte.
- internal/config: configuración (puerto HTTP por `PORT`).

## Setup
1. Requisitos: Go 1.21+
2. Variables de entorno: ver `.env.example`.
3. Ejecutar:
```bash
go mod tidy
PORT=8080 go run ./go/cmd
```

## Endpoints
- GET `/ping` → healthcheck
- GET `/servicios`
- GET `/contrataciones`
- POST `/servicios` (turístico)
- POST `/contrataciones` (turístico)

## GraphQL
- GET `/graphql` (con GraphiQL)
- Query ejemplo: `{ servicios { id nombre categoria destino } }`
- Mutations: `createServicio`, `createContratacion`

## WebSockets
- `GET /ws` para recibir eventos `contratacion_creada`


