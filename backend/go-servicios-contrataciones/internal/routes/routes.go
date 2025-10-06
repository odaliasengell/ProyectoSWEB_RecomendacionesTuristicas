package routes

import (
	"backend-golang-rest/internal/handlers"
	"net/http"

	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	router := mux.NewRouter()

	router.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("pong"))
	}).Methods("GET")

	router.HandleFunc("/servicios", handlers.ListServicios).Methods("GET")
	router.HandleFunc("/contrataciones", handlers.ListContrataciones).Methods("GET")

	return router
}

