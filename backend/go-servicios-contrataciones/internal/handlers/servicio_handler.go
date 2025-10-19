package handlers

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/services"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	
	"github.com/gorilla/mux"
)

func ListServicios(w http.ResponseWriter, r *http.Request) {
	servicios := services.ListServicios()
	json.NewEncoder(w).Encode(servicios)
}

func GetServicioByID(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("DEBUG: PANIC en GetServicioByID: %v\n", r)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
	}()
	
	fmt.Printf("DEBUG: GetServicioByID called\n")
	vars := mux.Vars(r)
	idStr := vars["id"]
	fmt.Printf("DEBUG: ID string: %s\n", idStr)
	
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		fmt.Printf("DEBUG: Error parsing ID: %v\n", err)
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	fmt.Printf("DEBUG: Parsed ID: %d\n", id)
	
	servicio, err := services.GetServicioByID(uint(id))
	if err != nil {
		fmt.Printf("DEBUG: Error getting servicio: %v\n", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	fmt.Printf("DEBUG: Servicio found: %+v\n", servicio)
	
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(servicio); err != nil {
		fmt.Printf("DEBUG: Error encoding response: %v\n", err)
	}
	fmt.Printf("DEBUG: Response sent successfully\n")
}

func CreateServicio(w http.ResponseWriter, r *http.Request) {
	// Agregar logging para debug
	fmt.Printf("DEBUG: Recibiendo petición CREATE servicio\n")
	
	var payload struct {
		Nombre       string  `json:"nombre"`
		Descripcion  string  `json:"descripcion"`
		Precio       float64 `json:"precio"`
		Categoria    string  `json:"categoria"`
		Destino      string  `json:"destino"`
		DuracionDias int     `json:"duracion_dias"`
	}
	
	// Recuperar en caso de panic
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("DEBUG: PANIC en CreateServicio: %v\n", r)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
	}()
	
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		fmt.Printf("DEBUG: Error decodificando JSON: %v\n", err)
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	
	fmt.Printf("DEBUG: Payload recibido: %+v\n", payload)
	
	id, err := services.CreateServicio(models.Servicio{
		Nombre: payload.Nombre, 
		Descripcion: payload.Descripcion, 
		Precio: payload.Precio, 
		Categoria: payload.Categoria, 
		Destino: payload.Destino, 
		DuracionDias: payload.DuracionDias,
	})
	
	if err != nil {
		fmt.Printf("DEBUG: Error creando servicio: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	fmt.Printf("DEBUG: Servicio creado con ID: %d\n", id)
	
	w.Header().Set("Location", "/servicios/"+strconv.FormatUint(uint64(id), 10))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	
	// Devolver el ID en el body también
	response := map[string]interface{}{
		"id": id,
		"message": "Servicio creado exitosamente",
	}
	
	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("DEBUG: Error encoding response: %v\n", err)
	}
	
	fmt.Printf("DEBUG: Respuesta enviada exitosamente\n")
}
