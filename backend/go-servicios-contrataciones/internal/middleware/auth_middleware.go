package middleware

import (
	"backend-golang-rest/internal/config"
	"backend-golang-rest/internal/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Claims estructura para los claims del JWT
type Claims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Username string `json:"username"`
	Exp      int64  `json:"exp"`
	Iat      int64  `json:"iat"`
	Nbf      int64  `json:"nbf"`
}

// AuthMiddleware middleware para validar JWT
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Obtener el token del header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "Authorization header required")
			return
		}

		// Verificar que el header tenga el formato correcto
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "Invalid authorization header format")
			return
		}

		tokenString := tokenParts[1]

		// Validar el token
		claims, err := validateToken(tokenString)
		if err != nil {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "Invalid token: "+err.Error())
			return
		}

		// Agregar los claims al contexto
		ctx := context.WithValue(r.Context(), "user", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// OptionalAuthMiddleware middleware opcional para JWT (no falla si no hay token)
func OptionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader != "" {
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) == 2 && tokenParts[0] == "Bearer" {
				if claims, err := validateToken(tokenParts[1]); err == nil {
					ctx := context.WithValue(r.Context(), "user", claims)
					r = r.WithContext(ctx)
				}
			}
		}

		next.ServeHTTP(w, r)
	})
}

// AdminMiddleware middleware para verificar rol de administrador
func AdminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, ok := r.Context().Value("user").(*Claims)
		if !ok {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "User not authenticated")
			return
		}

		if user.Role != "admin" {
			utils.WriteErrorResponse(w, http.StatusForbidden, "Admin access required")
			return
		}

		next.ServeHTTP(w, r)
	})
}

// validateToken valida un token JWT y devuelve los claims
func validateToken(tokenString string) (*Claims, error) {
	// Implementación simplificada para evitar dependencias externas
	// En un entorno real, usarías una librería JWT como github.com/golang-jwt/jwt/v5
	cfg := config.LoadConfig()

	// Validación básica del token (implementación simplificada)
	if tokenString == "" {
		return nil, fmt.Errorf("token vacío")
	}

	// Aquí iría la validación real del JWT
	// Por ahora, retornamos un claim de prueba
	claims := &Claims{
		UserID:   "1",
		Email:    "admin@turisticos.com",
		Role:     "admin",
		Username: "admin",
		Exp:      time.Now().Add(time.Duration(cfg.JWT.ExpirationHours) * time.Hour).Unix(),
		Iat:      time.Now().Unix(),
		Nbf:      time.Now().Unix(),
	}

	return claims, nil
}

// GenerateToken genera un nuevo token JWT
func GenerateToken(userID, email, role, username string) (string, error) {
	cfg := config.LoadConfig()

	// Implementación simplificada para evitar dependencias externas
	// En un entorno real, usarías una librería JWT como github.com/golang-jwt/jwt/v5
	claims := &Claims{
		UserID:   userID,
		Email:    email,
		Role:     role,
		Username: username,
		Exp:      time.Now().Add(time.Duration(cfg.JWT.ExpirationHours) * time.Hour).Unix(),
		Iat:      time.Now().Unix(),
		Nbf:      time.Now().Unix(),
	}

	// Por ahora, retornamos un token simplificado
	// En producción, usarías jwt.NewWithClaims y token.SignedString
	token := fmt.Sprintf("token_%s_%d", userID, claims.Exp)
	return token, nil
}

// GetUserFromContext obtiene el usuario del contexto
func GetUserFromContext(ctx context.Context) (*Claims, bool) {
	user, ok := ctx.Value("user").(*Claims)
	return user, ok
}

// LoginRequest estructura para el login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse estructura para la respuesta del login
type LoginResponse struct {
	Token     string `json:"token"`
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	Username  string `json:"username"`
	ExpiresAt int64  `json:"expires_at"`
}

// HandleLogin maneja el proceso de login
func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var loginReq LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Aquí deberías validar las credenciales contra tu base de datos
	// Por ahora, usaremos credenciales hardcodeadas para el ejemplo
	if loginReq.Email == "admin@turisticos.com" && loginReq.Password == "admin123" {
		token, err := GenerateToken("1", loginReq.Email, "admin", "admin")
		if err != nil {
			utils.WriteErrorResponse(w, http.StatusInternalServerError, "Error generating token")
			return
		}

		cfg := config.LoadConfig()
		response := LoginResponse{
			Token:     token,
			UserID:    "1",
			Email:     loginReq.Email,
			Role:      "admin",
			Username:  "admin",
			ExpiresAt: time.Now().Add(time.Duration(cfg.JWT.ExpirationHours) * time.Hour).Unix(),
		}

		utils.WriteJSONResponse(w, http.StatusOK, response)
		return
	}

	utils.WriteErrorResponse(w, http.StatusUnauthorized, "Invalid credentials")
}
