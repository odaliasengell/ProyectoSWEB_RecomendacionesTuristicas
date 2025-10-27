package routes

import (
	// graphqlschema "backend-golang-rest/internal/graphql"
	"backend-golang-rest/internal/handlers"
	// "backend-golang-rest/internal/ws"
	"net/http"

	"github.com/gorilla/mux"
	// gqlhandler "github.com/graphql-go/handler"
)

// CORS middleware
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func SetupRoutes() *mux.Router {
	router := mux.NewRouter()

	router.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("pong"))
	}).Methods("GET")

	router.HandleFunc("/servicios", handlers.ListServicios).Methods("GET")
	router.HandleFunc("/servicios/{id}", handlers.GetServicioByID).Methods("GET")
	router.HandleFunc("/servicios", handlers.CreateServicio).Methods("POST")
	router.HandleFunc("/servicios/{id}", handlers.UpdateServicio).Methods("PUT")
	router.HandleFunc("/servicios/{id}", handlers.DeleteServicio).Methods("DELETE")
	router.HandleFunc("/contrataciones", handlers.ListContrataciones).Methods("GET")
	router.HandleFunc("/contrataciones", handlers.CreateContratacion).Methods("POST")

	// GraphQL - TEMPORALMENTE DESHABILITADO PARA DEBUG
	// schema, _ := graphqlschema.NewSchema()
	// gh := gqlhandler.New(&gqlhandler.Config{
	// 	Schema:   &schema,
	// 	Pretty:   true,
	// 	GraphiQL: true,
	// })
	// router.Path("/graphql").Handler(gh)

	// WebSocket - TEMPORALMENTE DESHABILITADO PARA DEBUG
	// hub := ws.NewHub()
	// ws.SetDefault(hub)
	// router.HandleFunc("/ws", hub.HandleWS)

	// CORS DESHABILITADO PARA DEBUG
	// router.Use(enableCORS)

	return router
}
