package handlers

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/services"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func ListServicios(w http.ResponseWriter, r *http.Request) {
	fmt.Println("🔵 DEBUG: ListServicios handler llamado")
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("❌ DEBUG: PANIC en ListServicios: %v\n", r)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Internal server error"})
		}
	}()

	fmt.Println("🔵 DEBUG: Llamando services.ListServicios()")
	servicios := services.ListServicios()
	fmt.Printf("🔵 DEBUG: Recibidos %d servicios\n", len(servicios))

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(servicios); err != nil {
		fmt.Printf("❌ Error encoding servicios: %v\n", err)
	}
	fmt.Println("✅ DEBUG: ListServicios completado")
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

	// Convertir el string a ObjectID de MongoDB
	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		fmt.Printf("DEBUG: Error parsing ObjectID: %v\n", err)
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}
	fmt.Printf("DEBUG: Parsed ObjectID: %s\n", objectID.Hex())

	servicio, err := services.GetServicioByObjectID(objectID)
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
		Nombre           string  `json:"nombre"`
		Descripcion      string  `json:"descripcion"`
		Precio           float64 `json:"precio"`
		Categoria        string  `json:"categoria"`
		Destino          string  `json:"destino"`
		DuracionDias     int     `json:"duracion_dias"`
		CapacidadMaxima  int     `json:"capacidad_maxima"`
		Disponible       bool    `json:"disponible"`
		Proveedor        string  `json:"proveedor"`
		TelefonoContacto string  `json:"telefono_contacto"`
		EmailContacto    string  `json:"email_contacto"`
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
		Nombre:           payload.Nombre,
		Descripcion:      payload.Descripcion,
		Precio:           payload.Precio,
		Categoria:        payload.Categoria,
		Destino:          payload.Destino,
		DuracionDias:     payload.DuracionDias,
		CapacidadMaxima:  payload.CapacidadMaxima,
		Disponible:       payload.Disponible,
		Proveedor:        payload.Proveedor,
		TelefonoContacto: payload.TelefonoContacto,
		EmailContacto:    payload.EmailContacto,
	})

	if err != nil {
		fmt.Printf("DEBUG: Error creando servicio: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Printf("DEBUG: Servicio creado con ID: %s\n", id.Hex())

	w.Header().Set("Location", "/servicios/"+id.Hex())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	// Devolver el ID en el body también
	response := map[string]interface{}{
		"id":      id.Hex(),
		"message": "Servicio creado exitosamente",
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("DEBUG: Error encoding response: %v\n", err)
	}

	fmt.Printf("DEBUG: Respuesta enviada exitosamente\n")
}

func UpdateServicio(w http.ResponseWriter, r *http.Request) {
	fmt.Println("🔵 DEBUG: UpdateServicio handler llamado")
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("❌ DEBUG: PANIC en UpdateServicio: %v\n", r)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Internal server error"})
		}
	}()

	vars := mux.Vars(r)
	idStr := vars["id"]
	fmt.Printf("🔵 DEBUG: Actualizando servicio ID: %s\n", idStr)

	// Convertir string ID a ObjectID
	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		fmt.Printf("❌ Error convirtiendo ID: %v\n", err)
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var payload struct {
		Nombre           string  `json:"nombre"`
		Descripcion      string  `json:"descripcion"`
		Precio           float64 `json:"precio"`
		Categoria        string  `json:"categoria"`
		Destino          string  `json:"destino"`
		DuracionDias     int     `json:"duracion_dias"`
		CapacidadMaxima  int     `json:"capacidad_maxima"`
		Disponible       bool    `json:"disponible"`
		Proveedor        string  `json:"proveedor"`
		TelefonoContacto string  `json:"telefono_contacto"`
		EmailContacto    string  `json:"email_contacto"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		fmt.Printf("❌ Error decodificando JSON: %v\n", err)
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	fmt.Printf("🔵 DEBUG: Payload recibido: %+v\n", payload)

	// Actualizar en MongoDB
	servicio := models.Servicio{
		Nombre:           payload.Nombre,
		Descripcion:      payload.Descripcion,
		Precio:           payload.Precio,
		Categoria:        payload.Categoria,
		Destino:          payload.Destino,
		DuracionDias:     payload.DuracionDias,
		CapacidadMaxima:  payload.CapacidadMaxima,
		Disponible:       payload.Disponible,
		Proveedor:        payload.Proveedor,
		TelefonoContacto: payload.TelefonoContacto,
		EmailContacto:    payload.EmailContacto,
	}

	if err := services.UpdateServicio(objectID, servicio); err != nil {
		fmt.Printf("❌ Error actualizando servicio: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"id":      idStr,
		"message": "Servicio actualizado exitosamente",
	}
	json.NewEncoder(w).Encode(response)
	fmt.Println("✅ DEBUG: UpdateServicio completado")
}

func DeleteServicio(w http.ResponseWriter, r *http.Request) {
	fmt.Println("🔵 DEBUG: DeleteServicio handler llamado")
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("❌ DEBUG: PANIC en DeleteServicio: %v\n", r)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Internal server error"})
		}
	}()

	vars := mux.Vars(r)
	idStr := vars["id"]
	fmt.Printf("🔵 DEBUG: Eliminando servicio ID: %s\n", idStr)

	// Convertir string ID a ObjectID
	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		fmt.Printf("❌ Error convirtiendo ID: %v\n", err)
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	// Eliminar de MongoDB
	if err := services.DeleteServicio(objectID); err != nil {
		fmt.Printf("❌ Error eliminando servicio: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"message": "Servicio eliminado exitosamente",
	}
	json.NewEncoder(w).Encode(response)
	fmt.Println("✅ DEBUG: DeleteServicio completado")
}
