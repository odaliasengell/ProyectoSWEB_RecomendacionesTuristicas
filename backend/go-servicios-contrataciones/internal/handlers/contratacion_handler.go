package handlers

import (
	"backend-golang-rest/internal/services"
	"encoding/json"
	"net/http"
)

func ListContrataciones(w http.ResponseWriter, r *http.Request) {
	contrataciones := services.ListContrataciones()
	json.NewEncoder(w).Encode(contrataciones)
}

