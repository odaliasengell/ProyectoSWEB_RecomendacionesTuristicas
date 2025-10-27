package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

// WebSocketConfig configuración para WebSocket
type WebSocketConfig struct {
	URL string
}

// NotificationPayload estructura de notificación
type NotificationPayload struct {
	Event     string      `json:"event"`
	Data      interface{} `json:"data"`
	Room      string      `json:"room,omitempty"`
	Source    string      `json:"source"`
	Timestamp string      `json:"timestamp"`
}

var wsConfig = initWebSocketConfig()

func initWebSocketConfig() WebSocketConfig {
	url := os.Getenv("WEBSOCKET_URL")
	if url == "" {
		url = "http://localhost:4001"
	}
	return WebSocketConfig{URL: url}
}

// NotifyWebSocket envía una notificación al servidor WebSocket
func NotifyWebSocket(event string, data interface{}, room string) error {
	payload := NotificationPayload{
		Event:     event,
		Data:      data,
		Room:      room,
		Source:    "golang_api",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Printf("❌ Error al serializar JSON: %v", err)
		return err
	}

	resp, err := http.Post(
		fmt.Sprintf("%s/notify", wsConfig.URL),
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		log.Printf("❌ Error al conectar con WebSocket: %v", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("websocket error: %d", resp.StatusCode)
	}

	log.Printf("✅ Evento '%s' enviado a WebSocket", event)
	return nil
}

// ==========================================
// FUNCIONES ESPECÍFICAS POR TIPO DE EVENTO
// ==========================================

// NotifyServicioEvent notifica un evento de servicio
func NotifyServicioEvent(eventType string, servicioID string, servicioName string, precio float64) error {
	data := map[string]interface{}{
		"servicio_id": servicioID,
		"nombre":      servicioName,
		"precio":      precio,
	}

	return NotifyWebSocket(eventType, data, "servicios")
}

// NotifyContratacionEvent notifica un evento de contratación
func NotifyContratacionEvent(
	eventType string,
	contratacionID string,
	servicioID string,
	estado string,
	monto float64,
) error {
	data := map[string]interface{}{
		"contratacion_id": contratacionID,
		"servicio_id":     servicioID,
		"estado":          estado,
		"monto":           monto,
	}

	return NotifyWebSocket(eventType, data, "servicios")
}

// NotifyAdminAlert notifica una alerta al panel admin
func NotifyAdminAlert(titulo string, mensaje string, tipoAlerta string) error {
	data := map[string]interface{}{
		"titulo":  titulo,
		"mensaje": mensaje,
		"tipo":    tipoAlerta,
		"origen":  "golang_api",
	}

	return NotifyWebSocket("admin_alert", data, "admin_panel")
}

/*
// ==========================================
// EJEMPLOS DE USO EN HANDLERS
// ==========================================

// En internal/handlers/contratacion_handler.go

func CreateContratacion(c *gin.Context) {
	var input struct {
		ServicioID  string  `json:"servicio_id" binding:"required"`
		MontoTotal  float64 `json:"monto_total" binding:"required"`
		Descripcion string  `json:"descripcion"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Crear contratación
	contratacion := &models.Contratacion{
		ServiceID:  input.ServicioID,
		Amount:     input.MontoTotal,
		Status:     "pendiente",
		CreatedAt:  time.Now(),
	}

	// Guardar en BD...
	result := db.Collection("contrataciones").InsertOne(context.Background(), contratacion)
	if result.Err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Err.Error()})
		return
	}

	// ✨ NOTIFICAR EVENTO
	err := services.NotifyContratacionEvent(
		"contratacion_created",
		result.InsertedID.(primitive.ObjectID).Hex(),
		input.ServicioID,
		"pendiente",
		input.MontoTotal,
	)
	if err != nil {
		log.Printf("⚠️  Error notificando WebSocket: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Contratación creada",
		"data":    contratacion,
	})
}

func UpdateContratacion(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Actualizar en BD...
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bson.M{"status": input.Status}}

	result, err := db.Collection("contrataciones").UpdateOne(context.Background(), filter, update)
	if err != nil || result.ModifiedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating"})
		return
	}

	// ✨ NOTIFICAR EVENTO
	services.NotifyContratacionEvent(
		"contratacion_updated",
		id,
		"", // servicioID no lo tenemos aquí, podría obtenerse de la BD
		input.Status,
		0,
	)

	c.JSON(http.StatusOK, gin.H{"message": "Contratación actualizada"})
}

func DeleteContratacion(c *gin.Context) {
	id := c.Param("id")

	// Eliminar de BD...
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}

	result, err := db.Collection("contrataciones").DeleteOne(context.Background(), filter)
	if err != nil || result.DeletedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting"})
		return
	}

	// ✨ NOTIFICAR EVENTO
	services.NotifyContratacionEvent(
		"contratacion_deleted",
		id,
		"",
		"eliminado",
		0,
	)

	c.JSON(http.StatusOK, gin.H{"message": "Contratación eliminada"})
}

func CompleteContratacion(c *gin.Context) {
	id := c.Param("id")

	// Actualizar estado a completado
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bson.M{"status": "completado"}}

	result, err := db.Collection("contrataciones").UpdateOne(context.Background(), filter, update)
	if err != nil || result.ModifiedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating"})
		return
	}

	// ✨ NOTIFICAR EVENTO
	services.NotifyContratacionEvent(
		"contratacion_completed",
		id,
		"",
		"completado",
		0,
	)

	// ✨ NOTIFICAR ALERTA AL ADMIN
	services.NotifyAdminAlert(
		"Contratación Completada",
		fmt.Sprintf("La contratación %s ha sido completada exitosamente", id),
		"success",
	)

	c.JSON(http.StatusOK, gin.H{"message": "Contratación completada"})
}

// En internal/handlers/servicio_handler.go

func CreateServicio(c *gin.Context) {
	var input struct {
		Nombre      string  `json:"nombre" binding:"required"`
		Descripcion string  `json:"descripcion"`
		Precio      float64 `json:"precio" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	servicio := &models.Servicio{
		ID:          primitive.NewObjectID().Hex(),
		Name:        input.Nombre,
		Description: input.Descripcion,
		Price:       input.Precio,
		CreatedAt:   time.Now(),
	}

	// Guardar en BD...

	// ✨ NOTIFICAR EVENTO
	services.NotifyServicioEvent(
		"servicio_created",
		servicio.ID,
		input.Nombre,
		input.Precio,
	)

	c.JSON(http.StatusOK, servicio)
}

func DeleteServicio(c *gin.Context) {
	id := c.Param("id")

	// Obtener servicio antes de eliminar (para notificar)
	// ...

	// Eliminar de BD...

	// ✨ NOTIFICAR EVENTO
	services.NotifyServicioEvent(
		"servicio_deleted",
		id,
		"",
		0,
	)

	c.JSON(http.StatusOK, gin.H{"message": "Servicio eliminado"})
}
*/
