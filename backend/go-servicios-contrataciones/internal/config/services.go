package config

import (
	"fmt"
	"net/http"
	"time"
)

// ServiceURLs contiene las URLs de los servicios externos
type ServiceURLs struct {
	Payment      string
	Notification string
	User         string
	Email        string
	SMS          string
}

// GetServiceURLs devuelve las URLs de los servicios configurados
func GetServiceURLs() *ServiceURLs {
	config := LoadConfig()
	return &ServiceURLs{
		Payment:      config.Services.PaymentServiceURL,
		Notification: config.Services.NotificationServiceURL,
		User:         config.Services.UserServiceURL,
		Email:        getEnv("EMAIL_SERVICE_URL", "http://localhost:8084"),
		SMS:          getEnv("SMS_SERVICE_URL", "http://localhost:8085"),
	}
}

// HTTPClientConfig configuración para el cliente HTTP
type HTTPClientConfig struct {
	Timeout             time.Duration
	MaxIdleConns        int
	MaxIdleConnsPerHost int
	MaxConnsPerHost     int
	IdleConnTimeout     time.Duration
}

// GetHTTPClientConfig devuelve la configuración del cliente HTTP
func GetHTTPClientConfig() *HTTPClientConfig {
	return &HTTPClientConfig{
		Timeout:             time.Duration(getEnvAsInt("HTTP_CLIENT_TIMEOUT", 30)) * time.Second,
		MaxIdleConns:        getEnvAsInt("HTTP_CLIENT_MAX_IDLE_CONNS", 100),
		MaxIdleConnsPerHost: getEnvAsInt("HTTP_CLIENT_MAX_IDLE_CONNS_PER_HOST", 10),
		MaxConnsPerHost:     getEnvAsInt("HTTP_CLIENT_MAX_CONNS_PER_HOST", 10),
		IdleConnTimeout:     time.Duration(getEnvAsInt("HTTP_CLIENT_IDLE_CONN_TIMEOUT", 90)) * time.Second,
	}
}

// CreateHTTPClient crea un cliente HTTP configurado
func CreateHTTPClient() *http.Client {
	config := GetHTTPClientConfig()

	transport := &http.Transport{
		MaxIdleConns:        config.MaxIdleConns,
		MaxIdleConnsPerHost: config.MaxIdleConnsPerHost,
		MaxConnsPerHost:     config.MaxConnsPerHost,
		IdleConnTimeout:     config.IdleConnTimeout,
	}

	return &http.Client{
		Timeout:   config.Timeout,
		Transport: transport,
	}
}

// ServiceEndpoints define los endpoints específicos de cada servicio
type ServiceEndpoints struct {
	Payment      PaymentEndpoints
	Notification NotificationEndpoints
	User         UserEndpoints
}

// PaymentEndpoints endpoints del servicio de pagos
type PaymentEndpoints struct {
	ProcessPayment   string
	RefundPayment    string
	GetPaymentStatus string
}

// NotificationEndpoints endpoints del servicio de notificaciones
type NotificationEndpoints struct {
	SendEmail string
	SendSMS   string
	SendPush  string
}

// UserEndpoints endpoints del servicio de usuarios
type UserEndpoints struct {
	GetUser    string
	CreateUser string
	UpdateUser string
}

// GetServiceEndpoints devuelve los endpoints de los servicios
func GetServiceEndpoints() *ServiceEndpoints {
	urls := GetServiceURLs()

	return &ServiceEndpoints{
		Payment: PaymentEndpoints{
			ProcessPayment:   fmt.Sprintf("%s/api/v1/payments/process", urls.Payment),
			RefundPayment:    fmt.Sprintf("%s/api/v1/payments/refund", urls.Payment),
			GetPaymentStatus: fmt.Sprintf("%s/api/v1/payments/status", urls.Payment),
		},
		Notification: NotificationEndpoints{
			SendEmail: fmt.Sprintf("%s/api/v1/notifications/email", urls.Notification),
			SendSMS:   fmt.Sprintf("%s/api/v1/notifications/sms", urls.Notification),
			SendPush:  fmt.Sprintf("%s/api/v1/notifications/push", urls.Notification),
		},
		User: UserEndpoints{
			GetUser:    fmt.Sprintf("%s/api/v1/users", urls.User),
			CreateUser: fmt.Sprintf("%s/api/v1/users", urls.User),
			UpdateUser: fmt.Sprintf("%s/api/v1/users", urls.User),
		},
	}
}

// ValidateServiceURLs valida que las URLs de los servicios sean accesibles
func ValidateServiceURLs() error {
	urls := GetServiceURLs()
	client := CreateHTTPClient()

	services := map[string]string{
		"Payment Service":      urls.Payment,
		"Notification Service": urls.Notification,
		"User Service":         urls.User,
	}

	for name, url := range services {
		resp, err := client.Get(fmt.Sprintf("%s/health", url))
		if err != nil {
			return fmt.Errorf("service %s (%s) is not accessible: %w", name, url, err)
		}
		resp.Body.Close()
	}

	return nil
}
