package main

import (
	"backend-golang-rest/internal/routes"
	"log"
	"net/http"
)

func main() {
	router := routes.SetupRoutes()

	log.Println("Servidor escuchando en puerto 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}

