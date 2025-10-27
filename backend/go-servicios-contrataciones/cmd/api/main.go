package main

import (
	"backend-golang-rest/internal/config"
	"backend-golang-rest/internal/db"
	"backend-golang-rest/internal/routes"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	// Cargar configuración
	cfg := config.LoadConfig()
	log.Printf("Starting server in %s mode", cfg.Server.Environment)

	// Obtener configuración de MongoDB desde variables de entorno
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	dbName := os.Getenv("DATABASE_NAME")
	if dbName == "" {
		dbName = "modulo_go" // Base de datos modular
	}

	// Inicializar MongoDB
	_, err := db.Init(mongoURI, dbName)
	if err != nil {
		log.Fatal("Failed to initialize MongoDB:", err)
	}
	// COMENTADO TEMPORALMENTE - puede estar causando el crash
	// defer db.Close()

	// Crear índices
	if err := db.CreateIndexes(); err != nil {
		log.Fatal("Failed to create indexes:", err)
	}

	// Configurar rutas
	router := routes.SetupRoutes()

	// Configurar servidor HTTP
	server := &http.Server{
		Addr:         config.GetHTTPPort(),
		Handler:      router,
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
	}

	log.Printf("Servidor de servicios turísticos escuchando en %s", config.GetServerAddress())
	log.Fatal(server.ListenAndServe())
}
