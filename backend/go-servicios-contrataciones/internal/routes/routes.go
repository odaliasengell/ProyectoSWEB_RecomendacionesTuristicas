package routes

import (
	graphqlschema "backend-golang-rest/internal/graphql"
	"backend-golang-rest/internal/handlers"
	"backend-golang-rest/internal/ws"
	"net/http"

	"github.com/gorilla/mux"
	gqlhandler "github.com/graphql-go/handler"
)

func SetupRoutes() *mux.Router {
	router := mux.NewRouter()

	router.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("pong"))
	}).Methods("GET")

	router.HandleFunc("/servicios", handlers.ListServicios).Methods("GET")
	router.HandleFunc("/servicios", handlers.CreateServicio).Methods("POST")
	router.HandleFunc("/contrataciones", handlers.ListContrataciones).Methods("GET")
	router.HandleFunc("/contrataciones", handlers.CreateContratacion).Methods("POST")

	// GraphQL
	schema, _ := graphqlschema.NewSchema()
	gh := gqlhandler.New(&gqlhandler.Config{
		Schema:   &schema,
		Pretty:   true,
		GraphiQL: true,
	})
	router.Path("/graphql").Handler(gh)

	// WebSocket
	hub := ws.NewHub()
	ws.SetDefault(hub)
	router.HandleFunc("/ws", hub.HandleWS)

	return router
}
