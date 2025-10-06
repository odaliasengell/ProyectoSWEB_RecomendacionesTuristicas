package handlers

import (
	"backend-golang-rest/internal/services"
	"encoding/json"
	"net/http"
)

func ListServicios(w http.ResponseWriter, r *http.Request) {
	servicios := services.ListServicios()
	json.NewEncoder(w).Encode(servicios)
}

