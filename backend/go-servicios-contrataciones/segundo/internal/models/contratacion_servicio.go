package models

import "time"

type ContratacionServicio struct {
	ID                uint      `json:"id"`
	ServicioID        uint      `json:"servicio_id"`
	FechaContratacion time.Time `json:"fecha_contratacion"`
	FechaInicio       time.Time `json:"fecha_inicio"`
	FechaFin          time.Time `json:"fecha_fin"`
	NumViajeros       int       `json:"num_viajeros"`
	Moneda            string    `json:"moneda"`
	Total             float64   `json:"total"`
}
