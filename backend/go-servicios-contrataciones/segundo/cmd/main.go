package main

import (
	"backend-golang-rest/internal/config"
	"backend-golang-rest/internal/db"
	"backend-golang-rest/internal/routes"
	"log"
	"net/http"
)

func main() {
	database, err := db.Init("file:app.db?cache=shared&mode=rwc")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Migrate(database); err != nil {
		log.Fatal(err)
	}

	router := routes.SetupRoutes()

	port := config.GetHTTPPort()
	log.Println("Servidor escuchando en puerto", port)
	log.Fatal(http.ListenAndServe(port, router))
}
