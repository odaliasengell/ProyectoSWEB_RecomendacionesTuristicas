# 🚀 GUÍA CORREGIDA - Queries con Campos Reales de Go

## ⚠️ CAMPOS DISPONIBLES EN GO

### Tabla `servicios`:
- `id` - INTEGER
- `nombre` - TEXT  
- `descripcion` - TEXT
- `precio` - REAL
- `categoria` - TEXT
- `destino` - TEXT
- `duracion_dias` - INTEGER

### Tabla `contrataciones`:
- `id` - INTEGER
- `servicio_id` - INTEGER
- `fecha_contratacion` - TEXT (ISO8601)
- `fecha_inicio` - TEXT (ISO8601)
- `fecha_fin` - TEXT (ISO8601)
- `num_viajeros` - INTEGER
- `moneda` - TEXT
- `total` - REAL

---

## 📝 PASO 1: Verificar servicios

```graphql
query VerificarServicios {
  servicios {
    id
    nombre
    descripcion
    precio
    categoria
    destino
    duracion_dias
  }
}
```

---

## 🆕 PASO 2: Crear servicio

```graphql
mutation CrearServicio {
  crearServicio(input: {
    nombre: "Tour Chichen Itza"
    descripcion: "Visita guiada a las ruinas mayas"
    precio: 1500.00
    categoria: "tour"
    destino: "chichen_itza"
    duracion_dias: 1
  })
}
```

---

## 🔍 PASO 3: Verificar servicio creado

```graphql
query TodosLosServicios {
  servicios {
    id
    nombre
    descripcion
    precio
    categoria
    destino
    duracion_dias
  }
}
```

---

## 📋 PASO 4: Ver contrataciones (vacío inicialmente)

```graphql
query VerificarContrataciones {
  contrataciones {
    id
    servicio_id
    fecha_contratacion
    fecha_inicio
    fecha_fin
    num_viajeros
    moneda
    total
  }
}
```

---

## 📝 PASO 5: Crear contratación

**Importante:** Usa el ID del servicio que creaste en el PASO 2

```graphql
mutation CrearContratacion {
  crearContratacion(input: {
    servicio_id: "1"
    cliente_nombre: "Juan Pérez"
    cliente_email: "juan@example.com"
    cliente_telefono: "+52 998 123 4567"
    fecha: "2025-10-11T10:00:00Z"
    fecha_inicio: "2025-11-15T08:00:00Z"
    fecha_fin: "2025-11-15T18:00:00Z"
    num_viajeros: 4
    moneda: "MXN"
  })
}
```

**Nota:** Los campos `cliente_nombre`, `cliente_email`, `cliente_telefono` son del input de GraphQL pero NO se guardan en la base de datos Go (la tabla solo tiene los campos listados arriba).

---

## 🔗 PASO 6: Ver contratación con servicio relacionado

```graphql
query ContratacionConServicio {
  contrataciones {
    id
    servicio_id
    fecha_contratacion
    fecha_inicio
    fecha_fin
    num_viajeros
    moneda
    total
    servicio {
      id
      nombre
      descripcion
      precio
      categoria
      destino
      duracion_dias
    }
  }
}
```

---

## 🎨 PASO 7: Query completa

```graphql
query DatosCompletos {
  servicios {
    id
    nombre
    descripcion
    precio
    categoria
    destino
    duracion_dias
  }
  
  contrataciones {
    id
    servicio_id
    fecha_contratacion
    fecha_inicio
    fecha_fin
    num_viajeros
    moneda
    total
    servicio {
      nombre
      precio
      categoria
    }
  }
}
```

---

## ✨ QUERIES ADICIONALES

### Crear más servicios:

```graphql
mutation CrearHotel {
  crearServicio(input: {
    nombre: "Hotel Grand Paradise"
    descripcion: "Hotel todo incluido"
    precio: 2500.00
    categoria: "hotel"
    destino: "cancun"
    duracion_dias: 3
  })
}
```

```graphql
mutation CrearRestaurante {
  crearServicio(input: {
    nombre: "Restaurante La Parrilla"
    descripcion: "Comida yucateca auténtica"
    precio: 450.00
    categoria: "restaurante"
    destino: "merida"
    duracion_dias: 1
  })
}
```

### Crear más contrataciones:

```graphql
mutation ContratacionHotel {
  crearContratacion(input: {
    servicio_id: "2"
    cliente_nombre: "María González"
    cliente_email: "maria@example.com"
    cliente_telefono: "+52 998 555 1234"
    fecha: "2025-10-11T14:00:00Z"
    fecha_inicio: "2025-12-20T15:00:00Z"
    fecha_fin: "2025-12-23T12:00:00Z"
    num_viajeros: 2
    moneda: "USD"
  })
}
```

---

## 🎯 RESUMEN DE CAMPOS

### ✅ Campos que SÍ existen en Go:

**Servicios:**
- id ✅
- nombre ✅  
- descripcion ✅
- precio ✅
- categoria ✅
- destino ✅
- duracion_dias ✅

**Contrataciones:**
- id ✅
- servicio_id ✅
- fecha_contratacion ✅
- fecha_inicio ✅
- fecha_fin ✅
- num_viajeros ✅
- moneda ✅
- total ✅

### ❌ Campos que NO existen en la BD Go:

Los siguientes campos están en el schema GraphQL pero NO en la base de datos real:
- capacidad_maxima ❌
- disponible ❌
- proveedor ❌
- telefono_contacto ❌
- email_contacto ❌
- created_at ❌
- updated_at ❌
- cliente_nombre ❌ (solo input)
- cliente_email ❌ (solo input)
- cliente_telefono ❌ (solo input)
- precio_unitario ❌
- descuento ❌
- estado ❌
- notas ❌

---

## 📸 CAPTURAS IMPORTANTES

1. ✅ PASO 2 - Mutation crear servicio
2. ✅ PASO 3 - Query mostrando servicios
3. ✅ PASO 5 - Mutation crear contratación  
4. ✅ PASO 6 - Query mostrando relación servicio
5. ✅ PASO 7 - Query completa

---

**Fecha:** 11 de octubre de 2025  
**Nota:** Esta guía usa SOLO los campos que realmente existen en la base de datos Go.
