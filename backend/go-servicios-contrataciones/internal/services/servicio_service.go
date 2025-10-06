package services

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/repository"
)

func ListServicios() []models.Servicio {
	return repository.FetchServicios()
}

