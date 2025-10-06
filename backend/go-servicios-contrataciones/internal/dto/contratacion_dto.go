package dto

import "time"

type ContratacionDTO struct {
	ServicioID        uint      `json:"servicio_id"`
	FechaContratacion time.Time `json:"fecha_contratacion"`
}

