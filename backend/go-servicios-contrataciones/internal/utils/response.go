package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// APIResponse estructura estándar para respuestas de la API
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Code    int         `json:"code,omitempty"`
}

// PaginatedResponse estructura para respuestas paginadas
type PaginatedResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message,omitempty"`
	Data    interface{}    `json:"data,omitempty"`
	Meta    PaginationMeta `json:"meta"`
}

// PaginationMeta metadatos de paginación
type PaginationMeta struct {
	Page       int  `json:"page"`
	PerPage    int  `json:"per_page"`
	Total      int  `json:"total"`
	TotalPages int  `json:"total_pages"`
	HasNext    bool `json:"has_next"`
	HasPrev    bool `json:"has_prev"`
}

// WriteJSONResponse escribe una respuesta JSON
func WriteJSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "Error encoding JSON response", http.StatusInternalServerError)
	}
}

// WriteSuccessResponse escribe una respuesta de éxito
func WriteSuccessResponse(w http.ResponseWriter, message string, data interface{}) {
	response := APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
	WriteJSONResponse(w, http.StatusOK, response)
}

// WriteCreatedResponse escribe una respuesta de creación exitosa
func WriteCreatedResponse(w http.ResponseWriter, message string, data interface{}) {
	response := APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
	WriteJSONResponse(w, http.StatusCreated, response)
}

// WriteErrorResponse escribe una respuesta de error
func WriteErrorResponse(w http.ResponseWriter, statusCode int, message string) {
	response := APIResponse{
		Success: false,
		Error:   message,
		Code:    statusCode,
	}
	WriteJSONResponse(w, statusCode, response)
}

// WriteValidationErrorResponse escribe una respuesta de error de validación
func WriteValidationErrorResponse(w http.ResponseWriter, message string, errors map[string]string) {
	response := map[string]interface{}{
		"success": false,
		"error":   "Validation Error",
		"message": message,
		"errors":  errors,
		"code":    http.StatusUnprocessableEntity,
	}
	WriteJSONResponse(w, http.StatusUnprocessableEntity, response)
}

// WritePaginatedResponse escribe una respuesta paginada
func WritePaginatedResponse(w http.ResponseWriter, message string, data interface{}, page, perPage, total int) {
	totalPages := (total + perPage - 1) / perPage

	response := PaginatedResponse{
		Success: true,
		Message: message,
		Data:    data,
		Meta: PaginationMeta{
			Page:       page,
			PerPage:    perPage,
			Total:      total,
			TotalPages: totalPages,
			HasNext:    page < totalPages,
			HasPrev:    page > 1,
		},
	}
	WriteJSONResponse(w, http.StatusOK, response)
}

// WriteNotFoundResponse escribe una respuesta de recurso no encontrado
func WriteNotFoundResponse(w http.ResponseWriter, resource string) {
	message := "Resource not found"
	if resource != "" {
		message = resource + " not found"
	}
	WriteErrorResponse(w, http.StatusNotFound, message)
}

// WriteUnauthorizedResponse escribe una respuesta de no autorizado
func WriteUnauthorizedResponse(w http.ResponseWriter, message string) {
	if message == "" {
		message = "Unauthorized access"
	}
	WriteErrorResponse(w, http.StatusUnauthorized, message)
}

// WriteForbiddenResponse escribe una respuesta de acceso prohibido
func WriteForbiddenResponse(w http.ResponseWriter, message string) {
	if message == "" {
		message = "Access forbidden"
	}
	WriteErrorResponse(w, http.StatusForbidden, message)
}

// WriteBadRequestResponse escribe una respuesta de petición incorrecta
func WriteBadRequestResponse(w http.ResponseWriter, message string) {
	if message == "" {
		message = "Bad request"
	}
	WriteErrorResponse(w, http.StatusBadRequest, message)
}

// WriteInternalServerErrorResponse escribe una respuesta de error interno del servidor
func WriteInternalServerErrorResponse(w http.ResponseWriter, message string) {
	if message == "" {
		message = "Internal server error"
	}
	WriteErrorResponse(w, http.StatusInternalServerError, message)
}

// WriteConflictResponse escribe una respuesta de conflicto
func WriteConflictResponse(w http.ResponseWriter, message string) {
	if message == "" {
		message = "Resource conflict"
	}
	WriteErrorResponse(w, http.StatusConflict, message)
}

// WriteTooManyRequestsResponse escribe una respuesta de demasiadas peticiones
func WriteTooManyRequestsResponse(w http.ResponseWriter, message string) {
	if message == "" {
		message = "Too many requests"
	}
	WriteErrorResponse(w, http.StatusTooManyRequests, message)
}

// WriteServiceUnavailableResponse escribe una respuesta de servicio no disponible
func WriteServiceUnavailableResponse(w http.ResponseWriter, message string) {
	if message == "" {
		message = "Service unavailable"
	}
	WriteErrorResponse(w, http.StatusServiceUnavailable, message)
}

// HealthCheckResponse estructura para respuestas de health check
type HealthCheckResponse struct {
	Status    string                 `json:"status"`
	Message   string                 `json:"message"`
	Timestamp string                 `json:"timestamp"`
	Version   string                 `json:"version"`
	Services  map[string]interface{} `json:"services,omitempty"`
}

// WriteHealthCheckResponse escribe una respuesta de health check
func WriteHealthCheckResponse(w http.ResponseWriter, status string, message string, services map[string]interface{}) {
	response := HealthCheckResponse{
		Status:    status,
		Message:   message,
		Timestamp: getCurrentTimestamp(),
		Version:   "1.0.0",
		Services:  services,
	}

	statusCode := http.StatusOK
	if status != "healthy" {
		statusCode = http.StatusServiceUnavailable
	}

	WriteJSONResponse(w, statusCode, response)
}

// getCurrentTimestamp devuelve el timestamp actual en formato RFC3339
func getCurrentTimestamp() string {
	return time.Now().Format(time.RFC3339)
}

// CORSHeaders configura los headers CORS
func CORSHeaders(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if origin == "" {
		origin = "*"
	}

	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Max-Age", "86400")
}

// HandleOptions maneja peticiones OPTIONS para CORS
func HandleOptions(w http.ResponseWriter, r *http.Request) {
	CORSHeaders(w, r)
	w.WriteHeader(http.StatusOK)
}

// SetCacheHeaders configura headers de caché
func SetCacheHeaders(w http.ResponseWriter, maxAge int) {
	w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d", maxAge))
	w.Header().Set("Expires", time.Now().Add(time.Duration(maxAge)*time.Second).Format(http.TimeFormat))
}

// SetNoCacheHeaders configura headers para evitar caché
func SetNoCacheHeaders(w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
}

// SetSecurityHeaders configura headers de seguridad
func SetSecurityHeaders(w http.ResponseWriter) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Frame-Options", "DENY")
	w.Header().Set("X-XSS-Protection", "1; mode=block")
	w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
	w.Header().Set("Content-Security-Policy", "default-src 'self'")
}
