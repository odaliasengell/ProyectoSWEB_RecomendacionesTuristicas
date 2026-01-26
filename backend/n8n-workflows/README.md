# � n8n - Sistema de Reportes Automatizados

## Descripción

n8n automatiza la generación de reportes diarios del sistema de recomendaciones turísticas **Equipo A - ULEAM**. El flujo se ejecuta automáticamente cada día y genera análisis de:

- Reservas y pagos
- Usuarios activos
- Tours populares y destinos visitados
- Ingresos y tasa de éxito

## 🚀 Instalación de n8n

### Ejecución Local (Sin Docker)

Ejecutar usando el script (Windows):

```powershell
./start_n8n.ps1
```

O manualmente:

```bash
npx n8n start
```

### Primera Vez

Si es la primera vez, n8n instalará dependencias:

```bash
npm install n8n --save-dev --legacy-peer-deps
npx n8n start
```

## 📍 Acceso

- **URL**: http://localhost:5678
- **Usuario inicial**: Se configura en el primer acceso

## 📊 Workflow Implementado

### Reportes Generales Diarios (`reportes_generales.json`)

**Trigger**: Cron automático **cada día a las 6:00 AM**

**Flujo completo**:

```
6:00 AM → Obtener Datos → Procesar Reportes →
→ Guardar en BD → Enviar Email → Notificar Slack → Actualizar Dashboard
```

**Datos que genera**:

- ✅ Total de reservas del día
- ✅ Total de pagos y transacciones
- ✅ Usuarios activos
- ✅ Tours más populares (Top 5)
- ✅ Destinos más visitados (Top 5)
- ✅ Ingresos totales en USD
- ✅ Tasa de éxito de transacciones (%)

**Canales de notificación**:

- 📧 Email diario (admin@turismo.com)
- 🔔 Slack canal #reportes
- 📈 Dashboard en tiempo real

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` en la carpeta n8n:

```env
# URLs de servicios internos
REST_API_URL=http://localhost:8000
ADMIN_EMAIL=admin@turismo.com

# Slack (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

## 📥 Importar Workflow

1. Abrir n8n: http://localhost:5678
2. Ir a **Workflows** → **Import from File**
3. Seleccionar: `reportes_generales.json`
4. Configurar credenciales (Slack, Email si es necesario)
5. Activar el workflow

## 📝 Pruebas

### Ejecutar reporte manualmente en n8n

1. Abrir n8n: http://localhost:5678
2. Abrir workflow "Reportes Generales Diarios"
3. Click en botón **Execute Workflow** (triángulo de play)
4. Ver resultados en el panel de ejecución

O desde línea de comandos:

```bash
# Simular ejecución (si expone endpoint manual)
curl http://localhost:5678/webhook/reportes-manual
```

## 📊 Monitoreo

n8n proporciona:

- **Execution History**: Ver historial de ejecuciones del reporte
- **Logs**: Ver detalles de cada nodo ejecutado
- **Metrics**: Tiempos de ejecución y errores

## 🔄 Actualizar Lógica de Reportes

Para modificar qué datos se incluyen en el reporte:

1. Abrir `reportes_generales.json` en n8n
2. Editar el nodo **Procesar Datos de Reportes** (JavaScript)
3. Modificar los campos calculados
4. Guardar y activar

Ejemplo - Agregar nuevo campo:

```javascript
// En el nodo "Procesar Datos de Reportes"
const procesado = {
  // ... campos existentes ...
  nuevoCampo: reportData[0]?.body?.nuevo_valor || 0,
};
```

## ✅ Checklist de Instalación

- [ ] Instalar n8n (`npm install -g n8n`)
- [ ] Ejecutar `./start.ps1`
- [ ] Acceder a http://localhost:5678
- [ ] Importar `reportes_generales.json`
- [ ] Configurar variables de entorno (.env)
- [ ] Activar el workflow
- [ ] Verificar ejecución en historial

## 📞 Soporte

- **Documentación n8n**: https://docs.n8n.io
- **Community**: https://community.n8n.io

---

**Sistema de Reportes - Equipo A ULEAM** | Recomendaciones Turísticas
