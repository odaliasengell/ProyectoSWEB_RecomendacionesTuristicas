package main

import "time"

// Event representa un evento que se envía a través del WebSocket
type Event struct {
	Type      string                 `json:"type"`      // Tipo de evento
	Message   string                 `json:"message"`   // Mensaje descriptivo
	Data      map[string]interface{} `json:"data"`      // Datos adicionales
	Timestamp time.Time              `json:"timestamp"` // Marca de tiempo
}

// NewEvent crea un nuevo evento con timestamp automático
func NewEvent(eventType string, message string, data map[string]interface{}) Event {
	return Event{
		Type:      eventType,
		Message:   message,
		Data:      data,
		Timestamp: time.Now(),
	}
}

// Tipos de eventos predefinidos
const (
	// Eventos de usuario
	EventUsuarioRegistrado   = "usuario_registrado"
	EventUsuarioInicioSesion = "usuario_inicio_sesion"

	// Eventos de reserva
	EventReservaCreada      = "reserva_creada"
	EventReservaActualizada = "reserva_actualizada"
	EventReservaCancelada   = "reserva_cancelada"

	// Eventos de contratación
	EventServicioContratado = "servicio_contratado"

	// Eventos de recomendación
	EventRecomendacionCreada = "recomendacion_creada"

	// Eventos de administración
	EventTourCreado      = "tour_creado"
	EventTourActualizado = "tour_actualizado"
	EventTourEliminado   = "tour_eliminado"

	EventServicioCreado      = "servicio_creado"
	EventServicioActualizado = "servicio_actualizado"
	EventServicioEliminado   = "servicio_eliminado"

	EventDestinoCreado      = "destino_creado"
	EventDestinoActualizado = "destino_actualizado"
	EventDestinoEliminado   = "destino_eliminado"

	EventGuiaCreado      = "guia_creado"
	EventGuiaActualizado = "guia_actualizado"
	EventGuiaEliminado   = "guia_eliminado"

	// Eventos del sistema
	EventSistemaActualizado = "sistema_actualizado"
	EventError              = "error"
)
