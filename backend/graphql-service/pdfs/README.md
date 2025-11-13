# 📄 Carpeta de PDFs Generados

Esta carpeta contiene los PDFs generados por el sistema de reportes GraphQL.

## 📁 Contenido

Los PDFs se generan automáticamente cuando se ejecuta la mutation `generateReportPDF` o cuando se hace clic en los botones "Descargar PDF" del panel de administración.

## 🗂️ Nomenclatura de Archivos

Los archivos se nombran automáticamente con el siguiente formato:

```
reporte_{tipo}_{timestamp}.pdf
```

**Ejemplos:**
- `reporte_tours_1731408123456.pdf`
- `reporte_guias_1731408234567.pdf`
- `reporte_general_1731408345678.pdf`

## 🧹 Limpieza Automática

Los PDFs antiguos (más de 24 horas) se eliminan automáticamente para evitar acumulación de archivos. Esta limpieza se ejecuta cada vez que se genera un nuevo PDF.

## 🌐 Acceso a los PDFs

Los PDFs son accesibles vía HTTP en:

```
http://localhost:4000/pdfs/nombre_archivo.pdf
```

**Ejemplo:**
```
http://localhost:4000/pdfs/reporte_tours_1731408123456.pdf
```

## 📊 Tipos de Reportes

Los PDFs pueden contener los siguientes tipos de reportes:

1. **tours** - Top tours más reservados
2. **guias** - Guías más activos
3. **usuarios** - Usuarios más activos
4. **reservas** - Reservas por mes
5. **destinos** - Destinos más populares
6. **servicios** - Servicios más contratados
7. **general** - Estadísticas generales del sistema

## ⚠️ Nota Importante

Esta carpeta NO debe ser eliminada, ya que es requerida por el servidor GraphQL para servir los archivos PDF generados. El contenido de la carpeta se gestiona automáticamente.

## 🚀 Generación de PDFs

Para generar un PDF, puedes:

1. **Desde el Panel de Admin:** Ir a Reportes → Seleccionar pestaña → Clic en "Descargar PDF"

2. **Desde GraphQL Playground:**
   ```graphql
   mutation {
     generateReportPDF(reportType: TOURS, limit: 10) {
       success
       filename
       url
       message
     }
   }
   ```

## 📝 Ejemplo de Uso

```bash
# 1. Generar PDF desde GraphQL
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { generateReportPDF(reportType: TOURS, limit: 10) { success filename url } }"}'

# 2. La respuesta incluirá la URL del PDF:
# { "data": { "generateReportPDF": { 
#     "success": true,
#     "filename": "reporte_tours_1731408123456.pdf",
#     "url": "http://localhost:4000/pdfs/reporte_tours_1731408123456.pdf"
# }}}

# 3. Acceder al PDF directamente
# http://localhost:4000/pdfs/reporte_tours_1731408123456.pdf
```

---

Para más información, consulta: `../GENERACION_PDFS.md`
