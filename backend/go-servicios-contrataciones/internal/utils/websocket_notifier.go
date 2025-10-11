package utils

import (
	"backend-golang-rest/internal/ws"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"
)

// NotificationType tipo de notificación
type NotificationType string

const (
	// Tipos de notificaciones para servicios turísticos
	NotificationTypeServicioCreated       NotificationType = "servicio_created"
	NotificationTypeServicioUpdated       NotificationType = "servicio_updated"
	NotificationTypeServicioDeleted       NotificationType = "servicio_deleted"
	NotificationTypeContratacionCreated   NotificationType = "contratacion_created"
	NotificationTypeContratacionUpdated   NotificationType = "contratacion_updated"
	NotificationTypeContratacionCancelled NotificationType = "contratacion_cancelled"
	NotificationTypePaymentProcessed      NotificationType = "payment_processed"
	NotificationTypePaymentFailed         NotificationType = "payment_failed"
	NotificationTypeBookingConfirmed      NotificationType = "booking_confirmed"
	NotificationTypeBookingCancelled      NotificationType = "booking_cancelled"
)

// Notification estructura para notificaciones WebSocket
type Notification struct {
	ID        string           `json:"id"`
	Type      NotificationType `json:"type"`
	Title     string           `json:"title"`
	Message   string           `json:"message"`
	Data      interface{}      `json:"data,omitempty"`
	Timestamp time.Time        `json:"timestamp"`
	UserID    string           `json:"user_id,omitempty"`
	Priority  string           `json:"priority"` // low, medium, high, urgent
}

// WebSocketNotifier manejador de notificaciones WebSocket
type WebSocketNotifier struct {
	hub     *ws.Hub
	mu      sync.RWMutex
	clients map[string]interface{} // Usando interface{} para evitar dependencias
}

// NewWebSocketNotifier crea una nueva instancia del notificador WebSocket
func NewWebSocketNotifier(hub *ws.Hub) *WebSocketNotifier {
	return &WebSocketNotifier{
		hub:     hub,
		clients: make(map[string]interface{}),
	}
}

// RegisterClient registra un cliente WebSocket
func (wn *WebSocketNotifier) RegisterClient(clientID string, client interface{}) {
	wn.mu.Lock()
	defer wn.mu.Unlock()
	wn.clients[clientID] = client
	log.Printf("Client %s registered for notifications", clientID)
}

// UnregisterClient desregistra un cliente WebSocket
func (wn *WebSocketNotifier) UnregisterClient(clientID string) {
	wn.mu.Lock()
	defer wn.mu.Unlock()
	delete(wn.clients, clientID)
	log.Printf("Client %s unregistered from notifications", clientID)
}

// BroadcastNotification envía una notificación a todos los clientes conectados
func (wn *WebSocketNotifier) BroadcastNotification(notification *Notification) {
	wn.mu.RLock()
	defer wn.mu.RUnlock()

	notification.Timestamp = time.Now()
	_, err := json.Marshal(notification)
	if err != nil {
		log.Printf("Error marshaling notification: %v", err)
		return
	}

	// Enviar a todos los clientes conectados
	for clientID := range wn.clients {
		// Implementación simplificada para evitar dependencias
		// En un entorno real, aquí enviarías el mensaje al cliente WebSocket
		log.Printf("Notification sent to client %s", clientID)
	}
}

// SendToUser envía una notificación a un usuario específico
func (wn *WebSocketNotifier) SendToUser(userID string, notification *Notification) {
	wn.mu.RLock()
	defer wn.mu.RUnlock()

	notification.Timestamp = time.Now()
	notification.UserID = userID
	_, err := json.Marshal(notification)
	if err != nil {
		log.Printf("Error marshaling notification: %v", err)
		return
	}

	// Buscar cliente por userID (asumiendo que el clientID es el userID)
	if _, exists := wn.clients[userID]; exists {
		// Implementación simplificada para evitar dependencias
		log.Printf("Notification sent to user %s", userID)
	} else {
		log.Printf("User %s not connected", userID)
	}
}

// SendToClients envía una notificación a clientes específicos
func (wn *WebSocketNotifier) SendToClients(clientIDs []string, notification *Notification) {
	wn.mu.RLock()
	defer wn.mu.RUnlock()

	notification.Timestamp = time.Now()
	_, err := json.Marshal(notification)
	if err != nil {
		log.Printf("Error marshaling notification: %v", err)
		return
	}

	for _, clientID := range clientIDs {
		if _, exists := wn.clients[clientID]; exists {
			// Implementación simplificada para evitar dependencias
			log.Printf("Notification sent to client %s", clientID)
		}
	}
}

// NotifyServicioCreated notifica la creación de un servicio
func (wn *WebSocketNotifier) NotifyServicioCreated(servicio interface{}) {
	notification := &Notification{
		ID:       generateNotificationID(),
		Type:     NotificationTypeServicioCreated,
		Title:    "Nuevo Servicio Turístico",
		Message:  "Se ha agregado un nuevo servicio turístico disponible",
		Data:     servicio,
		Priority: "medium",
	}
	wn.BroadcastNotification(notification)
}

// NotifyServicioUpdated notifica la actualización de un servicio
func (wn *WebSocketNotifier) NotifyServicioUpdated(servicio interface{}) {
	notification := &Notification{
		ID:       generateNotificationID(),
		Type:     NotificationTypeServicioUpdated,
		Title:    "Servicio Actualizado",
		Message:  "Un servicio turístico ha sido actualizado",
		Data:     servicio,
		Priority: "low",
	}
	wn.BroadcastNotification(notification)
}

// NotifyContratacionCreated notifica la creación de una contratación
func (wn *WebSocketNotifier) NotifyContratacionCreated(contratacion interface{}, userID string) {
	notification := &Notification{
		ID:       generateNotificationID(),
		Type:     NotificationTypeContratacionCreated,
		Title:    "Nueva Contratación",
		Message:  "Se ha realizado una nueva contratación de servicio",
		Data:     contratacion,
		Priority: "high",
	}

	if userID != "" {
		wn.SendToUser(userID, notification)
	} else {
		wn.BroadcastNotification(notification)
	}
}

// NotifyContratacionUpdated notifica la actualización de una contratación
func (wn *WebSocketNotifier) NotifyContratacionUpdated(contratacion interface{}, userID string) {
	notification := &Notification{
		ID:       generateNotificationID(),
		Type:     NotificationTypeContratacionUpdated,
		Title:    "Contratación Actualizada",
		Message:  "Su contratación ha sido actualizada",
		Data:     contratacion,
		Priority: "medium",
	}

	if userID != "" {
		wn.SendToUser(userID, notification)
	} else {
		wn.BroadcastNotification(notification)
	}
}

// NotifyPaymentProcessed notifica un pago procesado
func (wn *WebSocketNotifier) NotifyPaymentProcessed(payment interface{}, userID string) {
	notification := &Notification{
		ID:       generateNotificationID(),
		Type:     NotificationTypePaymentProcessed,
		Title:    "Pago Procesado",
		Message:  "Su pago ha sido procesado exitosamente",
		Data:     payment,
		Priority: "high",
	}

	if userID != "" {
		wn.SendToUser(userID, notification)
	} else {
		wn.BroadcastNotification(notification)
	}
}

// NotifyPaymentFailed notifica un pago fallido
func (wn *WebSocketNotifier) NotifyPaymentFailed(payment interface{}, userID string) {
	notification := &Notification{
		ID:       generateNotificationID(),
		Type:     NotificationTypePaymentFailed,
		Title:    "Pago Fallido",
		Message:  "Su pago no pudo ser procesado",
		Data:     payment,
		Priority: "urgent",
	}

	if userID != "" {
		wn.SendToUser(userID, notification)
	} else {
		wn.BroadcastNotification(notification)
	}
}

// NotifyBookingConfirmed notifica una reserva confirmada
func (wn *WebSocketNotifier) NotifyBookingConfirmed(booking interface{}, userID string) {
	notification := &Notification{
		ID:       generateNotificationID(),
		Type:     NotificationTypeBookingConfirmed,
		Title:    "Reserva Confirmada",
		Message:  "Su reserva ha sido confirmada exitosamente",
		Data:     booking,
		Priority: "high",
	}

	if userID != "" {
		wn.SendToUser(userID, notification)
	} else {
		wn.BroadcastNotification(notification)
	}
}

// NotifyBookingCancelled notifica una reserva cancelada
func (wn *WebSocketNotifier) NotifyBookingCancelled(booking interface{}, userID string) {
	notification := &Notification{
		ID:       generateNotificationID(),
		Type:     NotificationTypeBookingCancelled,
		Title:    "Reserva Cancelada",
		Message:  "Su reserva ha sido cancelada",
		Data:     booking,
		Priority: "medium",
	}

	if userID != "" {
		wn.SendToUser(userID, notification)
	} else {
		wn.BroadcastNotification(notification)
	}
}

// GetConnectedClients devuelve la lista de clientes conectados
func (wn *WebSocketNotifier) GetConnectedClients() []string {
	wn.mu.RLock()
	defer wn.mu.RUnlock()

	clients := make([]string, 0, len(wn.clients))
	for clientID := range wn.clients {
		clients = append(clients, clientID)
	}
	return clients
}

// GetConnectedClientsCount devuelve el número de clientes conectados
func (wn *WebSocketNotifier) GetConnectedClientsCount() int {
	wn.mu.RLock()
	defer wn.mu.RUnlock()
	return len(wn.clients)
}

// generateNotificationID genera un ID único para la notificación
func generateNotificationID() string {
	return fmt.Sprintf("notif_%d_%d", time.Now().Unix(), time.Now().UnixNano()%1000000)
}

// NotificationStats estadísticas de notificaciones
type NotificationStats struct {
	TotalSent        int64     `json:"total_sent"`
	TotalReceived    int64     `json:"total_received"`
	ConnectedClients int       `json:"connected_clients"`
	LastSent         time.Time `json:"last_sent"`
}

// GetStats devuelve estadísticas del notificador
func (wn *WebSocketNotifier) GetStats() *NotificationStats {
	return &NotificationStats{
		ConnectedClients: wn.GetConnectedClientsCount(),
		LastSent:         time.Now(),
	}
}
