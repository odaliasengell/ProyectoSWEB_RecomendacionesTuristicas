package services

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/repository"
)

func ListServicios() []models.Servicio {
	return repository.FetchServicios()
}

func CreateServicio(s models.Servicio) (uint, error) {
	return repository.CreateServicio(s)
}
