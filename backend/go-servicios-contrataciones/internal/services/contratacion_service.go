package services

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/repository"
	"time"
)

func ListContrataciones() []models.ContratacionServicio {
	return repository.FetchContrataciones()
}

func CreateContratacion(c models.ContratacionServicio) (uint, error) {
	return repository.CreateContratacion(c)
}

func CalculateTotal(servicioID uint, numViajeros int, inicio, fin time.Time) float64 {
	if numViajeros <= 0 {
		return 0
	}
	// Precio base por servicio
	servicios := repository.FetchServicios()
	var precio float64
	for _, s := range servicios {
		if s.ID == servicioID {
			precio = s.Precio
			break
		}
	}
	if precio == 0 {
		return 0
	}
	dias := int(fin.Sub(inicio).Hours()/24) + 1
	if dias < 1 {
		dias = 1
	}
	return precio * float64(numViajeros) * float64(dias)
}
