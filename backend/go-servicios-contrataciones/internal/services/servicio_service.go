package services

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/repository"
)

func ListServicios() []models.Servicio {
	return repository.FetchServicios()
}

func GetServicioByID(id uint) (*models.Servicio, error) {
	return repository.GetServicioByID(id)
}

func CreateServicio(s models.Servicio) (uint, error) {
	return repository.CreateServicio(s)
}
