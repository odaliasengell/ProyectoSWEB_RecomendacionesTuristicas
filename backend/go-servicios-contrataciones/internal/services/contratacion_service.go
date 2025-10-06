package services

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/repository"
)

func ListContrataciones() []models.ContratacionServicio {
	return repository.FetchContrataciones()
}

