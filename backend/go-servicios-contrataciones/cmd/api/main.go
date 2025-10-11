package main

import (
	"backend-golang-rest/internal/config"
	"backend-golang-rest/internal/routes"
	"log"
	"net/http"
	"time"
)

func main() {
	// Cargar configuración
	cfg := config.LoadConfig()
	log.Printf("Starting server in %s mode", cfg.Server.Environment)

	// Inicializar base de datos
	database, err := config.InitDatabase()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer config.CloseDB()

	// Ejecutar migraciones
	if err := config.Migrate(database); err != nil {
		log.Fatal("Failed to run migrations:", err)
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
