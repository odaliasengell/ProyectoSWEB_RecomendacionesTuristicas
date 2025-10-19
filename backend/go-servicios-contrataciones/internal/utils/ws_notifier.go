package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"backend-golang-rest/internal/config"
)

// WSNotifier permite enviar eventos al servidor WebSocket externo a través de su endpoint REST /notify
type WSNotifier struct {
	client   *http.Client
	baseURL  string
	endpoint string
}

// NewWSNotifier crea un nuevo notificador usando la configuración de entorno
func NewWSNotifier() *WSNotifier {
	// Reutilizamos la configuración del cliente HTTP si en el futuro deseamos customizar
	httpClient := &http.Client{Timeout: 10 * time.Second}
	cfg := config.LoadConfig()

	return &WSNotifier{
		client:   httpClient,
		baseURL:  cfg.Services.WebSocketServerURL,
		endpoint: "/notify",
	}
}

// Notify envía un evento al servidor WebSocket
// event: nombre del evento, data: cualquier payload serializable, room opcional
func (n *WSNotifier) Notify(event string, data any, room *string) error {
	if n == nil || n.client == nil || n.baseURL == "" {
		return fmt.Errorf("ws notifier not properly configured")
	}

	payload := map[string]any{
		"event": event,
		"data":  data,
	}
	if room != nil && *room != "" {
		payload["room"] = *room
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal notify payload: %w", err)
	}

	url := n.baseURL + n.endpoint
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("notify failed with status %d", resp.StatusCode)
	}
	return nil
}

// SafeNotify es igual que Notify pero no rompe el flujo en caso de error; loguea y continúa
func (n *WSNotifier) SafeNotify(event string, data any, room *string) {
	if err := n.Notify(event, data, room); err != nil {
		log.Printf("WS Notify error: %v", err)
	}
}
