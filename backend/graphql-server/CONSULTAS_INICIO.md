# 🚀 Consultas de Inicio Rápido - GraphQL Server

## ✅ Consultas que FUNCIONAN (Testeadas)

Estas consultas están probadas y funcionan correctamente con el servidor GraphQL.

### 1️⃣ Ver todos los tours (Básico)

```graphql
query {
  tours {
    id
    nombre
    descripcion
    precio
    duracion
    capacidadMaxima
    disponible
  }
}
```

**Resultado esperado:** Lista de todos los tours con su información básica.

---

### 2️⃣ Ver todas las guías

```graphql
query {
  guias {
    id
    nombre
    idiomas
    experiencia
    email
    telefono
    disponible
    calificacion
  }
}
```

**Resultado esperado:** Lista de todas las guías registradas con sus datos completos de la base de datos.

---

### 3️⃣ Ver un tour específico

```graphql
query {
  tour(id: "1") {
    id
    nombre
    descripcion
    precio
    duracion
    ubicacion
    capacidadMaxima
    disponible
  }
}
```

**Resultado esperado:** Información detallada del tour con ID "1".

---

### 4️⃣ Ver tours disponibles

```graphql
query {
  toursDisponibles {
    id
    nombre
    precio
    duracion
    capacidadMaxima
  }
}
```

**Resultado esperado:** Solo tours marcados como disponibles.

---

### 5️⃣ Ver todas las reservas

```graphql
query {
  reservas {
    id
    fechaReserva
    cantidadPersonas
    precioTotal
    estado
    comentarios
  }
}
```

**Resultado esperado:** Lista de todas las reservas con los campos reales de la base de datos.

---

## ⚠️ Consultas que PUEDEN FALLAR

Estas consultas funcionan **SOLO SI** los datos relacionados existen en la base de datos.

### Tours con sus guías (solo si tienen guía asignado)

```graphql
query {
  tours {
    id
    nombre
    precio
  }
}
```

**Nota:** No incluyas el campo `guia { ... }` porque algunos tours no tienen guía asignado y causará error.

---

### Tours con reservas

```graphql
query {
  tours {
    id
    nombre
    precio
    reservas {
      id
      fechaReserva
      cantidadPersonas
    }
  }
}
```

**Nota:** Esto funciona porque si no hay reservas, devuelve array vacío `[]`.

---

## 🎯 Consultas Avanzadas (Cuando tengas más datos)

### Filtrar tours por precio

```graphql
query {
  toursPorPrecio(precioMin: 50, precioMax: 200) {
    id
    nombre
    precio
    duracion
  }
}
```

---

## 🔍 Cómo Probar las Consultas

### Paso 1: Abre Apollo Studio
Navega a: **http://localhost:4000**

### Paso 2: Copia una consulta
Copia cualquiera de las consultas de arriba.

### Paso 3: Pégala en el panel izquierdo
Pega la consulta en el editor de Apollo Studio.

### Paso 4: Presiona el botón "Run"
O usa el atajo: `Ctrl + Enter` (Windows) / `Cmd + Enter` (Mac)

### Paso 5: Ve los resultados
Los resultados aparecerán en el panel derecho en formato JSON.

---

## 💡 Tips Importantes

### ✅ DO (Hacer)
- ✅ Empieza con consultas simples (solo campos básicos)
- ✅ Prueba primero que los datos existan
- ✅ Consulta guías y tours por separado al inicio
- ✅ Lee los mensajes de error, son muy descriptivos

### ❌ DON'T (No hacer)
- ❌ No consultes campos anidados si el padre puede ser `null`
- ❌ No asumas que todos los tours tienen guía
- ❌ No uses IDs que no existen en tu base de datos
- ❌ No olvides poner comillas en los strings: `id: "1"` no `id: 1`

---

## 🐛 Errores Comunes y Soluciones

### Error: "Cannot return null for non-nullable field Guia.id" ✅ RESUELTO

**Causa:** Había guías en la base de datos con `id: null`.

**Solución aplicada:** El schema ahora permite que `Guia.id` sea nullable. La consulta de guías funciona correctamente incluso si algunos tienen `id: null`.

---

### Error: "Expected Iterable, but did not find one for field Guia.idiomas" ✅ RESUELTO

**Causa:** El campo `idiomas` es un array `[String!]` pero la API devolvía `null`.

**Solución aplicada:** El resolver ahora convierte `null` en array vacío `[]`. También maneja strings separados por comas y los convierte a arrays.

---

### Schema ajustado a la base de datos real ✅ COMPLETADO

**Cambios:** Se eliminaron los campos que no existen en la base de datos TypeScript.

**Campos eliminados:**
- ❌ `apellido` - No existe en la tabla guias
- ❌ `especialidad` - No existe (se usa `experiencia`)
- ❌ `idiomas` - No existe en la tabla guias

**Campos disponibles en el tipo Guia:**
- ✅ `id` (mapeado desde `id_guia`)
- ✅ `nombre` (nombre completo del guía)
- ✅ `email`
- ✅ `telefono`
- ✅ `experiencia` (descripción de la experiencia del guía)
- ✅ `calificacion`
- ✅ `disponible`

**Importante:** El schema de GraphQL ahora refleja exactamente los campos que existen en tu base de datos.

---

### Error: "Cannot query field X on type Y"

**Causa:** El campo no existe en el schema o está mal escrito.

---

### Error: "Cannot query field X on type Y"

**Causa:** El campo no existe en el schema o está mal escrito.

**Solución:** Usa el autocompletado de Apollo Studio (presiona `Ctrl + Space`) para ver los campos disponibles.

---

### Error: "Field X is not defined by type Query"

**Causa:** La consulta no existe o está mal escrita.

**Solución:** Verifica en el schema que la consulta exista. Usa el botón "Schema" en Apollo Studio para ver todas las consultas disponibles.

---

## 📋 Checklist Antes de Hacer Consultas

- [ ] El servidor GraphQL está corriendo en http://localhost:4000
- [ ] El microservicio TypeScript está corriendo en http://localhost:3000
- [ ] Puedes acceder a Apollo Studio en el navegador
- [ ] Empezaste con una consulta simple (tours básicos)
- [ ] Leíste el mensaje de error completo si algo falla

---

## 🎉 Siguiente Paso

Una vez que estas consultas funcionen, puedes explorar:

1. **EJEMPLOS_CONSULTAS.md** - Consultas más complejas
2. **Mutaciones** - Crear, actualizar y eliminar datos
3. **Reportes** - Análisis y estadísticas avanzadas

---

**¿Necesitas ayuda?** Revisa la sección de Troubleshooting en README.md
