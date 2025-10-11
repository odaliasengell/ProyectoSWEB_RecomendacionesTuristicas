package config

import (
	"fmt"
	"os"
)

// GetHTTPPortLegacy devuelve el puerto HTTP con el formato ":<PORT>".
// Usa la variable de entorno PORT, o 8080 por defecto.
// DEPRECATED: Usar GetHTTPPort() de env.go
func GetHTTPPortLegacy() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return fmt.Sprintf(":%s", port)
}
