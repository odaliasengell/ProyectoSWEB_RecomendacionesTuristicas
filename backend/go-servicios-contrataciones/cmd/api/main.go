package main

import (
	"backend-golang-rest/internal/config"
	"backend-golang-rest/internal/db"
	"backend-golang-rest/internal/routes"
	"log"
	"net/http"
	"time"
)

func main() {
	// Cargar configuración
	cfg := config.LoadConfig()
	log.Printf("Starting server in %s mode", cfg.Server.Environment)

	// Inicializar DB para repositorios
	dataSourceName := config.GetDatabaseURL()
	_, err := db.Init(dataSourceName)
	if err != nil {
		log.Fatal("Failed to initialize repository database:", err)
	}
	defer db.Close()

	// Ejecutar migraciones solo con el sistema db (no config)
	// La migración de config tiene restricciones conflictivas
	if err := db.Migrate(db.Get()); err != nil {
		log.Fatal("Failed to run repository migrations:", err)
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
