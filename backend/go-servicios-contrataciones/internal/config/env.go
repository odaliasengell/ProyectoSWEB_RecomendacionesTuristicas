package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config contiene todas las configuraciones de la aplicación
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Services ServicesConfig
}

// ServerConfig configuración del servidor
type ServerConfig struct {
	Port         string
	Host         string
	Environment  string
	ReadTimeout  int
	WriteTimeout int
}

// DatabaseConfig configuración de la base de datos
type DatabaseConfig struct {
	Path string
}

// JWTConfig configuración para JWT
type JWTConfig struct {
	SecretKey       string
	ExpirationHours int
}

// ServicesConfig URLs de otros servicios
type ServicesConfig struct {
	PaymentServiceURL      string
	NotificationServiceURL string
	UserServiceURL         string
	WebSocketServerURL     string
}

// LoadConfig carga la configuración desde variables de entorno
func LoadConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Port:         getEnv("PORT", "8080"),
			Host:         getEnv("HOST", "localhost"),
			Environment:  getEnv("ENVIRONMENT", "development"),
			ReadTimeout:  getEnvAsInt("READ_TIMEOUT", 30),
			WriteTimeout: getEnvAsInt("WRITE_TIMEOUT", 30),
		},
		Database: DatabaseConfig{
			Path: getEnv("DB_PATH", "app.db"),
		},
		JWT: JWTConfig{
			SecretKey:       getEnv("JWT_SECRET_KEY", "your-secret-key-change-in-production"),
			ExpirationHours: getEnvAsInt("JWT_EXPIRATION_HOURS", 24),
		},
		Services: ServicesConfig{
			PaymentServiceURL:      getEnv("PAYMENT_SERVICE_URL", "http://localhost:8081"),
			NotificationServiceURL: getEnv("NOTIFICATION_SERVICE_URL", "http://localhost:8082"),
			UserServiceURL:         getEnv("USER_SERVICE_URL", "http://localhost:8083"),
			WebSocketServerURL:     getEnv("WEBSOCKET_SERVER_URL", "http://localhost:8081"),
		},
	}
}

// GetHTTPPort devuelve el puerto HTTP con el formato ":<PORT>"
func GetHTTPPort() string {
	config := LoadConfig()
	return fmt.Sprintf(":%s", config.Server.Port)
}

// GetServerAddress devuelve la dirección completa del servidor
func GetServerAddress() string {
	config := LoadConfig()
	return fmt.Sprintf("%s:%s", config.Server.Host, config.Server.Port)
}

// IsDevelopment indica si la aplicación está en modo desarrollo
func IsDevelopment() bool {
	config := LoadConfig()
	return config.Server.Environment == "development"
}

// IsProduction indica si la aplicación está en modo producción
func IsProduction() bool {
	config := LoadConfig()
	return config.Server.Environment == "production"
}

// getEnv obtiene una variable de entorno o devuelve un valor por defecto
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt obtiene una variable de entorno como entero o devuelve un valor por defecto
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getEnvAsBool obtiene una variable de entorno como booleano o devuelve un valor por defecto
func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}
