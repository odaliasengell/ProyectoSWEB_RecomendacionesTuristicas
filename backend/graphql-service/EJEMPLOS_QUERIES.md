# 📊 EJEMPLOS DE QUERIES AVANZADAS - GraphQL Service

Este documento contiene ejemplos prácticos de queries GraphQL para diferentes casos de uso.

## 🚀 QUERIES PROBADAS PARA POSTMAN (JSON Format)

Estas queries han sido probadas y funcionan correctamente. Úsalas en Postman con:
- **Método:** POST
- **URL:** `http://localhost:4000/`
- **Headers:** `Content-Type: application/json`
- **Body:** raw → JSON

### 1️⃣ Tours más reservados
```json
{
  "query": "{ toursTop(limit: 5) { tour { _id nombre descripcion precio duracion capacidad_maxima disponible } total_reservas ingresos_totales } }"
}
```

### 2️⃣ Guías más activos
```json
{
  "query": "{ guiasTop(limit: 5) { guia { _id nombre email idiomas experiencia calificacion } total_tours total_reservas calificacion_promedio } }"
}
```

### 3️⃣ Estadísticas generales
```json
{
  "query": "{ estadisticasGenerales { total_usuarios total_destinos total_tours total_guias total_reservas total_ingresos reservas_pendientes reservas_confirmadas reservas_completadas reservas_canceladas } }"
}
```

### 4️⃣ Destinos populares
```json
{
  "query": "{ destinosPopulares(limit: 5) { destino { _id nombre descripcion ubicacion provincia ciudad categoria calificacion_promedio activo } total_tours total_reservas calificacion_promedio } }"
}
```

### 5️⃣ Usuarios más activos
```json
{
  "query": "{ usuariosTop(limit: 5) { usuario { _id nombre email pais fecha_registro } total_reservas total_gastado total_recomendaciones } }"
}
```

### 6️⃣ Reservas por mes
```json
{
  "query": "{ reservasPorMes(anio: 2025) { mes anio total_reservas total_ingresos } }"
}
```

### 7️⃣ Servicios más contratados
```json
{
  "query": "{ serviciosTop(limit: 5) { servicio { _id nombre descripcion precio categoria destino duracion_dias capacidad_maxima disponible proveedor } total_contrataciones total_ingresos } }"
}
```

### 8️⃣ Recomendaciones mejor calificadas
```json
{
  "query": "{ recomendacionesTop(limit: 5) { recomendacion { _id fecha calificacion comentario tipo_recomendacion nombre_referencia } } }"
}
```

### 9️⃣ Contrataciones por mes
```json
{
  "query": "{ contratacionesPorMes(anio: 2025) { mes anio total_contrataciones total_ingresos } }"
}
```

---

## 📚 Información Adicional

### 🌐 GraphQL Playground
Accede a `http://localhost:4000/` para explorar el schema completo y probar queries interactivamente.

### � Endpoints
- **GraphQL Server:** `http://localhost:4000/`
- **REST API:** `http://localhost:8000/`

### � Tips
- Todas estas queries están probadas y funcionan correctamente
- Los resultados se basan en datos reales de MongoDB
- Puedes ajustar el parámetro `limit` en cada query según necesites
- Para `reservasPorMes` y `contratacionesPorMes`, cambia el año según tus datos

---

**Última actualización:** Noviembre 2025
**Estado:** ✅ Todas las queries validadas y funcionando

