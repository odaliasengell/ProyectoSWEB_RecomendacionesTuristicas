package models

import "time"

type ContratacionServicio struct {
	ID                uint      `json:"id"`
	ServicioID        uint      `json:"servicio_id"`
	FechaContratacion time.Time `json:"fecha_contratacion"`
}

