package middleware

import (
	"backend-golang-rest/internal/config"
	"log"
	"net/http"
	"time"
)

// LoggingMiddleware middleware para logging de requests
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Crear un ResponseWriter personalizado para capturar el status code
		wrapped := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		// Procesar la request
		next.ServeHTTP(wrapped, r)

		// Calcular duración
		duration := time.Since(start)

		// Log de la request
		logRequest(r, wrapped.statusCode, duration)
	})
}

// responseWriter wrapper para capturar el status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// logRequest registra información de la request
func logRequest(r *http.Request, statusCode int, duration time.Duration) {
	cfg := config.LoadConfig()

	// En modo desarrollo, log más detallado
	if cfg.Server.Environment == "development" {
		log.Printf(
			"[%s] %s %s %d %v - IP: %s - User-Agent: %s",
			time.Now().Format("2006-01-02 15:04:05"),
			r.Method,
			r.URL.Path,
			statusCode,
			duration,
			getClientIP(r),
			r.UserAgent(),
		)
	} else {
		// En producción, log más simple
		log.Printf(
			"[%s] %s %s %d %v",
			time.Now().Format("2006-01-02 15:04:05"),
			r.Method,
			r.URL.Path,
			statusCode,
			duration,
		)
	}
}

// getClientIP obtiene la IP real del cliente
func getClientIP(r *http.Request) string {
	// Verificar headers de proxy
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("CF-Connecting-IP"); ip != "" {
		return ip
	}

	// Si no hay headers de proxy, usar RemoteAddr
	return r.RemoteAddr
}

// StructuredLogger middleware para logging estructurado
func StructuredLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		wrapped := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(wrapped, r)

		duration := time.Since(start)

		// Log estructurado en formato JSON
		logStructuredRequest(r, wrapped.statusCode, duration)
	})
}

// logStructuredRequest registra la request en formato estructurado
func logStructuredRequest(r *http.Request, statusCode int, duration time.Duration) {
	cfg := config.LoadConfig()

	logEntry := map[string]interface{}{
		"timestamp":   time.Now().Format(time.RFC3339),
		"method":      r.Method,
		"path":        r.URL.Path,
		"query":       r.URL.RawQuery,
		"status_code": statusCode,
		"duration_ms": duration.Milliseconds(),
		"ip":          getClientIP(r),
		"user_agent":  r.UserAgent(),
		"referer":     r.Referer(),
	}

	// Agregar información adicional en desarrollo
	if cfg.Server.Environment == "development" {
		logEntry["host"] = r.Host
		logEntry["protocol"] = r.Proto
		logEntry["content_length"] = r.ContentLength
	}

	// En un entorno real, podrías usar un logger estructurado como logrus o zap
	log.Printf("REQUEST: %+v", logEntry)
}

// ErrorLogger middleware para logging de errores
func ErrorLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		wrapped := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(wrapped, r)

		// Log errores (4xx y 5xx)
		if wrapped.statusCode >= 400 {
			logHTTPErrorLogger(r, wrapped.statusCode, "HTTP Error")
		}
	})
}

// logHTTPErrorLogger registra información de errores HTTP
func logHTTPErrorLogger(r *http.Request, statusCode int, message string) {
	errorLog := map[string]interface{}{
		"timestamp":   time.Now().Format(time.RFC3339),
		"level":       "ERROR",
		"method":      r.Method,
		"path":        r.URL.Path,
		"status_code": statusCode,
		"ip":          getClientIP(r),
		"user_agent":  r.UserAgent(),
	}

	log.Printf("ERROR: %+v", errorLog)
}

// AccessLogger middleware simple para logging de acceso
func AccessLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		next.ServeHTTP(w, r)

		log.Printf(
			"%s - - [%s] \"%s %s %s\" %d %d \"%s\" \"%s\" %v",
			getClientIP(r),
			time.Now().Format("02/Jan/2006:15:04:05 -0700"),
			r.Method,
			r.URL.Path,
			r.Proto,
			http.StatusOK, // Asumiendo éxito por simplicidad
			0,             // Content length
			r.Referer(),
			r.UserAgent(),
			time.Since(start),
		)
	})
}
