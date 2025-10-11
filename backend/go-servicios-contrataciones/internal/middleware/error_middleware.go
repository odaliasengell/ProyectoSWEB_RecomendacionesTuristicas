package middleware

import (
	"backend-golang-rest/internal/config"
	"backend-golang-rest/internal/utils"
	"log"
	"net/http"
	"runtime/debug"
	"time"
)

// ErrorResponse estructura para respuestas de error
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    int    `json:"code"`
	Path    string `json:"path,omitempty"`
}

// PanicRecoveryMiddleware middleware para recuperarse de pánicos
func PanicRecoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic recovered: %v\n%s", err, debug.Stack())

				cfg := config.LoadConfig()
				errorResp := ErrorResponse{
					Error:   "Internal Server Error",
					Message: "An unexpected error occurred",
					Code:    http.StatusInternalServerError,
					Path:    r.URL.Path,
				}

				// En desarrollo, mostrar más detalles del error
				if cfg.Server.Environment == "development" {
					errorResp.Message = "Panic recovered: " + toString(err)
				}

				utils.WriteJSONResponse(w, http.StatusInternalServerError, errorResp)
			}
		}()

		next.ServeHTTP(w, r)
	})
}

// ErrorHandlerMiddleware middleware para manejo centralizado de errores
func ErrorHandlerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		wrapped := &errorResponseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(wrapped, r)

		// Manejar errores basados en el status code
		if wrapped.statusCode >= 400 {
			handleHTTPError(w, r, wrapped.statusCode, wrapped.errorMessage)
		}
	})
}

// errorResponseWriter wrapper para capturar errores
type errorResponseWriter struct {
	http.ResponseWriter
	statusCode     int
	errorMessage   string
	headersWritten bool
}

func (erw *errorResponseWriter) WriteHeader(code int) {
	if !erw.headersWritten {
		erw.statusCode = code
		erw.headersWritten = true
		erw.ResponseWriter.WriteHeader(code)
	}
}

func (erw *errorResponseWriter) Write(data []byte) (int, error) {
	if !erw.headersWritten {
		erw.WriteHeader(http.StatusOK)
	}
	return erw.ResponseWriter.Write(data)
}

// handleHTTPError maneja errores HTTP específicos
func handleHTTPError(w http.ResponseWriter, r *http.Request, statusCode int, message string) {
	cfg := config.LoadConfig()

	errorResp := ErrorResponse{
		Code: statusCode,
		Path: r.URL.Path,
	}

	switch statusCode {
	case http.StatusBadRequest:
		errorResp.Error = "Bad Request"
		errorResp.Message = getDefaultMessage(message, "The request was invalid or malformed")
	case http.StatusUnauthorized:
		errorResp.Error = "Unauthorized"
		errorResp.Message = getDefaultMessage(message, "Authentication required")
	case http.StatusForbidden:
		errorResp.Error = "Forbidden"
		errorResp.Message = getDefaultMessage(message, "Access denied")
	case http.StatusNotFound:
		errorResp.Error = "Not Found"
		errorResp.Message = getDefaultMessage(message, "The requested resource was not found")
	case http.StatusMethodNotAllowed:
		errorResp.Error = "Method Not Allowed"
		errorResp.Message = getDefaultMessage(message, "The HTTP method is not allowed for this resource")
	case http.StatusConflict:
		errorResp.Error = "Conflict"
		errorResp.Message = getDefaultMessage(message, "The request conflicts with the current state")
	case http.StatusUnprocessableEntity:
		errorResp.Error = "Unprocessable Entity"
		errorResp.Message = getDefaultMessage(message, "The request was well-formed but contains semantic errors")
	case http.StatusTooManyRequests:
		errorResp.Error = "Too Many Requests"
		errorResp.Message = getDefaultMessage(message, "Rate limit exceeded")
	case http.StatusInternalServerError:
		errorResp.Error = "Internal Server Error"
		if cfg.Server.Environment == "development" {
			errorResp.Message = getDefaultMessage(message, "An internal server error occurred")
		} else {
			errorResp.Message = "An unexpected error occurred"
		}
	case http.StatusServiceUnavailable:
		errorResp.Error = "Service Unavailable"
		errorResp.Message = getDefaultMessage(message, "The service is temporarily unavailable")
	default:
		errorResp.Error = "Unknown Error"
		errorResp.Message = getDefaultMessage(message, "An unknown error occurred")
	}

	// Log del error
	logHTTPErrorMiddleware(r, statusCode, errorResp.Message)

	utils.WriteJSONResponse(w, statusCode, errorResp)
}

// getDefaultMessage devuelve un mensaje por defecto si el mensaje está vacío
func getDefaultMessage(message, defaultMessage string) string {
	if message == "" {
		return defaultMessage
	}
	return message
}

// logHTTPErrorMiddleware registra información del error HTTP
func logHTTPErrorMiddleware(r *http.Request, statusCode int, message string) {
	errorLog := map[string]interface{}{
		"timestamp":   getCurrentTimestamp(),
		"level":       "ERROR",
		"method":      r.Method,
		"path":        r.URL.Path,
		"status_code": statusCode,
		"message":     message,
		"ip":          getClientIP(r),
		"user_agent":  r.UserAgent(),
	}

	log.Printf("HTTP_ERROR: %+v", errorLog)
}

// ValidationErrorMiddleware middleware para manejar errores de validación
func ValidationErrorMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		wrapped := &validationResponseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(wrapped, r)

		// Manejar errores de validación específicos
		if wrapped.statusCode == http.StatusUnprocessableEntity {
			handleValidationError(w, r, wrapped.validationErrors)
		}
	})
}

// validationResponseWriter wrapper para errores de validación
type validationResponseWriter struct {
	http.ResponseWriter
	statusCode       int
	validationErrors map[string]string
	headersWritten   bool
}

func (vrw *validationResponseWriter) WriteHeader(code int) {
	if !vrw.headersWritten {
		vrw.statusCode = code
		vrw.headersWritten = true
		vrw.ResponseWriter.WriteHeader(code)
	}
}

func (vrw *validationResponseWriter) Write(data []byte) (int, error) {
	if !vrw.headersWritten {
		vrw.WriteHeader(http.StatusOK)
	}
	return vrw.ResponseWriter.Write(data)
}

// ValidationErrorResponse estructura para errores de validación
type ValidationErrorResponse struct {
	Error   string            `json:"error"`
	Message string            `json:"message"`
	Code    int               `json:"code"`
	Errors  map[string]string `json:"errors,omitempty"`
	Path    string            `json:"path,omitempty"`
}

// handleValidationError maneja errores de validación
func handleValidationError(w http.ResponseWriter, r *http.Request, errors map[string]string) {
	errorResp := ValidationErrorResponse{
		Error:   "Validation Error",
		Message: "The request contains validation errors",
		Code:    http.StatusUnprocessableEntity,
		Errors:  errors,
		Path:    r.URL.Path,
	}

	logValidationErrors(r, errors)
	utils.WriteJSONResponse(w, http.StatusUnprocessableEntity, errorResp)
}

// logValidationErrors registra errores de validación
func logValidationErrors(r *http.Request, errors map[string]string) {
	errorLog := map[string]interface{}{
		"timestamp":         getCurrentTimestamp(),
		"level":             "WARN",
		"method":            r.Method,
		"path":              r.URL.Path,
		"status_code":       http.StatusUnprocessableEntity,
		"validation_errors": errors,
		"ip":                getClientIP(r),
	}

	log.Printf("VALIDATION_ERROR: %+v", errorLog)
}

// toString convierte cualquier valor a string
func toString(v interface{}) string {
	switch val := v.(type) {
	case string:
		return val
	case error:
		return val.Error()
	default:
		return "Unknown error type"
	}
}

// getCurrentTimestamp devuelve el timestamp actual en formato RFC3339
func getCurrentTimestamp() string {
	return time.Now().Format(time.RFC3339)
}
