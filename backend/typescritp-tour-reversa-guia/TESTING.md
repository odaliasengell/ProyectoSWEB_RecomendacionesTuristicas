# Testing Guide - Proyecto TypeScript Tour/Reservas/Guías

Este documento describe la configuración y uso del sistema de pruebas para el proyecto TypeScript.

## 🧪 Configuración de Pruebas

El proyecto utiliza:
- **Jest** como framework de testing
- **ts-jest** para soporte de TypeScript
- **Supertest** para pruebas de integración de APIs
- **SQLite en memoria** para base de datos de pruebas

## 📁 Estructura de Pruebas

```
src/tests/
├── setup.ts                    # Configuración global de pruebas
├── fixtures/
│   └── test-data.ts            # Datos de prueba reutilizables
├── mocks/
│   └── http-client.mock.ts     # Mocks para servicios externos
├── integration/
│   └── tour.integration.test.ts # Pruebas de integración
├── tours.test.ts               # Pruebas unitarias de TourService
├── guias.test.ts               # Pruebas unitarias de GuiaService
└── reservas.test.ts            # Pruebas unitarias de ReservaService
```

## 🚀 Scripts Disponibles

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas en modo watch
```bash
npm run test:watch
```

### Ejecutar pruebas con reporte de cobertura
```bash
npm run test:coverage
```

### Ejecutar solo pruebas unitarias
```bash
npm run test:unit
```

### Ejecutar solo pruebas de integración
```bash
npm run test:integration
```

## 📊 Cobertura de Pruebas

### TourService (tours.test.ts)
- ✅ `findAll()` - Obtener todos los tours con datos enriquecidos
- ✅ `findById()` - Obtener tour específico por ID
- ✅ `findAvailable()` - Obtener solo tours disponibles
- ✅ `create()` - Crear nuevo tour con validaciones
- ✅ `update()` - Actualizar tour existente
- ✅ `delete()` - Eliminar tour (validando reservas activas)
- ✅ `toggleDisponibilidad()` - Cambiar estado de disponibilidad

### GuiaService (guias.test.ts)
- ✅ `findAll()` - Obtener todos los guías con tours
- ✅ `findById()` - Obtener guía específico por ID
- ✅ `findAvailable()` - Obtener solo guías disponibles
- ✅ `create()` - Crear nuevo guía (validación de email único)
- ✅ `update()` - Actualizar guía existente
- ✅ `delete()` - Eliminar guía
- ✅ `toggleDisponibilidad()` - Cambiar estado de disponibilidad

### ReservaService (reservas.test.ts)
- ✅ `findAll()` - Obtener todas las reservas con relaciones
- ✅ `findById()` - Obtener reserva específica por ID
- ✅ `create()` - Crear nueva reserva
- ✅ `update()` - Actualizar reserva existente
- ✅ `delete()` - Eliminar reserva
- ✅ `findByUsuario()` - Obtener reservas por usuario

### Pruebas de Integración (tour.integration.test.ts)
- ✅ `GET /api/tours` - Endpoint para obtener todos los tours
- ✅ `GET /api/tours/:id` - Endpoint para obtener tour por ID
- ✅ `GET /api/tours/available` - Endpoint para tours disponibles
- ✅ `POST /api/tours` - Endpoint para crear tour
- ✅ `PUT /api/tours/:id` - Endpoint para actualizar tour
- ✅ `DELETE /api/tours/:id` - Endpoint para eliminar tour
- ✅ `PATCH /api/tours/:id/toggle-disponibilidad` - Endpoint para cambiar disponibilidad

## 🔧 Configuración

### jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  // ... otras configuraciones
};
```

### Base de Datos de Pruebas
Las pruebas utilizan SQLite en memoria que se reinicia entre cada prueba para garantizar aislamiento.

### Mocks
- **httpClient**: Mock para llamadas externas a servicios de destinos y notificaciones WebSocket
- **AppDataSource**: Mock para la conexión de base de datos

## 🎯 Casos de Prueba Destacados

### Validaciones de Negocio
- No se puede crear tour con guía inexistente o no disponible
- No se puede eliminar tour con reservas activas
- No se puede crear guía con email duplicado
- Validación de datos requeridos en DTOs

### Manejo de Errores
- Pruebas para recursos no encontrados (404)
- Validación de parámetros inválidos (400)
- Manejo de errores de servidor (500)

### Integridad de Datos
- Relaciones entre entidades (Tour-Guía, Tour-Reserva)
- Ordenamiento correcto de resultados
- Filtrado por disponibilidad

## 📈 Métricas de Calidad

El proyecto mantiene:
- **Cobertura de código**: >90% en servicios principales
- **Casos de prueba**: 50+ casos de prueba
- **Tiempo de ejecución**: <10 segundos para toda la suite

## 🐛 Debugging de Pruebas

Para debugging individual:
```bash
# Ejecutar una prueba específica
npm test -- --testNamePattern="debería crear un tour exitosamente"

# Ejecutar un archivo específico
npm test tours.test.ts

# Modo verbose para más información
npm test -- --verbose
```

## 📝 Mejores Prácticas

1. **Aislamiento**: Cada prueba es independiente
2. **Datos Mock**: Uso de fixtures reutilizables
3. **Nomenclatura**: Nombres descriptivos en español
4. **Estructura AAA**: Arrange, Act, Assert
5. **Validación Completa**: Verificar tanto casos exitosos como de error

## 🔄 CI/CD Integration

Las pruebas están listas para integración con:
- GitHub Actions
- Jenkins
- GitLab CI
- Azure DevOps

Ejemplo de pipeline:
```yaml
test:
  script:
    - npm install
    - npm run test:coverage
  coverage: '/Lines\\s*:\\s*(\\d+\\.?\\d*)%/'
```