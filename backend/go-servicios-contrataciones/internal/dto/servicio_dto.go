package dto

type ServicioDTO struct {
	Nombre           string  `json:"nombre"`
	Descripcion      string  `json:"descripcion"`
	Precio           float64 `json:"precio"`
	Categoria        string  `json:"categoria"`
	Destino          string  `json:"destino"`
	DuracionDias     int     `json:"duracion_dias"`
	CapacidadMaxima  int     `json:"capacidad_maxima"`
	Disponible       bool    `json:"disponible"`
	Proveedor        string  `json:"proveedor"`
	TelefonoContacto string  `json:"telefono_contacto"`
	EmailContacto    string  `json:"email_contacto"`
}
