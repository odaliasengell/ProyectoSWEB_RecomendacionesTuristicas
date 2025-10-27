package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ContratacionServicio modelo para contrataciones de servicios turísticos
type ContratacionServicio struct {
	ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	ServicioID        primitive.ObjectID `json:"servicio_id" bson:"servicio_id"`
	ClienteNombre     string             `json:"cliente_nombre" bson:"cliente_nombre"`
	ClienteEmail      string             `json:"cliente_email" bson:"cliente_email"`
	ClienteTelefono   string             `json:"cliente_telefono" bson:"cliente_telefono"`
	FechaContratacion time.Time          `json:"fecha_contratacion" bson:"fecha_contratacion"`
	FechaInicio       time.Time          `json:"fecha_inicio" bson:"fecha_inicio"`
	FechaFin          time.Time          `json:"fecha_fin" bson:"fecha_fin"`
	NumViajeros       int                `json:"num_viajeros" bson:"num_viajeros"`
	Moneda            string             `json:"moneda" bson:"moneda"`
	PrecioUnitario    float64            `json:"precio_unitario" bson:"precio_unitario"`
	Descuento         float64            `json:"descuento" bson:"descuento"`
	Total             float64            `json:"total" bson:"total"`
	Estado            string             `json:"estado" bson:"estado"`
	Notas             string             `json:"notas" bson:"notas"`
	CreatedAt         time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at" bson:"updated_at"`
}

// EstadoContratacion estados de una contratación
type EstadoContratacion string

const (
	EstadoPendiente   EstadoContratacion = "pendiente"
	EstadoConfirmada  EstadoContratacion = "confirmada"
	EstadoPagada      EstadoContratacion = "pagada"
	EstadoEnProgreso  EstadoContratacion = "en_progreso"
	EstadoCompletada  EstadoContratacion = "completada"
	EstadoCancelada   EstadoContratacion = "cancelada"
	EstadoReembolsada EstadoContratacion = "reembolsada"
	EstadoVencida     EstadoContratacion = "vencida"
)

// MonedaContratacion monedas soportadas
type MonedaContratacion string

const (
	MonedaUSD MonedaContratacion = "USD"
	MonedaMXN MonedaContratacion = "MXN"
	MonedaEUR MonedaContratacion = "EUR"
)

// ContratacionConServicio contratación con información del servicio
type ContratacionConServicio struct {
	ContratacionServicio
	Servicio Servicio `json:"servicio"`
}

// ContratacionConDetalles contratación con detalles adicionales
type ContratacionConDetalles struct {
	ContratacionServicio
	Servicio       Servicio                   `json:"servicio"`
	Pagos          []PagoContratacion         `json:"pagos"`
	Notificaciones []NotificacionContratacion `json:"notificaciones"`
	DiasRestantes  int                        `json:"dias_restantes"`
	PuedeCancelar  bool                       `json:"puede_cancelar"`
	PuedeModificar bool                       `json:"puede_modificar"`
}

// PagoContratacion información de pagos de una contratación
type PagoContratacion struct {
	ID               uint      `json:"id"`
	ContratacionID   uint      `json:"contratacion_id"`
	Monto            float64   `json:"monto"`
	Moneda           string    `json:"moneda"`
	MetodoPago       string    `json:"metodo_pago"`
	EstadoPago       string    `json:"estado_pago"`
	ReferenciaPago   string    `json:"referencia_pago"`
	FechaPago        time.Time `json:"fecha_pago"`
	FechaVencimiento time.Time `json:"fecha_vencimiento"`
	CreatedAt        time.Time `json:"created_at"`
}

// NotificacionContratacion notificaciones relacionadas con una contratación
type NotificacionContratacion struct {
	ID             uint      `json:"id"`
	ContratacionID uint      `json:"contratacion_id"`
	Tipo           string    `json:"tipo"`
	Titulo         string    `json:"titulo"`
	Mensaje        string    `json:"mensaje"`
	Enviada        bool      `json:"enviada"`
	FechaEnvio     time.Time `json:"fecha_envio"`
	CreatedAt      time.Time `json:"created_at"`
}

// ContratacionFiltros filtros para búsqueda de contrataciones
type ContratacionFiltros struct {
	ServicioID     *uint               `json:"servicio_id,omitempty"`
	ClienteEmail   *string             `json:"cliente_email,omitempty"`
	Estado         *EstadoContratacion `json:"estado,omitempty"`
	FechaInicio    *time.Time          `json:"fecha_inicio,omitempty"`
	FechaFin       *time.Time          `json:"fecha_fin,omitempty"`
	Moneda         *MonedaContratacion `json:"moneda,omitempty"`
	PrecioMin      *float64            `json:"precio_min,omitempty"`
	PrecioMax      *float64            `json:"precio_max,omitempty"`
	NumViajerosMin *int                `json:"num_viajeros_min,omitempty"`
	NumViajerosMax *int                `json:"num_viajeros_max,omitempty"`
}

// ContratacionOrdenamiento opciones de ordenamiento para contrataciones
type ContratacionOrdenamiento string

const (
	OrdenamientoContratacionFechaAsc  ContratacionOrdenamiento = "fecha_asc"
	OrdenamientoContratacionFechaDesc ContratacionOrdenamiento = "fecha_desc"
	OrdenamientoContratacionTotalAsc  ContratacionOrdenamiento = "total_asc"
	OrdenamientoContratacionTotalDesc ContratacionOrdenamiento = "total_desc"
	OrdenamientoContratacionEstado    ContratacionOrdenamiento = "estado"
	OrdenamientoContratacionCliente   ContratacionOrdenamiento = "cliente"
)

// ContratacionBusqueda parámetros de búsqueda de contrataciones
type ContratacionBusqueda struct {
	Filtros      ContratacionFiltros      `json:"filtros"`
	Ordenamiento ContratacionOrdenamiento `json:"ordenamiento"`
	Pagina       int                      `json:"pagina"`
	PorPagina    int                      `json:"por_pagina"`
	Busqueda     string                   `json:"busqueda,omitempty"`
}

// ContratacionEstadisticas estadísticas de contrataciones
type ContratacionEstadisticas struct {
	TotalContrataciones   int     `json:"total_contrataciones"`
	ContratacionesActivas int     `json:"contrataciones_activas"`
	IngresosTotales       float64 `json:"ingresos_totales"`
	IngresosMesActual     float64 `json:"ingresos_mes_actual"`
	PromedioContratacion  float64 `json:"promedio_contratacion"`
	ServicioMasPopular    string  `json:"servicio_mas_popular"`
	EstadoMasComun        string  `json:"estado_mas_comun"`
	CancelacionesMes      int     `json:"cancelaciones_mes"`
	TasaCancelacion       float64 `json:"tasa_cancelacion"`
}

// ContratacionResumen resumen de una contratación para listados
type ContratacionResumen struct {
	ID             uint      `json:"id"`
	ServicioNombre string    `json:"servicio_nombre"`
	ClienteNombre  string    `json:"cliente_nombre"`
	ClienteEmail   string    `json:"cliente_email"`
	FechaInicio    time.Time `json:"fecha_inicio"`
	FechaFin       time.Time `json:"fecha_fin"`
	NumViajeros    int       `json:"num_viajeros"`
	Total          float64   `json:"total"`
	Moneda         string    `json:"moneda"`
	Estado         string    `json:"estado"`
	CreatedAt      time.Time `json:"created_at"`
}

// ContratacionCalendario información de contratación para calendario
type ContratacionCalendario struct {
	ID             uint      `json:"id"`
	ServicioNombre string    `json:"servicio_nombre"`
	ClienteNombre  string    `json:"cliente_nombre"`
	FechaInicio    time.Time `json:"fecha_inicio"`
	FechaFin       time.Time `json:"fecha_fin"`
	NumViajeros    int       `json:"num_viajeros"`
	Estado         string    `json:"estado"`
	Color          string    `json:"color"`
}

// ContratacionReporte información para reportes
type ContratacionReporte struct {
	ID                uint      `json:"id"`
	ServicioNombre    string    `json:"servicio_nombre"`
	ClienteNombre     string    `json:"cliente_nombre"`
	ClienteEmail      string    `json:"cliente_email"`
	FechaContratacion time.Time `json:"fecha_contratacion"`
	FechaInicio       time.Time `json:"fecha_inicio"`
	FechaFin          time.Time `json:"fecha_fin"`
	NumViajeros       int       `json:"num_viajeros"`
	PrecioUnitario    float64   `json:"precio_unitario"`
	Descuento         float64   `json:"descuento"`
	Total             float64   `json:"total"`
	Moneda            string    `json:"moneda"`
	Estado            string    `json:"estado"`
	Proveedor         string    `json:"proveedor"`
	Destino           string    `json:"destino"`
}
