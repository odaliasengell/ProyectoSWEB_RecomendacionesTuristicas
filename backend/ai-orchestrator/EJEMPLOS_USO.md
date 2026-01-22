# Ejemplos de Uso - Chatbot Multimodal con IA

## 🎯 Casos de Uso Prácticos

### Caso 1: Búsqueda de Destinos

**Conversación:**
```
👤 Usuario: "Quiero visitar lugares arqueológicos en Perú"

🤖 Asistente: [Usa tool: buscar_destinos]
"¡Encontré varios destinos arqueológicos para ti!

1. **Machu Picchu** (Cusco)
   - Precio: $150
   - La famosa ciudadela inca en lo alto de los Andes

2. **Líneas de Nazca** (Nazca)
   - Precio: $120
   - Misteriosos geoglifos en el desierto

3. **Chan Chan** (Trujillo)
   - Precio: $45
   - La ciudadela de barro más grande de América

¿Te gustaría reservar alguno?"
```

### Caso 2: Crear Reserva Conversacional

**Conversación:**
```
👤 Usuario: "Sí, quiero reservar Machu Picchu para 2 personas el 15 de febrero"

🤖 Asistente: [Usa tool: crear_reserva]
"¡Perfecto! He creado tu reserva:

📋 **Detalles de la Reserva**
- ID: RES-20260119-001
- Destino: Machu Picchu
- Fecha: 15 de febrero 2026
- Personas: 2
- Estado: Pendiente de pago
- Total: $300.00

Para completar tu reserva, necesitas realizar el pago. ¿Deseas proceder?"
```

### Caso 3: Consultar Reserva Existente

**Conversación:**
```
👤 Usuario: "¿Puedes mostrarme mi reserva RES-20260119-001?"

🤖 Asistente: [Usa tool: ver_reserva]
"Claro, aquí está tu reserva:

📋 **Reserva RES-20260119-001**
- Destino: Machu Picchu
- Fecha: 15 de febrero 2026
- Personas: 2
- Estado: ✅ Confirmada
- Total pagado: $300.00
- Fecha de creación: 15 de enero 2026

¿Necesitas modificar algo?"
```

### Caso 4: Buscar Guías Especializados

**Conversación:**
```
👤 Usuario: "Necesito un guía especializado en tours arqueológicos"

🤖 Asistente: [Usa tool: buscar_guias]
"He encontrado estos guías especializados:

1. **Juan Pérez**
   - Especialidad: Tours arqueológicos
   - Ubicación: Cusco
   - Rating: ⭐ 4.8/5
   - Idiomas: Español, Inglés, Quechua
   - Experiencia: 10 años
   - ✅ Disponible

2. **Carlos Quispe**
   - Especialidad: Trekking y arqueología
   - Ubicación: Arequipa
   - Rating: ⭐ 4.7/5
   - Idiomas: Español, Inglés, Francés
   - Experiencia: 12 años
   - ❌ No disponible

¿Te gustaría contactar a Juan Pérez?"
```

### Caso 5: Reporte de Estadísticas

**Conversación:**
```
👤 Usuario: "Muéstrame las estadísticas de ventas de este mes"

🤖 Asistente: [Usa tool: estadisticas_ventas]
"Aquí está el reporte de ventas de enero 2026:

📊 **Resumen General**
- Total de reservas: 45
- Ingresos totales: $6,750
- Promedio por reserva: $150
- Total de personas: 98

📍 **Destinos Más Populares**
1. Machu Picchu - 18 reservas ($2,700)
2. Lago Titicaca - 12 reservas ($1,440)
3. Líneas de Nazca - 10 reservas ($1,440)
4. Valle Sagrado - 5 reservas ($1,170)

📈 **Tendencia**
Las ventas han aumentado un 25% respecto al mes anterior."
```

## 🖼️ Casos de Uso Multimodal

### Caso 6: Análisis de Imagen (Ticket)

**Proceso:**
```
1. Usuario sube imagen de un ticket turístico
2. Escribe: "¿Qué información contiene este ticket?"

🤖 Asistente:
"He analizado tu ticket y he extraído la siguiente información:

📄 **Información del Ticket**
- Destino: Machu Picchu
- Fecha: 15/02/2026
- Hora: 08:00 AM
- Número de personas: 2
- Tipo: Entrada general
- Precio: $150.00
- Código de barras: MP-2026-12345

El ticket es válido y está confirmado. Recuerda llegar 30 minutos antes."
```

### Caso 7: Análisis de Imagen (Foto de Lugar)

**Proceso:**
```
1. Usuario sube foto de un lugar
2. Escribe: "¿Qué lugar es este?"

🤖 Asistente:
"Basándome en la imagen, parece ser Machu Picchu. Puedo ofrecerte:

🏔️ **Machu Picchu**
- Ubicación: Cusco, Perú
- Altura: 2,430 msnm
- Patrimonio de la Humanidad UNESCO
- Mejor época: Mayo - Octubre

¿Te gustaría información sobre tours disponibles?"
```

### Caso 8: Extracción de PDF (Factura)

**Proceso:**
```
1. Usuario sube PDF de factura
2. Escribe: "Resume esta factura"

🤖 Asistente:
"He analizado tu factura. Aquí está el resumen:

🧾 **Factura de Turismo**
- Número: FACT-2026-001
- Fecha: 10 de enero 2026
- Cliente: Juan Pérez
- NIF: 12345678A

📋 **Servicios**
- Tour Machu Picchu: $150.00 x 2 = $300.00
- Guía turístico: $50.00
- Transporte: $30.00
- Subtotal: $380.00
- IVA (18%): $68.40
- **Total: $448.40**

Estado: ✅ Pagado
Método: Tarjeta de crédito

¿Necesitas alguna aclaración?"
```

### Caso 9: Extracción de PDF (Itinerario)

**Proceso:**
```
1. Usuario sube PDF de itinerario
2. Escribe: "¿Qué actividades tengo programadas?"

🤖 Asistente:
"Tu itinerario para el tour de Cusco:

📅 **Día 1 - 15 de febrero**
08:00 - Salida del hotel
09:30 - Llegada a Machu Picchu
10:00 - Tour guiado (3 horas)
13:00 - Almuerzo incluido
15:00 - Tiempo libre
17:00 - Retorno a Cusco

📅 **Día 2 - 16 de febrero**
08:00 - Valle Sagrado
12:00 - Pisac
14:00 - Ollantaytambo
18:00 - Retorno al hotel

¿Quieres que te recuerde estas actividades?"
```

## 🔄 Cambio de Proveedor de IA

### Usando Gemini

```
👤 Usuario: [Selector: Gemini]
"Explícame sobre la cultura inca"

🤖 Asistente (Powered by Gemini):
"La cultura inca fue una de las civilizaciones más importantes de América...
[Respuesta detallada de Gemini]"
```

### Usando OpenAI

```
👤 Usuario: [Selector: OpenAI]
"Explícame sobre la cultura inca"

🤖 Asistente (Powered by OpenAI):
"Los incas desarrollaron un imperio que abarcó gran parte de Sudamérica...
[Respuesta de GPT]"
```

## 🎭 Conversaciones Complejas

### Caso 10: Múltiples Herramientas

**Conversación:**
```
👤 Usuario: "Busca destinos de playa, elige el más barato y créame una reserva para 2 personas el 20 de febrero"

🤖 Asistente: 
[Usa tool: buscar_destinos con categoria="playa"]
"Encontré estas playas:
- Máncora: $80
- Paracas: $65
- Tumbes: $55

El más económico es Tumbes."

[Usa tool: crear_reserva]
"He creado tu reserva:
- Destino: Tumbes
- Fecha: 20 de febrero 2026
- Personas: 2
- Total: $110
- ID: RES-20260119-002

¿Procedo con el pago?"
```

### Caso 11: Análisis y Acción

**Proceso:**
```
1. Usuario sube imagen de un brochure turístico
2. Escribe: "Quiero reservar el tour que aparece aquí"

🤖 Asistente:
"He analizado el brochure. Muestra el 'Tour Valle Sagrado':
- Duración: 1 día
- Incluye: Transporte, guía, almuerzo
- Precio: $85 por persona

[Usa tool: buscar_destinos query="Valle Sagrado"]
"He encontrado el tour en nuestro sistema.

[Usa tool: crear_reserva]
"¿Para cuántas personas y qué fecha deseas reservar?"

👤 Usuario: "Para 3 personas, el 25 de febrero"

🤖 Asistente:
"¡Reserva confirmada!
- Tour: Valle Sagrado
- Fecha: 25 de febrero 2026
- Personas: 3
- Total: $255
- ID: RES-20260119-003"
```

## 🧪 Pruebas desde el Frontend

### Test 1: Chat Simple

```javascript
// En el componente FloatingChatWidget
1. Abrir el widget
2. Escribir: "Hola, ¿qué puedes hacer?"
3. Enviar
4. Observar respuesta con lista de capacidades
```

### Test 2: Subir Imagen

```javascript
1. Click en icono 📷
2. Seleccionar imagen de ticket
3. Escribir: "Analiza este ticket"
4. Enviar
5. Observar extracción de información
```

### Test 3: Subir PDF

```javascript
1. Click en icono 📄
2. Seleccionar PDF de factura
3. Escribir: "Resume este documento"
4. Enviar
5. Observar análisis del PDF
```

### Test 4: Cambiar Proveedor

```javascript
1. Hacer pregunta con Gemini
2. Cambiar selector a OpenAI
3. Hacer la misma pregunta
4. Comparar respuestas
```

## 📊 Resultados Esperados

### ✅ Validaciones

- El chatbot responde en menos de 5 segundos
- Las herramientas MCP se ejecutan correctamente
- OCR extrae texto de imágenes legibles
- PDFs se procesan sin errores
- El historial se mantiene durante la conversación
- Los errores se manejan gracefully

### 🎯 KPIs

- Precisión de OCR: >80%
- Tiempo de respuesta: <5s
- Tasa de éxito de herramientas: >95%
- Satisfacción del usuario: Alta

## 🐛 Manejo de Errores

### Error: API Key inválida

```
🤖 Asistente:
"Lo siento, hay un problema con la configuración de la API.
Por favor, verifica las credenciales del proveedor de IA."
```

### Error: Servicio no disponible

```
🤖 Asistente:
"Temporalmente no puedo conectar con el servicio de reservas.
Usando información en caché para ayudarte..."
```

### Error: Archivo no válido

```
🤖 Asistente:
"El archivo que subiste no es válido. 
Por favor, sube una imagen (JPG, PNG) o un PDF."
```

## 🔗 Scripts de Prueba PowerShell

### Script completo de prueba

```powershell
# test_chatbot.ps1

Write-Host "🧪 Iniciando pruebas del chatbot..." -ForegroundColor Cyan

# Test 1: Chat de texto
Write-Host "`n1️⃣ Test: Chat de texto" -ForegroundColor Yellow
$body = @{
    message = "Busca destinos de montaña"
    provider = "gemini"
    use_tools = $true
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8004/chat/text" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "✅ Respuesta recibida" -ForegroundColor Green
Write-Host $response.response

# Test 2: Listar herramientas
Write-Host "`n2️⃣ Test: Listar herramientas MCP" -ForegroundColor Yellow
$tools = Invoke-RestMethod -Uri "http://localhost:8005/tools"
Write-Host "✅ Herramientas disponibles: $($tools.tools.Count)" -ForegroundColor Green

# Test 3: Buscar destinos
Write-Host "`n3️⃣ Test: Buscar destinos" -ForegroundColor Yellow
$body = @{
    params = @{
        query = "playa"
    }
} | ConvertTo-Json

$destinos = Invoke-RestMethod -Uri "http://localhost:8005/tools/buscar_destinos" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "✅ Destinos encontrados: $($destinos.data.total)" -ForegroundColor Green

# Test 4: Estadísticas
Write-Host "`n4️⃣ Test: Estadísticas de ventas" -ForegroundColor Yellow
$body = @{
    params = @{}
} | ConvertTo-Json

$stats = Invoke-RestMethod -Uri "http://localhost:8005/tools/estadisticas_ventas" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "✅ Total reservas: $($stats.data.resumen.total_reservas)" -ForegroundColor Green

Write-Host "`n🎉 Todas las pruebas completadas!" -ForegroundColor Green
```

---

**💡 Tip:** Usa estos ejemplos como referencia para probar todas las funcionalidades del chatbot.
