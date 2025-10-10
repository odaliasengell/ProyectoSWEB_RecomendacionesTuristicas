package handlers

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/services"
	"encoding/json"
	"net/http"
	"strconv"
)

func ListServicios(w http.ResponseWriter, r *http.Request) {
	servicios := services.ListServicios()
	json.NewEncoder(w).Encode(servicios)
}

func CreateServicio(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Nombre       string  `json:"nombre"`
		Descripcion  string  `json:"descripcion"`
		Precio       float64 `json:"precio"`
		Categoria    string  `json:"categoria"`
		Destino      string  `json:"destino"`
		DuracionDias int     `json:"duracion_dias"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	id, err := services.CreateServicio(models.Servicio{Nombre: payload.Nombre, Descripcion: payload.Descripcion, Precio: payload.Precio, Categoria: payload.Categoria, Destino: payload.Destino, DuracionDias: payload.DuracionDias})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Location", "/servicios/"+strconv.FormatUint(uint64(id), 10))
	w.WriteHeader(http.StatusCreated)
}
