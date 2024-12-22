# n8n Workflows - Event Bus

## Descripción
Workflows de n8n que actúan como Event Bus centralizado para eventos externos del sistema.

## Principio
**"Todo evento externo pasa por n8n"**

## Workflows Implementados

### 1. Payment Handler
- Recibe webhook de pasarela de pago
- Valida payload
- Activa servicio/reserva en la base de datos
- Notifica via WebSocket en tiempo real
- Envía email de confirmación
- Dispara webhook al grupo partner

### 2. Partner Handler
- Recibe webhook de grupo partner
- Verifica firma HMAC
- Procesa según tipo de evento
- Ejecuta acción de negocio
- Responde ACK

### 3. Scheduled Tasks
- Cron job para reportes diarios
- Limpieza de datos
- Health checks
- Recordatorios automáticos

### 4. MCP Input Handler (Opcional)
- Recibe mensaje de Telegram/Email
- Extrae contenido y adjuntos
- Envía a AI Orchestrator
- Responde por el mismo canal

## Instalación de n8n

### Via Docker (Recomendado)
```powershell
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```

### Via npm
```powershell
npm install -g n8n
n8n
```

## Configuración

Acceder a: `http://localhost:5678`

## Importar Workflows

1. Abrir n8n
2. Click en "+" para nuevo workflow
3. Click en los 3 puntos → Import from File
4. Seleccionar archivo JSON del workflow

## Responsable
**Odalis Senge** - Configuración de n8n workflows

## Fecha de Implementación
Semana 3: 7-9 Enero 2026
