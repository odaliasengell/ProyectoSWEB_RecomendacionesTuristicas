package handlers

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/services"
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
	w.Header().Set("Location", "/contrataciones/"+strconv.FormatUint(uint64(id), 10))
	w.WriteHeader(http.StatusCreated)
}
