package models

import (
	"time"
)

// Servicio modelo para servicios turísticos
type Servicio struct {
	ID               uint      `json:"id" db:"id"`
	Nombre           string    `json:"nombre" db:"nombre"`
	Descripcion      string    `json:"descripcion" db:"descripcion"`
	Precio           float64   `json:"precio" db:"precio"`
	Categoria        string    `json:"categoria" db:"categoria"`
	Destino          string    `json:"destino" db:"destino"`
	DuracionDias     int       `json:"duracion_dias" db:"duracion_dias"`
	CapacidadMaxima  int       `json:"capacidad_maxima" db:"capacidad_maxima"`
	Disponible       bool      `json:"disponible" db:"disponible"`
	Proveedor        string    `json:"proveedor" db:"proveedor"`
	TelefonoContacto string    `json:"telefono_contacto" db:"telefono_contacto"`
	EmailContacto    string    `json:"email_contacto" db:"email_contacto"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

// CategoriaServicio categorías de servicios turísticos
type CategoriaServicio string

const (
	CategoriaHotel        CategoriaServicio = "hotel"
	CategoriaTour         CategoriaServicio = "tour"
	CategoriaTransporte   CategoriaServicio = "transporte"
	CategoriaRestaurante  CategoriaServicio = "restaurante"
	CategoriaActividad    CategoriaServicio = "actividad"
	CategoriaEvento       CategoriaServicio = "evento"
	CategoriaSpa          CategoriaServicio = "spa"
	CategoriaAventura     CategoriaServicio = "aventura"
	CategoriaCultural     CategoriaServicio = "cultural"
	CategoriaGastronomico CategoriaServicio = "gastronomico"
)

// DestinoServicio destinos turísticos populares
type DestinoServicio string

const (
	DestinoCancun         DestinoServicio = "cancun"
	DestinoPlayaDelCarmen DestinoServicio = "playa_del_carmen"
	DestinoTulum          DestinoServicio = "tulum"
	DestinoCozumel        DestinoServicio = "cozumel"
	DestinoMerida         DestinoServicio = "merida"
	DestinoChichenItza    DestinoServicio = "chichen_itza"
	DestinoIslaMujeres    DestinoServicio = "isla_mujeres"
	DestinoHolbox         DestinoServicio = "holbox"
	DestinoBacalar        DestinoServicio = "bacalar"
	DestinoMahahual       DestinoServicio = "mahahual"
)

// ServicioConDisponibilidad servicio con información de disponibilidad
type ServicioConDisponibilidad struct {
	Servicio
	Disponibilidad []DisponibilidadServicio `json:"disponibilidad"`
}

// DisponibilidadServicio disponibilidad de un servicio en fechas específicas
type DisponibilidadServicio struct {
	Fecha      time.Time `json:"fecha"`
	Disponible bool      `json:"disponible"`
	Precio     float64   `json:"precio"`
	Cupos      int       `json:"cupos"`
}

// ServicioConCalificacion servicio con calificación promedio
type ServicioConCalificacion struct {
	Servicio
	CalificacionPromedio float64 `json:"calificacion_promedio"`
	TotalResenas         int     `json:"total_resenas"`
}

// ServicioFiltros filtros para búsqueda de servicios
type ServicioFiltros struct {
	Categoria   *CategoriaServicio `json:"categoria,omitempty"`
	Destino     *DestinoServicio   `json:"destino,omitempty"`
	PrecioMin   *float64           `json:"precio_min,omitempty"`
	PrecioMax   *float64           `json:"precio_max,omitempty"`
	DuracionMin *int               `json:"duracion_min,omitempty"`
	DuracionMax *int               `json:"duracion_max,omitempty"`
	Disponible  *bool              `json:"disponible,omitempty"`
	Proveedor   *string            `json:"proveedor,omitempty"`
	FechaInicio *time.Time         `json:"fecha_inicio,omitempty"`
	FechaFin    *time.Time         `json:"fecha_fin,omitempty"`
}

// ServicioOrdenamiento opciones de ordenamiento para servicios
type ServicioOrdenamiento string

const (
	OrdenamientoPrecioAsc     ServicioOrdenamiento = "precio_asc"
	OrdenamientoPrecioDesc    ServicioOrdenamiento = "precio_desc"
	OrdenamientoNombreAsc     ServicioOrdenamiento = "nombre_asc"
	OrdenamientoNombreDesc    ServicioOrdenamiento = "nombre_desc"
	OrdenamientoFechaCreacion ServicioOrdenamiento = "fecha_creacion"
	OrdenamientoCalificacion  ServicioOrdenamiento = "calificacion"
	OrdenamientoDuracionAsc   ServicioOrdenamiento = "duracion_asc"
	OrdenamientoDuracionDesc  ServicioOrdenamiento = "duracion_desc"
)

// ServicioBusqueda parámetros de búsqueda de servicios
type ServicioBusqueda struct {
	Filtros      ServicioFiltros      `json:"filtros"`
	Ordenamiento ServicioOrdenamiento `json:"ordenamiento"`
	Pagina       int                  `json:"pagina"`
	PorPagina    int                  `json:"por_pagina"`
	Busqueda     string               `json:"busqueda,omitempty"`
}

// ServicioEstadisticas estadísticas de un servicio
type ServicioEstadisticas struct {
	ServicioID           uint    `json:"servicio_id"`
	TotalContrataciones  int     `json:"total_contrataciones"`
	IngresosTotales      float64 `json:"ingresos_totales"`
	CalificacionPromedio float64 `json:"calificacion_promedio"`
	OcupacionPromedio    float64 `json:"ocupacion_promedio"`
	MesMasPopular        string  `json:"mes_mas_popular"`
}

// ServicioRecomendacion recomendación de servicio basada en preferencias
type ServicioRecomendacion struct {
	Servicio
	PuntuacionRecomendacion float64  `json:"puntuacion_recomendacion"`
	Razones                 []string `json:"razones"`
}
