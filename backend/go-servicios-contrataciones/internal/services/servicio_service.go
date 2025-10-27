package services

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/repository"
	"fmt"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func ListServicios() []models.Servicio {
	fmt.Println("🔵 Service: ListServicios llamado")
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("❌ PANIC en ListServicios service: %v\n", r)
		}
	}()

	result := repository.FetchServicios()
	fmt.Printf("🔵 Service: Retornando %d servicios\n", len(result))
	return result
}

func GetServicioByID(id uint) (*models.Servicio, error) {
	// Si usas uint, necesitas convertir a ObjectID
	// Por ahora, asumiendo que los IDs en la DB son ObjectID de Mongo
	// Podrías necesitar buscar por un campo personalizado si usas IDs numéricos
	servicios := repository.FetchServicios()
	for _, s := range servicios {
		// Esto es temporal - deberías tener un campo id_servicio numérico si lo necesitas
		if s.ID.Hex() == fmt.Sprintf("%024d", id) {
			return &s, nil
		}
	}
	return nil, fmt.Errorf("servicio no encontrado")
}

func CreateServicio(s models.Servicio) (primitive.ObjectID, error) {
	return repository.CreateServicio(s)
}

func UpdateServicio(id primitive.ObjectID, s models.Servicio) error {
	fmt.Printf("🔵 Service: UpdateServicio llamado para ID %s\n", id.Hex())
	return repository.UpdateServicio(id, s)
}

func DeleteServicio(id primitive.ObjectID) error {
	fmt.Printf("🔵 Service: DeleteServicio llamado para ID %s\n", id.Hex())
	return repository.DeleteServicio(id)
}
