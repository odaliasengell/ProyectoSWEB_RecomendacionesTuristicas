package handlers

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/services"
	"backend-golang-rest/internal/utils"
	"backend-golang-rest/internal/ws"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func ListContrataciones(w http.ResponseWriter, r *http.Request) {
	contrataciones := services.ListContrataciones()
	json.NewEncoder(w).Encode(contrataciones)
}

func CreateContratacion(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		ServicioID        string  `json:"servicio_id"`
		ClienteNombre     string  `json:"cliente_nombre"`
		ClienteEmail      string  `json:"cliente_email"`
		ClienteTelefono   string  `json:"cliente_telefono"`
		FechaContratacion string  `json:"fecha_contratacion"`
		FechaInicio       string  `json:"fecha_inicio"`
		FechaFin          string  `json:"fecha_fin"`
		NumViajeros       int     `json:"num_viajeros"`
		Moneda            string  `json:"moneda"`
		PrecioUnitario    float64 `json:"precio_unitario"`
		Descuento         float64 `json:"descuento"`
		Total             float64 `json:"total"`
		Estado            string  `json:"estado"`
		Notas             string  `json:"notas"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Convertir ServicioID de string a ObjectID
	servicioObjID, err := primitive.ObjectIDFromHex(payload.ServicioID)
	if err != nil {
		http.Error(w, "invalid servicio_id", http.StatusBadRequest)
		return
	}

	fechaContratacion, err := time.Parse(time.RFC3339, payload.FechaContratacion)
	if err != nil {
		http.Error(w, "invalid fecha_contratacion", http.StatusBadRequest)
		return
	}

	inicio, err := time.Parse(time.RFC3339, payload.FechaInicio)
	if err != nil {
		http.Error(w, "invalid start date", http.StatusBadRequest)
		return
	}

	fin, err := time.Parse(time.RFC3339, payload.FechaFin)
	if err != nil {
		http.Error(w, "invalid end date", http.StatusBadRequest)
		return
	}

	// Usar el total calculado del frontend o recalcular si es necesario
	total := payload.Total
	if total == 0 {
		total = services.CalculateTotal(servicioObjID, payload.NumViajeros, inicio, fin)
	}

	contratacion := models.ContratacionServicio{
		ServicioID:        servicioObjID,
		ClienteNombre:     payload.ClienteNombre,
		ClienteEmail:      payload.ClienteEmail,
		ClienteTelefono:   payload.ClienteTelefono,
		FechaContratacion: fechaContratacion,
		FechaInicio:       inicio,
		FechaFin:          fin,
		NumViajeros:       payload.NumViajeros,
		Moneda:            payload.Moneda,
		PrecioUnitario:    payload.PrecioUnitario,
		Descuento:         payload.Descuento,
		Total:             total,
		Estado:            payload.Estado,
		Notas:             payload.Notas,
	}

	id, err := services.CreateContratacion(contratacion)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if hub := ws.Default(); hub != nil {
		hub.Emit([]byte(`{"event":"contratacion_creada","id":"` + id.Hex() + `"}`))
	}

	// Notificar al servidor WebSocket externo (vía endpoint REST /notify)
	notifier := utils.NewWSNotifier()
	// Enviar notificación con el nuevo formato de eventos
	notifyPayload := map[string]any{
		"id_contratacion":    id.Hex(),
		"id_servicio":        payload.ServicioID,
		"servicio_nombre":    "Servicio Turístico",
		"id_usuario":         payload.ClienteEmail,
		"usuario_nombre":     payload.ClienteNombre,
		"fecha_contratacion": fechaContratacion.Format(time.RFC3339),
		"precio":             total,
	}

	room := "dashboard"
	log.Printf("🔔 Intentando notificar contratación al WebSocket")
	log.Printf("📤 Evento: nueva_contratacion, Payload: %+v", notifyPayload)

	notifier.SafeNotify("nueva_contratacion", notifyPayload, &room)

	log.Printf("✅ Notificación de contratación enviada (ID: %s)", id.Hex())

	w.Header().Set("Location", "/contrataciones/"+id.Hex())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	// Devolver el ID en el body también
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id": id,
	})
}

// GetContratacionesByEmail obtiene todas las contrataciones de un cliente por su email
func GetContratacionesByEmail(w http.ResponseWriter, r *http.Request) {
	// Obtener el email de los parámetros de la ruta
	vars := mux.Vars(r)
	email := vars["email"]

	if email == "" {
		http.Error(w, "email is required", http.StatusBadRequest)
		return
	}

	// Obtener las contrataciones del servicio
	contrataciones, err := services.GetContratacionesByEmail(email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Enriquecer las contrataciones con datos del servicio
	type ContratacionConServicio struct {
		models.ContratacionServicio
		Servicio *models.Servicio `json:"servicio,omitempty"`
	}

	var resultado []ContratacionConServicio
	for _, cont := range contrataciones {
		item := ContratacionConServicio{
			ContratacionServicio: cont,
		}

		// Obtener datos del servicio
		servicio, err := services.GetServicioByObjectID(cont.ServicioID)
		if err == nil {
			item.Servicio = servicio
		}

		resultado = append(resultado, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultado)
}

// CancelContratacion cancela una contratación existente
func CancelContratacion(w http.ResponseWriter, r *http.Request) {
	// Obtener el ID de los parámetros de la ruta
	vars := mux.Vars(r)
	idStr := vars["id"]

	if idStr == "" {
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}

	// Convertir string a ObjectID
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "invalid id format", http.StatusBadRequest)
		return
	}

	// Verificar que la contratación existe y obtener el email del cliente
	contratacion, err := services.GetContratacionByID(id)
	if err != nil {
		http.Error(w, "contratacion not found", http.StatusNotFound)
		return
	}

	// Verificar que la contratación no esté ya cancelada
	if contratacion.Estado == "cancelada" {
		http.Error(w, "contratacion already cancelled", http.StatusBadRequest)
		return
	}

	// Actualizar el estado a "cancelada"
	err = services.CancelContratacion(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Notificar vía WebSocket
	if hub := ws.Default(); hub != nil {
		hub.Emit([]byte(`{"event":"contratacion_cancelada","id":"` + id.Hex() + `"}`))
	}

	notifier := utils.NewWSNotifier()
	notifyPayload := map[string]any{
		"id":             id.Hex(),
		"cliente_email":  contratacion.ClienteEmail,
		"estado":         "cancelada",
		"cancelado_en":   time.Now().Format(time.RFC3339),
		"source_service": "go-servicios-contrataciones",
	}
	notifier.SafeNotify("contratacion_cancelada", notifyPayload, nil)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Contratación cancelada exitosamente",
	})
}

// UpdateContratacionEstado actualiza el estado de una contratación
func UpdateContratacionEstado(w http.ResponseWriter, r *http.Request) {
	// Obtener el ID de los parámetros de la ruta
	vars := mux.Vars(r)
	idStr := vars["id"]

	if idStr == "" {
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}

	// Convertir string a ObjectID
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "invalid id format", http.StatusBadRequest)
		return
	}

	// Decodificar el payload
	var payload struct {
		Estado string `json:"estado"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validar el estado
	if payload.Estado == "" {
		http.Error(w, "estado is required", http.StatusBadRequest)
		return
	}

	// Verificar que la contratación existe
	contratacion, err := services.GetContratacionByID(id)
	if err != nil {
		http.Error(w, "contratacion not found", http.StatusNotFound)
		return
	}

	// Actualizar el estado usando el servicio existente
	err = services.UpdateContratacionEstado(id, payload.Estado)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Notificar vía WebSocket
	if hub := ws.Default(); hub != nil {
		hub.Emit([]byte(`{"event":"contratacion_actualizada","id":"` + id.Hex() + `","estado":"` + payload.Estado + `"}`))
	}

	notifier := utils.NewWSNotifier()
	notifyPayload := map[string]any{
		"id":             id.Hex(),
		"cliente_email":  contratacion.ClienteEmail,
		"estado":         payload.Estado,
		"actualizado_en": time.Now().Format(time.RFC3339),
		"source_service": "go-servicios-contrataciones",
	}
	notifier.SafeNotify("contratacion_actualizada", notifyPayload, nil)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Contratación actualizada exitosamente",
		"estado":  payload.Estado,
	})
}
