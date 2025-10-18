package handlers

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/services"
	"backend-golang-rest/internal/utils"
	"backend-golang-rest/internal/ws"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

func ListContrataciones(w http.ResponseWriter, r *http.Request) {
	contrataciones := services.ListContrataciones()
	json.NewEncoder(w).Encode(contrataciones)
}

func CreateContratacion(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		ServicioID  uint   `json:"servicio_id"`
		FechaISO    string `json:"fecha"`
		FechaInicio string `json:"fecha_inicio"`
		FechaFin    string `json:"fecha_fin"`
		NumViajeros int    `json:"num_viajeros"`
		Moneda      string `json:"moneda"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	fecha, err := time.Parse(time.RFC3339, payload.FechaISO)
	if err != nil {
		http.Error(w, "invalid date", http.StatusBadRequest)
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

	total := services.CalculateTotal(payload.ServicioID, payload.NumViajeros, inicio, fin)

	id, err := services.CreateContratacion(models.ContratacionServicio{ServicioID: payload.ServicioID, FechaContratacion: fecha, FechaInicio: inicio, FechaFin: fin, NumViajeros: payload.NumViajeros, Moneda: payload.Moneda, Total: total})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if hub := ws.Default(); hub != nil {
		hub.Emit([]byte(`{"event":"contratacion_creada","id":` + strconv.FormatUint(uint64(id), 10) + `}`))
	}

	// Notificar al servidor WebSocket externo (vía endpoint REST /notify)
	notifier := utils.NewWSNotifier()
	// Construimos un payload con información útil
	notifyPayload := map[string]any{
		"id":             id,
		"servicio_id":    payload.ServicioID,
		"num_viajeros":   payload.NumViajeros,
		"moneda":         payload.Moneda,
		"total":          total,
		"fecha_inicio":   inicio.Format(time.RFC3339),
		"fecha_fin":      fin.Format(time.RFC3339),
		"creado_en":      time.Now().Format(time.RFC3339),
		"source_service": "go-servicios-contrataciones",
	}
	notifier.SafeNotify("contratacion_creada", notifyPayload, nil)

	w.Header().Set("Location", "/contrataciones/"+strconv.FormatUint(uint64(id), 10))
	w.WriteHeader(http.StatusCreated)
}
