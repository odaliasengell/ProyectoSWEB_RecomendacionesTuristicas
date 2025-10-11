package utils

import (
	"backend-golang-rest/internal/config"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// HTTPClient interfaz para el cliente HTTP
type HTTPClient interface {
	Get(ctx context.Context, url string, headers map[string]string) (*HTTPResponse, error)
	Post(ctx context.Context, url string, body interface{}, headers map[string]string) (*HTTPResponse, error)
	Put(ctx context.Context, url string, body interface{}, headers map[string]string) (*HTTPResponse, error)
	Delete(ctx context.Context, url string, headers map[string]string) (*HTTPResponse, error)
	Patch(ctx context.Context, url string, body interface{}, headers map[string]string) (*HTTPResponse, error)
}

// HTTPResponse estructura para respuestas HTTP
type HTTPResponse struct {
	StatusCode int
	Headers    http.Header
	Body       []byte
}

// Client implementación del cliente HTTP
type Client struct {
	httpClient *http.Client
	baseURL    string
}

// NewHTTPClient crea una nueva instancia del cliente HTTP
func NewHTTPClient(baseURL string) HTTPClient {
	cfg := config.GetHTTPClientConfig()

	transport := &http.Transport{
		MaxIdleConns:        cfg.MaxIdleConns,
		MaxIdleConnsPerHost: cfg.MaxIdleConnsPerHost,
		MaxConnsPerHost:     cfg.MaxConnsPerHost,
		IdleConnTimeout:     cfg.IdleConnTimeout,
	}

	httpClient := &http.Client{
		Timeout:   cfg.Timeout,
		Transport: transport,
	}

	return &Client{
		httpClient: httpClient,
		baseURL:    baseURL,
	}
}

// Get realiza una petición GET
func (c *Client) Get(ctx context.Context, url string, headers map[string]string) (*HTTPResponse, error) {
	return c.doRequest(ctx, http.MethodGet, url, nil, headers)
}

// Post realiza una petición POST
func (c *Client) Post(ctx context.Context, url string, body interface{}, headers map[string]string) (*HTTPResponse, error) {
	return c.doRequest(ctx, http.MethodPost, url, body, headers)
}

// Put realiza una petición PUT
func (c *Client) Put(ctx context.Context, url string, body interface{}, headers map[string]string) (*HTTPResponse, error) {
	return c.doRequest(ctx, http.MethodPut, url, body, headers)
}

// Delete realiza una petición DELETE
func (c *Client) Delete(ctx context.Context, url string, headers map[string]string) (*HTTPResponse, error) {
	return c.doRequest(ctx, http.MethodDelete, url, nil, headers)
}

// Patch realiza una petición PATCH
func (c *Client) Patch(ctx context.Context, url string, body interface{}, headers map[string]string) (*HTTPResponse, error) {
	return c.doRequest(ctx, http.MethodPatch, url, body, headers)
}

// doRequest ejecuta la petición HTTP
func (c *Client) doRequest(ctx context.Context, method, url string, body interface{}, headers map[string]string) (*HTTPResponse, error) {
	// Construir URL completa
	fullURL := c.buildURL(url)

	// Preparar el cuerpo de la petición
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("error marshaling request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	// Crear la petición
	req, err := http.NewRequestWithContext(ctx, method, fullURL, reqBody)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	// Agregar headers por defecto
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "Turismo-Services-Client/1.0")

	// Agregar headers personalizados
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	// Ejecutar la petición
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error executing request: %w", err)
	}
	defer resp.Body.Close()

	// Leer el cuerpo de la respuesta
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	return &HTTPResponse{
		StatusCode: resp.StatusCode,
		Headers:    resp.Header,
		Body:       respBody,
	}, nil
}

// buildURL construye la URL completa
func (c *Client) buildURL(path string) string {
	if c.baseURL == "" {
		return path
	}
	return fmt.Sprintf("%s%s", c.baseURL, path)
}

// ServiceClient cliente específico para servicios externos
type ServiceClient struct {
	client HTTPClient
	config *config.ServiceEndpoints
}

// NewServiceClient crea un cliente para servicios externos
func NewServiceClient() *ServiceClient {
	endpoints := config.GetServiceEndpoints()
	client := NewHTTPClient("")

	return &ServiceClient{
		client: client,
		config: endpoints,
	}
}

// PaymentRequest estructura para peticiones de pago
type PaymentRequest struct {
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	Description string  `json:"description"`
	OrderID     string  `json:"order_id"`
	CustomerID  string  `json:"customer_id"`
}

// PaymentResponse estructura para respuestas de pago
type PaymentResponse struct {
	PaymentID string  `json:"payment_id"`
	Status    string  `json:"status"`
	Amount    float64 `json:"amount"`
	Currency  string  `json:"currency"`
}

// ProcessPayment procesa un pago
func (sc *ServiceClient) ProcessPayment(ctx context.Context, req *PaymentRequest) (*PaymentResponse, error) {
	resp, err := sc.client.Post(ctx, sc.config.Payment.ProcessPayment, req, nil)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("payment service returned status %d: %s", resp.StatusCode, string(resp.Body))
	}

	var paymentResp PaymentResponse
	if err := json.Unmarshal(resp.Body, &paymentResp); err != nil {
		return nil, fmt.Errorf("error unmarshaling payment response: %w", err)
	}

	return &paymentResp, nil
}

// NotificationRequest estructura para notificaciones
type NotificationRequest struct {
	Type    string                 `json:"type"`
	To      string                 `json:"to"`
	Subject string                 `json:"subject"`
	Message string                 `json:"message"`
	Data    map[string]interface{} `json:"data,omitempty"`
}

// NotificationResponse estructura para respuestas de notificación
type NotificationResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
	SentAt string `json:"sent_at"`
}

// SendEmail envía un email
func (sc *ServiceClient) SendEmail(ctx context.Context, req *NotificationRequest) (*NotificationResponse, error) {
	resp, err := sc.client.Post(ctx, sc.config.Notification.SendEmail, req, nil)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("notification service returned status %d: %s", resp.StatusCode, string(resp.Body))
	}

	var notificationResp NotificationResponse
	if err := json.Unmarshal(resp.Body, &notificationResp); err != nil {
		return nil, fmt.Errorf("error unmarshaling notification response: %w", err)
	}

	return &notificationResp, nil
}

// SendSMS envía un SMS
func (sc *ServiceClient) SendSMS(ctx context.Context, req *NotificationRequest) (*NotificationResponse, error) {
	resp, err := sc.client.Post(ctx, sc.config.Notification.SendSMS, req, nil)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("notification service returned status %d: %s", resp.StatusCode, string(resp.Body))
	}

	var notificationResp NotificationResponse
	if err := json.Unmarshal(resp.Body, &notificationResp); err != nil {
		return nil, fmt.Errorf("error unmarshaling notification response: %w", err)
	}

	return &notificationResp, nil
}

// UserRequest estructura para peticiones de usuario
type UserRequest struct {
	Email string `json:"email"`
	Name  string `json:"name"`
	Phone string `json:"phone,omitempty"`
	Role  string `json:"role,omitempty"`
}

// UserResponse estructura para respuestas de usuario
type UserResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
}

// GetUser obtiene información de un usuario
func (sc *ServiceClient) GetUser(ctx context.Context, userID string) (*UserResponse, error) {
	url := fmt.Sprintf("%s/%s", sc.config.User.GetUser, userID)
	resp, err := sc.client.Get(ctx, url, nil)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("user service returned status %d: %s", resp.StatusCode, string(resp.Body))
	}

	var userResp UserResponse
	if err := json.Unmarshal(resp.Body, &userResp); err != nil {
		return nil, fmt.Errorf("error unmarshaling user response: %w", err)
	}

	return &userResp, nil
}

// HealthCheck verifica el estado de los servicios
func (sc *ServiceClient) HealthCheck(ctx context.Context) error {
	services := []string{
		sc.config.Payment.ProcessPayment,
		sc.config.Notification.SendEmail,
		sc.config.User.GetUser,
	}

	for _, service := range services {
		// Convertir URL de endpoint a URL de health check
		healthURL := service[:len(service)-len("/api/v1/")] + "/health"

		resp, err := sc.client.Get(ctx, healthURL, nil)
		if err != nil {
			return fmt.Errorf("service %s is not healthy: %w", healthURL, err)
		}

		if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("service %s returned status %d", healthURL, resp.StatusCode)
		}
	}

	return nil
}
