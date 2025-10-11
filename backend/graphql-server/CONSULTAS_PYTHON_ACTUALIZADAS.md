# 📝 Consultas GraphQL Actualizadas para Python

## ✅ Campos Reales de los Modelos Python

Estos son los campos exactos que vienen de la base de datos Python:

### Usuario
- `id_usuario`: ID del usuario
- `nombre`: Nombre completo
- `email`: Correo electrónico
- `contrasena`: Contraseña (no se muestra en queries por seguridad)
- `pais`: País de origen

### Destino
- `id_destino`: ID del destino
- `nombre`: Nombre del destino
- `descripcion`: Descripción
- `ubicacion`: Ubicación geográfica
- `ruta`: Ruta o path

### Recomendacion
- `id_recomendacion`: ID de la recomendación
- `fecha`: Fecha de la recomendación
- `calificacion`: Calificación (número entero)
- `comentario`: Comentario o motivo
- `id_usuario`: ID del usuario relacionado

---

## 🧪 Consultas de Prueba

### 1. Ver todos los usuarios

```graphql
query {
  usuarios {
    id_usuario
    nombre
    email
    pais
  }
}
```

### 2. Ver un usuario específico

```graphql
query {
  usuario(id: "1") {
    id_usuario
    nombre
    email
    pais
  }
}
```

### 3. Crear un usuario

```graphql
mutation {
  crearUsuario(input: {
    nombre: "Juan Pérez"
    email: "juan@example.com"
    contrasena: "password123"
    pais: "México"
  }) {
    id_usuario
    nombre
    email
    pais
  }
}
```

### 4. Ver todos los destinos

```graphql
query {
  destinos {
    id_destino
    nombre
    descripcion
    ubicacion
    ruta
  }
}
```

### 5. Ver un destino específico

```graphql
query {
  destino(id: "1") {
    id_destino
    nombre
    descripcion
    ubicacion
    ruta
  }
}
```

### 6. Ver todas las recomendaciones

```graphql
query {
  recomendaciones {
    id_recomendacion
    fecha
    calificacion
    comentario
    id_usuario
  }
}
```

### 7. Ver recomendaciones de un usuario con relaciones

```graphql
query {
  recomendacionesPorUsuario(usuarioId: "1") {
    id_recomendacion
    fecha
    calificacion
    comentario
    usuario {
      id_usuario
      nombre
      email
    }
  }
}
```

---

## 🚀 URLs

- **GraphQL Server**: http://localhost:4000/graphql
- **Python API**: http://localhost:8000
- **Python API Docs**: http://localhost:8000/docs

---

## ⚠️ Notas Importantes

1. **IDs como String**: En GraphQL los IDs se pasan como strings aunque en Python sean integers
2. **Campo contraseña**: 
   - En GraphQL se llama `contrasena` (sin ñ) para compatibilidad
   - El datasource convierte automáticamente a `contraseña` para Python
   - No necesitas preocuparte por la conversión
3. **Relaciones**: Solo la tabla `Recomendacion` tiene relación con `Usuario`
4. **Endpoints limitados**: Por ahora solo está implementado el endpoint de creación de usuarios en Python

---

## 📌 Estado Actual de Endpoints Python

**Disponibles** ✅:
- `POST /usuarios` - Crear usuario

**Pendientes** ⏳:
- `GET /usuarios` - Listar usuarios
- `GET /usuarios/{id}` - Obtener usuario
- `GET /destinos` - Listar destinos
- `GET /destinos/{id}` - Obtener destino
- `GET /recomendaciones` - Listar recomendaciones
- `GET /recomendaciones/{id}` - Obtener recomendación
- `GET /recomendaciones/usuario/{id}` - Recomendaciones por usuario
