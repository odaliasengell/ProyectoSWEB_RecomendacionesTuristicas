package models

type Servicio struct {
	ID           uint    `json:"id"`
	Nombre       string  `json:"nombre"`
	Descripcion  string  `json:"descripcion"`
	Precio       float64 `json:"precio"`
	Categoria    string  `json:"categoria"`
	Destino      string  `json:"destino"`
	DuracionDias int     `json:"duracion_dias"`
}
